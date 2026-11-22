# Lab 5 morning runbook (human steps, in order)

For **vieng** and **ninja**. The code is already written and pushed by the AI agents.
Every command here is run by a person. Never paste a password into a chat, Issue, commit or screenshot.
Take the screenshots listed in each block **while** you do it (see the evidence table in `plan.md` section 6).

Project ID: `cpe334-2026-team33` · Region: `asia-southeast1` · Repo: `vienggd/Food-order`

---

## Block 1 — reviews and merges into `lab-5` (ninja reviews, vieng reviews ninja's)

Merge **in this order**, each with a normal merge commit (`gh pr merge <n> --merge`), after a real review comment:

1. #61 plan (`docs/L5-0-plan`)
2. #71 rule files (`docs/L5-10-agent-rules`)
3. #63 cloud-ready (`feature/L5-2-cloud-ready`) — vieng reviews
4. #64 Docker (`feature/L5-3-docker`) — vieng reviews
5. #65 CI + deploy scripts (`feature/L5-4-ci`) — CI `test-and-docker` must be green (screenshot: C-01)

**Do not merge #68 (`feature/L5-7-auto-deploy`) yet.** It adds `deploy.yml`, which needs the cloud setup from Block 3 first.

## Block 2 — release #1 to `main` (vieng opens, ninja approves)

```powershell
gh pr create --base main --head lab-5 --title "Release: Lab 5 #1 (cloud-ready, Docker, CI)" --label lab5 --body "Release of lab-5: #61 #71 #63 #64 #65"
```

Wait for `test-and-docker` to be green, ninja approves, ninja merges (`--merge`).

## Block 3 — first deploy from Cloud Shell (vieng, guide Episode 5)

Open Cloud Shell in the Console (project `cpe334-2026-team33`).

```bash
export PROJECT_ID=cpe334-2026-team33
export REGION=asia-southeast1
gcloud config set project "$PROJECT_ID"
git clone https://github.com/vienggd/Food-order.git   # or: cd Food-order; git pull
cd Food-order
git rev-parse --short HEAD        # must equal the latest commit on main in GitHub
```

1. **Dry run** (creates nothing — read it with the AI before going on):
   ```bash
   DRY_RUN=1 PROJECT_ID="$PROJECT_ID" REGION="$REGION" bash deploy/deploy.sh --smoke
   ```
2. **Real run** (10–20 min, costs start now; do not cancel):
   ```bash
   PROJECT_ID="$PROJECT_ID" REGION="$REGION" bash deploy/deploy.sh --smoke
   ```
   Passwords are generated and stored in Secret Manager; nothing is printed.
   If it stops at the migration job, copy the last 30 lines (no secrets) to the AI before running again.
3. **Storage auto-increase off** (answer `y`):
   ```bash
   gcloud sql instances patch food-order-pg --no-storage-auto-increase
   ```
4. **Check the app**:
   ```bash
   export SERVICE_URL=$(gcloud run services describe food-order --region "$REGION" --format='value(status.url)')
   echo "$SERVICE_URL"
   curl --fail "$SERVICE_URL/api/health"
   curl --fail "$SERVICE_URL/api/ready"
   SMOKE_EMAIL=smoke@cafe.test SMOKE_PASSWORD="$(gcloud secrets versions access latest --secret=food-order-smoke-password)" python3 deploy/smoke_test.py "$SERVICE_URL"
   ```
   Open the URL in a browser: the login page loads. Sign in as alice (password: read it **privately** with
   `gcloud secrets versions access latest --secret=food-order-seed-password` — no screenshot of that).
5. Console checks + screenshots (guide 5.7): APIs, `food-order-runner` has only Cloud SQL Client,
   Cloud SQL `food-order-pg` (auto-increase off), Secret Manager **names only**, Cloud Run env, Artifact Registry.

## Block 4 — connect GitHub to GCP + merge gate (vieng, guide Episode 6)

1. Still in Cloud Shell (same folder):
   ```bash
   DRY_RUN=1 PROJECT_ID="$PROJECT_ID" bash deploy/setup-github-access.sh   # read it
   PROJECT_ID="$PROJECT_ID" bash deploy/setup-github-access.sh            # for real
   ```
   It prints the four variable values at the end and checks the deployer has **no keys**.
2. On your laptop (PowerShell, repo folder) — environment `demo`, only `main` may deploy:
   ```powershell
   '{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}' | gh api -X PUT repos/vienggd/Food-order/environments/demo --input -
   gh api -X POST repos/vienggd/Food-order/environments/demo/deployment-branch-policies -f name=main -f type=branch
   gh variable set GCP_PROJECT_ID --env demo --body cpe334-2026-team33
   gh variable set GCP_REGION --env demo --body asia-southeast1
   gh variable set WIF_PROVIDER --env demo --body "<value printed by the script>"
   gh variable set WIF_SERVICE_ACCOUNT --env demo --body food-order-deployer@cpe334-2026-team33.iam.gserviceaccount.com
   gh variable set SMOKE_EMAIL --env demo --body smoke@cafe.test
   gh secret set SMOKE_PASSWORD --env demo
   ```
   The last command asks for the value: in Cloud Shell run
   `gcloud secrets versions access latest --secret=food-order-smoke-password`, copy it, paste it into the prompt
   (it is not shown). Then clear the Cloud Shell screen (`clear`).
3. Ruleset `protect-main` (Active, **empty bypass list**, PR + 1 approval, `test-and-docker` required, up to date,
   no deletion, no force push):
   ```powershell
   git checkout docs/L5-9-report; git pull   # the JSON file lives on this branch until #70 merges
   gh api -X POST repos/vienggd/Food-order/rulesets --input docs/labs/lab-05/protect-main.json
   ```
   Check it in Settings → Rulesets (screenshot).

## Block 5 — prove the gate (ninja, guide 6.6, evidence C-02)

```powershell
git checkout main; git pull
git checkout -b test/prove-gate
```
Break one assertion on purpose (for example in `server/tests/app.test.ts`, expect `ok: false`), run `npm test` and see it fail,
commit, push, open a PR **into `main`** (not draft). Wait for red `test-and-docker` → screenshot of
"Merging is blocked". Then **close** the PR (do not merge) and delete the branch.

## Block 6 — first auto deploy (both, guide Episode 7)

1. ninja reviews and merges #68 into `lab-5`.
2. vieng opens release #2 `lab-5 → main`; ninja approves and merges.
3. Actions → **Deploy demo** runs by itself: tests → build → push → migrate → deploy → smoke test. All green.
4. Check the running commit: the run summary shows the image tag (commit SHA) and digest;
   Cloud Run → `food-order` → Revisions shows the same digest (screenshot).

## Block 7 — visible change, release #3 (vieng then ninja, evidence C-06)

1. vieng: PR from `feature/L5-7-deploy-proof` into `lab-5` (login page shows "release 2" note); ninja reviews with a specific comment and merges.
2. vieng opens release #3 → ninja approves and merges → Deploy demo green → the change is on the live URL.

## Block 8 — persistence and rollback (ninja, guide Episode 8, evidence C-05)

1. On the live URL: sign in as alice, place an order; staff accepts or rejects it (one rejection = C-04).
2. Restart: Cloud Run → `food-order` → Edit & deploy new revision (no changes) → order still there.
3. Rollback: Actions → Deploy demo → Run workflow → `image_tag` = full SHA of release #2 → green → order still there, "release 2" note gone.
4. Roll forward: run again with the SHA of release #3 → note back, order still there.

## Block 9 — report (both)

Finish `deployment.md` and the PDF `lab5_sec<section>_<group>.pdf` (#70), tick the Definition of Done in `plan.md`.
Keep the service running until grading ends.
