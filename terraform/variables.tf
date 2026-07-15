variable "resource_group_name" {
  description = "Resource group created once by terraform-identity-bootstrap.yml."
  type        = string
  default     = "yola-rg"
}

variable "acr_name" {
  description = "Globally unique Azure Container Registry name."
  type        = string
  default     = "yolaprod"
}

variable "acr_sku" {
  description = "Azure Container Registry SKU."
  type        = string
  default     = "Basic"
}

variable "aks_name" {
  description = "AKS cluster name."
  type        = string
  default     = "yola-aks"
}

variable "aks_dns_prefix" {
  description = "AKS DNS prefix."
  type        = string
  default     = "yola"
}

variable "kubernetes_version" {
  description = "AKS Kubernetes version. Empty string lets Azure choose the default."
  type        = string
  default     = null
}

variable "aks_node_vm_size" {
  description = "AKS default node pool VM size."
  type        = string
  default     = "Standard_D2s_v3"
}

variable "aks_node_count" {
  description = "AKS default node count."
  type        = number
  default     = 3
}

variable "aks_node_min_count" {
  description = "Minimum node count for cluster autoscaler."
  type        = number
  default     = 1
}

variable "aks_node_max_count" {
  description = "Maximum node count for cluster autoscaler."
  type        = number
  default     = 3
}

variable "aks_os_disk_size_gb" {
  description = "AKS node OS disk size in GiB."
  type        = number
  default     = 64
}

variable "key_vault_name" {
  description = "Globally unique Key Vault name."
  type        = string
  default     = "yola-kv-prod"
}

variable "key_vault_sku" {
  description = "Key Vault SKU."
  type        = string
  default     = "standard"
}

variable "key_vault_soft_delete_retention_days" {
  description = "Number of days to retain soft-deleted Key Vault objects."
  type        = number
  default     = 7
}

variable "key_vault_purge_protection_enabled" {
  description = "Enable Key Vault purge protection."
  type        = bool
  default     = false
}

variable "public_ip_name" {
  description = "Static public IP reserved for Istio ingress gateway."
  type        = string
  default     = "yola-istio-ingress-pip"
}

variable "public_ip_domain_name_label" {
  description = "Azure DNS label for the Istio ingress public IP. Produces <label>.<region>.cloudapp.azure.com."
  type        = string
  default     = "yola-app"
}

variable "github_ci_identity_name" {
  description = "User-assigned identity created by bootstrap for backend/frontend CI."
  type        = string
  default     = "yola-github-ci"
}

variable "external_secrets_identity_name" {
  description = "User-assigned identity created by bootstrap for External Secrets Operator."
  type        = string
  default     = "yola-external-secrets"
}

variable "tags" {
  description = "Tags to apply to Azure resources."
  type        = map(string)
  default = {
    Project     = "Yola"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

variable "alertmanager_smtp_password" {
  description = "Gmail App Password for Alertmanager SMTP notifications."
  type        = string
  sensitive   = true
  default     = ""
}

variable "alertmanager_telegram_token" {
  description = "Telegram bot token for Alertmanager notifications."
  type        = string
  sensitive   = true
  default     = ""
}
