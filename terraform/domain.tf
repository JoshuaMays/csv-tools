# ---------------------------------------------------------------------------
# Custom domain
# ---------------------------------------------------------------------------
# Attaches the csv-tools Worker to a hostname inside a zone you already
# manage in Cloudflare. Cloudflare creates the DNS record and issues a TLS
# certificate automatically — no additional DNS or SSL permissions needed.
#
# Prerequisites:
#   1. The zone for var.custom_domain must already exist in Cloudflare.
#   2. The Worker script must exist (deployed via `npm run deploy`) before
#      this resource can be applied.
#   3. API token permissions required:
#        Account > Workers Scripts > Edit
#        Zone    > Workers Routes  > Edit  (on the target zone)
#
# This resource is gated behind var.is_production so that preview deployments
# (which use a token without Zone > Workers Routes permissions) are unaffected.
# ---------------------------------------------------------------------------

resource "cloudflare_workers_domain" "custom_domain" {
  count = var.is_production ? 1 : 0

  account_id = var.cloudflare_account_id
  hostname   = var.custom_domain
  service    = "csv-tools"
  zone_id    = var.zone_id
}
