# ---------------------------------------------------------------------------
# Zone settings
# ---------------------------------------------------------------------------
# Security and performance settings applied to the Cloudflare zone.
# Gated on var.zone_id so they only apply when a custom domain is configured.
# ---------------------------------------------------------------------------

resource "cloudflare_zone_setting" "ssl" {
  count = var.zone_id != "" ? 1 : 0

  zone_id    = var.zone_id
  setting_id = "ssl"
  value      = "strict"
}

resource "cloudflare_zone_setting" "always_use_https" {
  count = var.zone_id != "" ? 1 : 0

  zone_id    = var.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

# Instructs browsers to only connect over HTTPS for the next max_age seconds.
# Once a browser sees this header it will refuse plain HTTP — there is no
# easy undo, so max_age starts at 300 (5 min) for initial rollout.
# Raise to 31536000 (1 year) once you've confirmed HTTPS is stable.
# preload should only be set true if you intend to submit to browser preload
# lists — that is very hard to undo and affects all subdomains.
resource "cloudflare_zone_setting" "hsts" {
  count = var.zone_id != "" ? 1 : 0

  zone_id    = var.zone_id
  setting_id = "security_header"
  value = jsonencode({
    strict_transport_security = {
      enabled            = true
      max_age            = 300
      include_subdomains = false
      nosniff            = true
      preload            = false
    }
  })
}
