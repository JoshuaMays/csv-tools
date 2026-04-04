# ---------------------------------------------------------------------------
# Cloudflare credentials
# ---------------------------------------------------------------------------

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Workers:Edit and Account:Read permissions."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID (found on the right-hand sidebar of the Cloudflare dashboard)."
  type        = string
}

