# ---------------------------------------------------------------------------
# WAF – block common bot / scanner probe traffic
# ---------------------------------------------------------------------------
# This app is a static-ish Cloudflare Worker with no PHP, no CMS, no admin
# panel, no database UI, and no REST/GraphQL API. None of the paths targeted
# by automated scanners below exist here, so every match is illegitimate.
# Rules run at the edge (http_request_firewall_custom phase) and drop
# matching requests before they consume a Worker invocation.
#
# Gated on var.zone_id so it is only applied when a custom domain zone is
# configured (production). Preview deployments are unaffected.
# ---------------------------------------------------------------------------

resource "cloudflare_ruleset" "block_bot_probes" {
  count = var.zone_id != "" ? 1 : 0

  zone_id = var.zone_id
  name    = "Block common bot and scanner probe traffic"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules = [
    # GraphQL and bare /api probes (e.g. /graphql/api, /api/gql, /api/graphql)
    {
      action      = "block"
      description = "Block probes targeting GraphQL / bare API endpoints"
      enabled     = true
      expression  = "(http.request.uri.path eq \"/api\") or starts_with(http.request.uri.path, \"/api/\") or (http.request.uri.path eq \"/graphql\") or starts_with(http.request.uri.path, \"/graphql/\")"
    },

    # CMS probes + server-side script extensions
    # Merges WordPress/CMS paths and script extension checks into one rule.
    {
      action      = "block"
      description = "Block WordPress/CMS probes and server-side script extension probes"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/wp-\") or starts_with(http.request.uri.path, \"/wp/\") or (http.request.uri.path in {\"/xmlrpc.php\" \"/wp-cron.php\"}) or ends_with(http.request.uri.path, \".php\") or ends_with(http.request.uri.path, \".asp\") or ends_with(http.request.uri.path, \".aspx\") or ends_with(http.request.uri.path, \".jsp\") or ends_with(http.request.uri.path, \".cgi\") or ends_with(http.request.uri.path, \".sh\")"
    },

    # Dotfiles, CI/CD config files, and sensitive file extensions.
    # - Nested .env probes (e.g. /server/.env, /web/.env) caught via known path prefixes
    #   since contains() is not available on Free plan.
    # - ends_with(".env") catches root-level variants like /.env.local
    # - Sensitive extensions: .log, .rb, .py, .properties, .inc, .keys, .map (source maps)
    {
      action      = "block"
      description = "Block dotfile, CI/CD config, and sensitive extension probes"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/.git\") or starts_with(http.request.uri.path, \"/.aws\") or starts_with(http.request.uri.path, \"/.ssh\") or starts_with(http.request.uri.path, \"/.htaccess\") or starts_with(http.request.uri.path, \"/.DS_Store\") or starts_with(http.request.uri.path, \"/.circleci\") or starts_with(http.request.uri.path, \"/.travis\") or starts_with(http.request.uri.path, \"/.bitbucket\") or starts_with(http.request.uri.path, \"/.env\") or ends_with(http.request.uri.path, \".env\") or ends_with(http.request.uri.path, \".log\") or ends_with(http.request.uri.path, \".rb\") or ends_with(http.request.uri.path, \".py\") or ends_with(http.request.uri.path, \".properties\") or ends_with(http.request.uri.path, \".inc\") or ends_with(http.request.uri.path, \".keys\") or ends_with(http.request.uri.path, \".map\")"
    },

    # Admin panels, debug/profiler/management endpoints, and storage paths.
    # Nothing under /storage/, /_profiler/, /manage/, /horizon/, /debug/ is served
    # by this app — all are framework-specific paths from Laravel/Symfony/etc.
    {
      action      = "block"
      description = "Block admin panel, debug, management, and storage path probes"
      enabled     = true
      expression  = "(http.request.uri.path in {\"/admin\" \"/administrator\" \"/phpmyadmin\" \"/pma\" \"/adminer\" \"/db\" \"/sql\" \"/database\" \"/phpinfo\" \"/server-info\"}) or starts_with(http.request.uri.path, \"/admin/\") or starts_with(http.request.uri.path, \"/administrator/\") or starts_with(http.request.uri.path, \"/phpmyadmin/\") or starts_with(http.request.uri.path, \"/pma/\") or starts_with(http.request.uri.path, \"/adminer/\") or starts_with(http.request.uri.path, \"/storage/\") or starts_with(http.request.uri.path, \"/_profiler\") or starts_with(http.request.uri.path, \"/debug/\") or starts_with(http.request.uri.path, \"/manage/\") or starts_with(http.request.uri.path, \"/horizon/\") or starts_with(http.request.uri.path, \"/swagger\")"
    },
  ]
}

# ---------------------------------------------------------------------------
# Rate limiting – block aggressive scanners
# ---------------------------------------------------------------------------
# The bot activity in logs shows 40–50 requests per IP in under 2 seconds.
# Legitimate users browsing this app make ~5–20 requests per page load.
# Free plan only allows a period of 10 seconds. 40 requests per 10 seconds
# (~240/min) is well above any real user's page-load cadence but will catch
# the burst pattern seen in logs (50 requests in under 2 seconds).
#
# Rate limiting rules run in a separate phase (http_ratelimit) and do not
# count against the WAF custom rules limit.
# ---------------------------------------------------------------------------

resource "cloudflare_ruleset" "rate_limit" {
  count = var.zone_id != "" ? 1 : 0

  zone_id = var.zone_id
  name    = "Rate limit aggressive scanners"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules = [
    {
      action      = "block"
      description = "Block IPs exceeding 40 requests per 10 seconds"
      enabled     = true
      expression  = "true"
      ratelimit = {
        characteristics     = ["ip.src", "cf.colo.id"]
        period              = 10
        requests_per_period = 40
        mitigation_timeout  = 10
      }
    }
  ]
}
