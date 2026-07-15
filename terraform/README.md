# Terraform

The Terraform layer is split into two stages. Both stages use Azure Blob Storage
as a remote backend. The GitHub Actions workflows create or reuse the backend
storage account and container before running `terraform init`.

Default backend values:

- Resource group: `yola-tfstate-rg`
- Storage account: `yolatfstate2026musa12345`
- Container: `tfstate`
- Region: `swedencentral`
- Bootstrap state key: `bootstrap.tfstate`
- Main infrastructure state key: `prod.terraform.tfstate`

Because Azure Storage Account names are globally unique, set GitHub Variable
`TF_STATE_STORAGE_ACCOUNT` if the default name is already taken.

## Stage A: Identity Bootstrap

Directory: `terraform/bootstrap`

Run once through `.github/workflows/terraform-identity-bootstrap.yml`.

Creates:

- Terraform remote state resource group, storage account, and blob container
- Resource group
- `yola-terraform` user-assigned identity
- `yola-github-ci` user-assigned identity
- `yola-external-secrets` user-assigned identity
- GitHub Actions federated credentials
- Base RBAC for the Terraform identity

The workflow uses a temporary Azure service principal through:

- `AZURE_TEMP_CLIENT_ID`
- `AZURE_TEMP_CLIENT_SECRET`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

After apply, copy these outputs to GitHub Secrets:

- `terraform_client_id` -> `AZURE_TERRAFORM_CLIENT_ID`
- `github_ci_client_id` -> `AZURE_CI_CLIENT_ID`
- `external_secrets_client_id` -> replace the placeholder in `gitops/apps/external-secrets-app.yaml`

## Stage B: Infrastructure

Directory: `terraform`

Run through `.github/workflows/terraform.yml`.

Creates:

- Azure Container Registry
- AKS with OIDC issuer, workload identity, and Azure Disk CSI enabled
- Key Vault with RBAC authorization enabled
- Static Public IP and Azure DNS label for Istio ingress
- ACR pull/push, Key Vault, and Azure Disk role assignments
- Federated identity credential for External Secrets Operator service account

Authentication uses Azure OIDC. No long-lived Terraform client secret is required after Stage A.

The AKS control-plane identity remains `SystemAssigned` by design. Terraform grants ACR pull and Disk Contributor permissions to the cluster kubelet identity on every apply, so recreating the cluster also recreates and reassigns the identity-dependent permissions.

## Local Validation

```bash
cd terraform
terraform fmt -recursive
terraform init
terraform validate
terraform plan
```

For bootstrap validation:

```bash
cd terraform/bootstrap
terraform fmt -recursive
terraform init
terraform validate
terraform plan
```
