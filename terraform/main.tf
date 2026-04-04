terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ---------------------------------------------------------------------------
# Cloudflare Workers deployment
# ---------------------------------------------------------------------------
# The Worker itself is created and updated via `wrangler deploy` (or
# `npm run deploy`). Terraform is used here for surrounding infrastructure
# such as custom domains, KV namespaces, D1 databases, etc.
#
# To deploy the Worker:
#   source terraform/.env
#   npm run deploy
# ---------------------------------------------------------------------------
