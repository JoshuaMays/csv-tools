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
      expression  = "http.request.uri.path matches \"^/(graphql|api)(/|$)\""
      action_parameters = {
        response = {
          status_code  = 404
          content      = "Not found."
          content_type = "text/plain"
        }
      }
    },

    # WordPress / common CMS probes (e.g. /wp-admin, /wp-login.php, /xmlrpc.php)
    {
      action      = "block"
      description = "Block WordPress and CMS endpoint probes"
      enabled     = true
      expression  = "(http.request.uri.path matches \"^/wp[-/]\") or (http.request.uri.path in {\"/xmlrpc.php\" \"/wp-cron.php\"})"
      action_parameters = {
        response = {
          status_code  = 404
          content      = "Not found."
          content_type = "text/plain"
        }
      }
    },

    # PHP / server-side script extension probes
    {
      action      = "block"
      description = "Block probes for PHP, ASP, JSP, and CGI script paths"
      enabled     = true
      expression  = "http.request.uri.path matches \"\\.(php|asp|aspx|jsp|cgi|sh)(\\?|$)\""
      action_parameters = {
        response = {
          status_code  = 404
          content      = "Not found."
          content_type = "text/plain"
        }
      }
    },

    # Sensitive dotfile / hidden directory probes (e.g. /.env, /.git, /.aws)
    # /.well-known is excluded — used for ACME challenges and browser hints.
    {
      action      = "block"
      description = "Block probes for dotfiles and hidden directories"
      enabled     = true
      expression  = "(http.request.uri.path matches \"^/\\.\") and (not http.request.uri.path matches \"^/\\.well-known/\")"
      action_parameters = {
        response = {
          status_code  = 404
          content      = "Not found."
          content_type = "text/plain"
        }
      }
    },

    # Admin / database UI probes (e.g. /admin, /phpmyadmin, /adminer)
    {
      action      = "block"
      description = "Block probes for admin panels and database UIs"
      enabled     = true
      expression  = "http.request.uri.path matches \"^/(admin|administrator|phpmyadmin|pma|adminer|db|sql|database)(/|$)\""
      action_parameters = {
        response = {
          status_code  = 404
          content      = "Not found."
          content_type = "text/plain"
        }
      }
    },
  ]
}
