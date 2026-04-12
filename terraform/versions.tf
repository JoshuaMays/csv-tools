terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # ---------------------------------------------------------------------------
  # Remote state — Cloudflare R2 (S3-compatible)
  # ---------------------------------------------------------------------------
  # Bootstrap (one-time, before first `terraform init`):
  #   wrangler r2 bucket create csv-tools-tfstate
  #
  # The endpoint URL and R2 token credentials are NOT stored here.
  # Supply them at init time:
  #   locally — copy terraform/backend.hcl.example → terraform/backend.hcl
  #             then run: terraform init -backend-config=backend.hcl
  #   in CI   — passed via -backend-config flags (see .github/workflows/deploy.yml)
  # ---------------------------------------------------------------------------
  backend "s3" {
    bucket = "csv-tools-tfstate"
    key    = "terraform.tfstate"
    region = "auto"

    skip_credentials_validation  = true
    skip_metadata_api_check      = true
    skip_region_validation       = true
    skip_requesting_account_id   = true
    force_path_style             = true
  }
}
