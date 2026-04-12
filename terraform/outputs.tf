# Add outputs here as you provision infrastructure resources
# (e.g. KV namespace IDs, D1 database IDs, custom domain assignments).

output "worker_hostname" {
  description = "The custom hostname assigned to the csv-tools Worker. Empty string when is_production = false."
  value       = var.is_production ? cloudflare_workers_domain.custom_domain[0].hostname : ""
}
