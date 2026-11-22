#!/usr/bin/env bash
# Offline test for deploy/setup-github-access.sh (fake gcloud, no GCP access).
# Checks: dry run makes no gcloud calls; the condition locks to our repo IDs,
# main, deploy.yml and environment demo; a real run (stubbed) grants only the
# expected roles and never creates a key.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
export CALL_LOG="$TMP/calls" PATH="$TMP:$PATH"
cat > "$TMP/gcloud" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$CALL_LOG"
case "$*" in
  'projects describe '*) echo 999999999999 ;;
  *' describe '*) exit 1 ;;
esac
STUB
chmod +x "$TMP/gcloud"

DRY_RUN=1 bash "$ROOT/deploy/setup-github-access.sh" > "$TMP/dry"
test ! -e "$CALL_LOG" || { echo 'FAIL: dry run called gcloud'; exit 1; }
grep -q "assertion.repository_id == '1447350368' && assertion.repository_owner_id == '316144192' && assertion.ref == 'refs/heads/main'" "$TMP/dry"
grep -q "vienggd/Food-order/.github/workflows/deploy.yml@refs/heads/main" "$TMP/dry"
grep -q "repo:vienggd@316144192/Food-order@1447350368:environment:demo'" "$TMP/dry"
echo 'PASS dry run: no gcloud calls, condition locked to our repo, main, deploy.yml, demo'

PROJECT_ID=stub-project bash "$ROOT/deploy/setup-github-access.sh" > "$TMP/real"
grep -q 'projects add-iam-policy-binding stub-project .*roles/run.developer' "$CALL_LOG"
grep -q 'artifacts repositories add-iam-policy-binding food-order .*roles/artifactregistry.writer' "$CALL_LOG"
grep -q 'iam service-accounts add-iam-policy-binding food-order-runner@stub-project.* .*roles/iam.serviceAccountUser' "$CALL_LOG"
grep -q 'workloadIdentityPools/github-actions/attribute.repository_id/1447350368' "$CALL_LOG"
grep -q 'WIF_PROVIDER        = projects/999999999999/locations/global/workloadIdentityPools/github-actions/providers/github-main' "$TMP/real"
if grep -Eq 'keys create|roles/(owner|editor|secretmanager)' "$CALL_LOG"; then echo 'FAIL: too much access or a key'; exit 1; fi
echo 'PASS real run (stubbed): only the three deployer roles, repo-scoped impersonation, no keys'
