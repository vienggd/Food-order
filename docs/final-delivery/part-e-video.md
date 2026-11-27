# Final Delivery Part E — Final demonstration video plan and script (draft)

Campus Café Pre-order — Team **Est** (`vienggd/Food-order`), Section **131**. Author: **vieng** (`vienggd`), Issue **#196**. Rubric: `project_final_delivery_v1.pdf` (local copy `docs/final_project_delivery.pdf`) §3.5 (10 pts).

## E.1 Delivery details (`project_final_delivery_v1.pdf` §3.5 compliance)

| Field | Value / Requirement |
|---|---|
| Video status | **PENDING RECORDING** (recorded after `v1.0.0` release on `main` and Sprint 3 `F-10` / `F-12` completion) |
| YouTube URL (Unlisted or Public) | **`[PENDING — insert viewable YouTube link before final submission]`** |
| Hard maximum duration | **`<= 4:00`** (resolved against `project_final_delivery_v1.pdf` §3.5 explicit limit of **4 minutes maximum**, `docs/PLAN.md` updated via `PR #191`). Planned script target: **`3:50`** (10 s safety margin). |
| Presenters on camera | **Both `vieng` (Garunyapas Danpitakkul) and `ninja` (Dechayut Panyawutvorakul) in person on the same shared screen / camera** (explicitly NOT a recorded Zoom/video call, per handout §3.5). |
| Environment shown | Live public Cloud Run app (`https://food-order-d4jdyxqbca-as.a.run.app`, running `v1.0.0`) + GitHub PR/Actions proof + terminal/Cloud Run revision check. |

## E.2 Scene-by-scene timed script (`3:50` total)

| Time window | Speaker | On-screen / Demo Action | Spoken Narration Points (concise & verifiable) |
|---|---|---|---|
| **0:00 – 0:30** `(30 s)` | **vieng** (with **ninja** in frame) | Title overlay -> Live URL `https://food-order-d4jdyxqbca-as.a.run.app` login screen (`food-order` revision `v1.0.0`) | Introduce Group **Est** (Sec 131: Garunyapas / `vieng` & Dechayut / `ninja`) and **Campus Café Pre-order** on live Cloud Run + Cloud SQL. Show seeded synthetic roles (`CUSTOMER` & `OPERATOR`), strict `15-item` cap (`Lab 7 C-1`), and explain what failed-login rate limiting (`F-12`) + role guards prevent. |
| **0:30 – 1:25** `(55 s)` | **ninja** | Sign in as `alice@cafe.test` -> Menu + Cart (`Croissant` disabled as sold out, add `Latte ×2` + `Thai Milk Tea ×1`) -> Select pickup slot (`F-09`) -> Submit -> Pay `(simulated)` (`F-08`) | Show sold-out protection (`BR-03`), price-at-order snapshot (`BR-05`), F-09 15-minute slot cut-off & capacity cap (`BR-22..24`), and server-computed total (`BR-04`). Pay order (`Simulated`, zero card inputs, `PAID` badge) and test URL filter `?status=READY` (`F-11`). |
| **1:25 – 2:20** `(55 s)` | **vieng** | Sign in as `staff@cafe.test` -> Operator Queue (`7-column` semantic table, `#132` fix) -> Search `q=alice` -> Advance paid order (`ACCEPTED -> PREPARING -> READY -> PICKED_UP`) -> Open `Menu items` (`F-05`) & `Sales summary` (`F-10`) | Demonstrate single-step progression (`BR-13`), disabled **Mark picked up** on unpaid READY order (`BR-15`), `F-05` duplicate-name rejection (`BR-08`), reject + automatic simulated refund (`BR-16`), and `F-10` Bangkok daily revenue & top-3 items (`PAID + PICKED_UP` only, `BR-17..19`). |
| **2:20 – 3:10** `(50 s)` | **ninja** & **vieng** | (1) `alice` tries `/operator/menu` -> redirected with access warning (`403` in API); (2) Terminal/browser check of `429` login lockout (`F-12`); (3) Show GitHub `v1.0.0` CI run + Cloud Run revision showing pre-redeploy paid order still present after redeploy | Prove server-enforced access control (`FR-04`, `401/403/404`), automated verification on commit `v1.0.0` (Vitest + Playwright + axe), and durable Cloud SQL storage across Cloud Run redeployments. |
| **3:10 – 3:50** `(40 s)` | **vieng** -> **ninja** | Split slide / GitHub Board 4 & PR graph (`main` merge commits) | Summarize 3-sprint contract-first & TDD engineering process, Lab 6 cross-team UAT fixes (`EN-009_P3`, `9/9` closed), honest remaining Backlog deferrals (`#130/#131/#133`), and close cleanly under `4:00`. |

## E.3 Pre-recording checklist (`12 Dec`)

1. Confirm live URL serves tagged `v1.0.0` (`GET /api/ready` healthy) and reset synthetic demo orders cleanly so queue screenshots match script cues.
2. Meet together in person (`vieng` + `ninja`), frame webcam + screen cleanly, verify audio levels with a 10 s test clip.
3. Keep raw timer strictly `< 3:55` (never exceeding `4:00`), upload to YouTube as **Unlisted** (or Public), test in incognito browser, paste final URL into `cover.md` and Section `E.1`, and re-export Final Delivery PDF.
