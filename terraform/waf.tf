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

    # WordPress / common CMS probes (e.g. /wp-admin, /wp-login.php, /xmlrpc.php)
    {
      action      = "block"
      description = "Block WordPress and CMS endpoint probes"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/wp-\") or starts_with(http.request.uri.path, \"/wp/\") or (http.request.uri.path in {\"/xmlrpc.php\" \"/wp-cron.php\"})"
    },

    # PHP / server-side script extension probes
    # http.request.uri.path never includes the query string so ends_with is sufficient.
    {
      action      = "block"
      description = "Block probes for PHP, ASP, JSP, and CGI script paths"
      enabled     = true
      expression  = "ends_with(http.request.uri.path, \".php\") or ends_with(http.request.uri.path, \".asp\") or ends_with(http.request.uri.path, \".aspx\") or ends_with(http.request.uri.path, \".jsp\") or ends_with(http.request.uri.path, \".cgi\") or ends_with(http.request.uri.path, \".sh\")"
    },

    # Sensitive dotfile probes (e.g. /.env, /.git, /.aws, /.ssh)
    # Enumerating known targets is more precise than a broad starts_with("/." ) on Free plan.
    {
      action      = "block"
      description = "Block probes for dotfiles and hidden directories"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/.env\") or starts_with(http.request.uri.path, \"/.git\") or starts_with(http.request.uri.path, \"/.aws\") or starts_with(http.request.uri.path, \"/.ssh\") or starts_with(http.request.uri.path, \"/.htaccess\") or starts_with(http.request.uri.path, \"/.DS_Store\")"
    },

    # Admin / database UI probes (e.g. /admin, /phpmyadmin, /adminer)
    {
      action      = "block"
      description = "Block probes for admin panels and database UIs"
      enabled     = true
      expression  = "(http.request.uri.path in {\"/admin\" \"/administrator\" \"/phpmyadmin\" \"/pma\" \"/adminer\" \"/db\" \"/sql\" \"/database\"}) or starts_with(http.request.uri.path, \"/admin/\") or starts_with(http.request.uri.path, \"/administrator/\") or starts_with(http.request.uri.path, \"/phpmyadmin/\") or starts_with(http.request.uri.path, \"/pma/\") or starts_with(http.request.uri.path, \"/adminer/\") or starts_with(http.request.uri.path, \"/db/\") or starts_with(http.request.uri.path, \"/sql/\") or starts_with(http.request.uri.path, \"/database/\")"
    },
  ]
}
