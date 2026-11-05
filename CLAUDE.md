# CLAUDE.md — Food-order (Campus Café Pre-order)

CPE 334 pair project. Customers pre-order food from one campus café; operators accept orders.
The user is learning: explain each step in simple words.

## This repo
- GitHub: `vienggg/Food-order` (public). Partner: `NinjoMUDA`.
- Default branch: `main` (protected: PR + 1 approval). Staging branch for Sprint 1: `sprint-1`.
- Branch names: `feature/F-0x-short-name`, `docs/<part>-short-name`.
- Merge with normal merge commits, never squash (keeps "contract before code" history visible).
- Release tag for Sprint 1: `v0.1.0-sprint1` on the `main` commit.

## Project board
- Board: https://github.com/users/vienggg/projects/4 (number `4`, owner `vienggg`, id `PVT_kwHOEtf6QM4BqYDf`)
- Status field id: `PVTSSF_lAHOEtf6QM4BqYDfzhovdf8`
- Column option ids: Backlog `e17725a1`, Specified `8a27d274`, Started `bfd0853d`, PR Review `20caf965`, Fixing `3292dd06`, Done `9be18e02`
- Move a card:
  `gh project item-edit --project-id PVT_kwHOEtf6QM4BqYDf --id <item-id> --field-id PVTSSF_lAHOEtf6QM4BqYDfzhovdf8 --single-select-option-id <option-id>`
  (find `<item-id>` with `gh project item-list 4 --owner vienggg --format json`)

## Stack and key decisions
- React + Vite + TS (`/client`); Node 24 + Express + TS + Zod (`/server`); PostgreSQL 16 + Prisma.
- Tests: Vitest + Supertest against real Postgres; Playwright for E2E. Docker Compose for local Postgres.
- Auth: DB `sessions` table, httpOnly cookie, 8h expiry, bcrypt; role always from the session.
- Errors: `{ error: { code, message, details } }` — VALIDATION_ERROR 400, UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, INVALID_STATE 409.
- Money is integer satang. Seed password comes from env `SEED_PASSWORD`; never commit it.
- UI screens and states: `docs/ui/ui-spec.md`, wireframes `docs/ui/wireframes.html`.

---

# GitHub rules for Claude

## Tools
- Use the `gh` command for all GitHub work. Do not use screenshots unless I ask for report screenshots.
- On Windows PowerShell 5.1 do not use `&&`. Use `;` or run one command per line.
- Run git commands inside the repo folder, not the parent folder.
- Use simple words with me.

## Board columns
Left to right: Backlog, Specified, Started, PR Review, Fixing, Done.

## Flow for every task
1. Create one GitHub issue for the task and add it to the project board in Backlog.
2. Write the plan and acceptance criteria in the issue. Move the card to Specified.
3. Make the branch from the issue so GitHub links them:
   `gh issue develop <number> --name <branch> --base <staging-branch>`
   Check that the issue shows the branch under "Development". If the branch already existed, link it in the issue sidebar under "Development" on the website. Move the card to Started.
4. Do the work. Write tests first when the task has code. Make small commits. Push the branch.
5. Open a pull request into the staging branch, not main. Put "Closes #<number>" in the description. Move the card to PR Review.
6. Link the issue to the pull request. Closing words do NOT work when the base is not the default branch, so link them by command (same as the "Development" sidebar on the website):
   - Get the ids: `gh api graphql -f query='{repository(owner:"<owner>",name:"<repo>"){issue(number:<n>){id} pullRequest(number:<pr>){id}}}'`
   - Link: `gh api graphql -f query='mutation{addCloseIssueReferences(input:{issueId:"<issue id>",pullRequestIds:["<pr id>"]}){clientMutationId}}'`
   Then check both links:
   - Branch linked: `gh issue develop --list <number>`
   - Pull request linked: `gh api graphql -f query='{repository(owner:"<owner>",name:"<repo>"){issue(number:<n>){closedByPullRequestsReferences(first:5){nodes{number}}}}}'`
   Do not call the task finished until both links show on GitHub.
7. The partner reviews, approves and merges. The author never approves or merges their own pull request.
   - The partner reads the changes and leaves comments, then either approves or requests changes:
     `gh pr review <n> --approve --body "What I checked: ..."` or `gh pr review <n> --request-changes --body "..."`
   - Merge only after the approval, and only by the partner, with a merge commit (never squash): `gh pr merge <n> --merge`
   - After merging, the partner comments on the pull request with what was checked and anything to follow up: `gh pr comment <n> --body "..."`
   - The author replies to every review comment, even when no change is needed (for example "Done in <commit>" or "Kept as is because ...").
   - Check the approval is on GitHub before merging: `gh pr view <n> --json reviewDecision,reviews` must show `APPROVED`.
8. If the reviewer asks for changes, move the card to Fixing. Fix on the same branch, push, reply to each comment, ask the partner to review again, then move the card back to PR Review.
9. After the merge, check on GitHub that it really merged (`gh pr view <n> --json state,mergedAt`). Comment on the issue, move the card to Done and close the issue.
10. At the end, open a pull request from staging into main. After it is merged, tag the release on the main commit.

## Board rules
- Every issue starts in Backlog and moves in order. Never skip a column and never put a new issue straight into Started or Done.
- Move the card right after each step happens, not at the end. Use `gh project item-edit`.

## Rules I always want
- Do not add "Co-Authored-By: Claude" or "Generated with Claude Code" to commits or pull requests.
- Every issue must be linked to its branch AND to its pull request. Tell me if a link is missing.
- Do local work (files, tests, terminal) without asking me.
- Stop and ask me before anything others can see on GitHub: opening or merging pull requests, creating or closing issues, deleting remote branches, and moving or force-pushing tags.
- If I say stop or wait, do nothing more until I say go.
- Do not ask me questions all the time. Pick the normal choice and tell me what you did.
- Never post passwords, tokens or API keys in comments, commits or chat.
- Before saying something is done, check it on GitHub with `gh`. If a step failed or was skipped, say so.

## Useful commands
- `gh issue create`, `gh issue develop`, `gh issue close`
- `gh pr create --base <staging> --head <branch>`, `gh pr view <n> --json state,mergedAt`
- `gh pr comment <n> --body "..."`
- `gh pr review <n> --approve --body "..."`, `gh pr merge <n> --merge`
- `gh project item-list`, `gh project item-edit`
