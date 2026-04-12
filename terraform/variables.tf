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

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

variable "is_production" {
  description = "Set to true only for production deployments. When false the custom domain resource is skipped entirely, so preview tokens never need Zone > Workers Routes permissions."
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------
# Custom domain
# ---------------------------------------------------------------------------

variable "zone_id" {
  description = "Cloudflare zone ID for the domain you want to attach (found on the Overview tab of your domain in the Cloudflare dashboard)."
  type        = string
  default     = ""
}

variable "custom_domain" {
  description = "Full hostname to assign to the csv-tools Worker (e.g. csvtools.example.com). Set via TF_VAR_custom_domain in CI."
  type        = string
  default     = ""
}

