#!/usr/bin/env bash
# ==============================================================================
# Food-order — setup-github-access.sh (Lab 5, guide Episode 6.2 + 6.3)
# ==============================================================================
# WHAT THIS SCRIPT DOES
#   Lets GitHub Actions deploy to Google Cloud WITHOUT any key file
#   (Workload Identity Federation), only from vienggd/Food-order, branch main,
#   workflow deploy.yml, environment demo. Same result as the Console clicks in
#   the student guide 6.2 and 6.3:
#     1. enable IAM Credentials API + Security Token Service API
#     2. create the deployer service account food-order-deployer
#     3. give it: Cloud Run Developer (project), Artifact Registry Writer (our
#        repository only), Service Account User (on food-order-runner only)
#     4. create pool github-actions + OIDC provider github-main with the condition
#     5. let identities from our repository (by ID) act as the deployer
#     6. print the two values for the GitHub variables WIF_PROVIDER and
#        WIF_SERVICE_ACCOUNT, and check the deployer has NO keys
#
# HOW TO RUN (Cloud Shell, after deploy/deploy.sh worked, by the project Owner)
#   DRY_RUN=1 PROJECT_ID=cpe334-2026-team33 bash deploy/setup-github-access.sh   # prints only
#   PROJECT_ID=cpe334-2026-team33 bash deploy/setup-github-access.sh             # for real
#   Safe to run again: things that already exist are skipped.
#
# The repository and owner IDs are public numbers (not secrets). Get them with:
#   gh api repos/vienggd/Food-order --jq '.id, .owner.id'
# The token format is "immutable subject" (use_immutable_subject: true).
# Never create a JSON key for any service account.
# ==============================================================================
set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
REGION="${REGION:-asia-southeast1}"
GITHUB_OWNER="vienggd"
GITHUB_REPO="Food-order"
REPO_ID="1447350368"
OWNER_ID="316144192"
ENV_NAME="demo"

REPO_NAME="food-order"            # Artifact Registry repository (deploy.sh REPO_NAME)
RUNNER_NAME="food-order-runner"   # runtime service account (deploy.sh SA_NAME)
DEPLOYER_NAME="food-order-deployer"
POOL_ID="github-actions"
PROVIDER_ID="github-main"

run_cmd() {
  if [ "$DRY_RUN" = "1" ]; then printf '[DRY_RUN] '; else printf '+ '; fi
  printf '%q ' "$@"
  printf '\n'
  if [ "$DRY_RUN" != "1" ]; then "$@"; fi
}

if [ "$DRY_RUN" = "1" ]; then
  PROJECT_ID="${PROJECT_ID:-example-gcp-project}"
  PROJECT_NUMBER="123456789012"
else
  PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
  [ -n "$PROJECT_ID" ] || { echo "Error: set PROJECT_ID first." >&2; exit 1; }
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
fi

DEPLOYER_EMAIL="${DEPLOYER_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
RUNNER_EMAIL="${RUNNER_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_NAME="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}"
WIF_PROVIDER="${POOL_NAME}/providers/${PROVIDER_ID}"
WIF_CONDITION="assertion.repository_id == '${REPO_ID}' && assertion.repository_owner_id == '${OWNER_ID}' && assertion.ref == 'refs/heads/main' && assertion.workflow_ref == '${GITHUB_OWNER}/${GITHUB_REPO}/.github/workflows/deploy.yml@refs/heads/main' && assertion.sub == 'repo:${GITHUB_OWNER}@${OWNER_ID}/${GITHUB_REPO}@${REPO_ID}:environment:${ENV_NAME}'"

echo "=================================================================="
echo "Food-order: connect GitHub Actions to Google Cloud (no keys)"
echo "Project : ${PROJECT_ID}   Region: ${REGION}   Dry run: ${DRY_RUN}"
echo "Condition: ${WIF_CONDITION}"
echo "=================================================================="

# 1. APIs needed for keyless sign-in
run_cmd gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project "$PROJECT_ID"

# 2. Deployer service account (the identity GitHub Actions uses)
if [ "$DRY_RUN" = "1" ] || ! gcloud iam service-accounts describe "$DEPLOYER_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1; then
  run_cmd gcloud iam service-accounts create "$DEPLOYER_NAME" \
    --display-name="Food-order GitHub deployer" --project "$PROJECT_ID"
fi

# 3. Least-privilege roles for the deployer
run_cmd gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOYER_EMAIL}" --role="roles/run.developer" --condition=None --quiet
run_cmd gcloud artifacts repositories add-iam-policy-binding "$REPO_NAME" \
  --location="$REGION" --member="serviceAccount:${DEPLOYER_EMAIL}" \
  --role="roles/artifactregistry.writer" --project "$PROJECT_ID" --quiet
run_cmd gcloud iam service-accounts add-iam-policy-binding "$RUNNER_EMAIL" \
  --member="serviceAccount:${DEPLOYER_EMAIL}" --role="roles/iam.serviceAccountUser" \
  --project "$PROJECT_ID" --quiet

# 4. Workload Identity pool + GitHub OIDC provider with the attribute condition
if [ "$DRY_RUN" = "1" ] || ! gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  run_cmd gcloud iam workload-identity-pools create "$POOL_ID" \
    --location=global --display-name="github-actions" --project "$PROJECT_ID"
fi
if [ "$DRY_RUN" = "1" ] || ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" --workload-identity-pool="$POOL_ID" --location=global --project "$PROJECT_ID" >/dev/null 2>&1; then
  run_cmd gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --workload-identity-pool="$POOL_ID" --location=global \
    --issuer-uri="https://token.actions.githubusercontent.com/" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository_id=assertion.repository_id" \
    --attribute-condition="$WIF_CONDITION" \
    --project "$PROJECT_ID"
fi

# 5. Only identities from our repository (by ID) may act as the deployer
run_cmd gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_NAME}/attribute.repository_id/${REPO_ID}" \
  --project "$PROJECT_ID" --quiet

# 6. Check: the deployer must have no user-managed keys
if [ "$DRY_RUN" != "1" ]; then
  KEYS="$(gcloud iam service-accounts keys list --iam-account="$DEPLOYER_EMAIL" --managed-by=user --format='value(name)' --project "$PROJECT_ID")"
  [ -z "$KEYS" ] || { echo "ERROR: ${DEPLOYER_NAME} has a key. Delete it; no key should exist." >&2; exit 1; }
  echo "OK: ${DEPLOYER_NAME} has no keys."
fi

printf '\n%s\n' "Put these in GitHub -> Settings -> Environments -> ${ENV_NAME} -> Variables (not secrets):"
printf '%s\n' "  GCP_PROJECT_ID      = ${PROJECT_ID}"
printf '%s\n' "  GCP_REGION          = ${REGION}"
printf '%s\n' "  WIF_PROVIDER        = ${WIF_PROVIDER}"
printf '%s\n' "  WIF_SERVICE_ACCOUNT = ${DEPLOYER_EMAIL}"
