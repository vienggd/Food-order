# Lab 6: outgoing Issues (sent 26 Nov 2026 ~15:50) for EN-009_P3 (songt888/event-registration-system)

Sent after ninja approved; the posted text removed the scope notes and added a provenance footer. Provenance: exploratory findings by ninja, tested 25 Nov 2026 21:40-21:46 UTC+7 using an AI computer-use browser session, NOT by hand by the students. The served revision was NOT confirmed at that time (their handoff says `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`). They go beyond UAT-01..06. Sent as Issues on the partner repo on 26 Nov 2026 ~15:50.
Tested app: https://s47a6b53b-4d7hbszvwq-as.a.run.app. No password anywhere.

---

## F-01 ([#141](https://github.com/songt888/event-registration-system/issues/141)): Very long title/location/description breaks the layout (Publish button pushed off screen)

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Organizer One. **Proposed severity:** major (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Sign in as Organizer One at 1280 px.
2. Create event: Title 120 chars, Location 120 chars, Description 2000 chars without spaces. Save draft.
3. Open the saved event / My events.

**Expected:** Values within the stated limits (title/location 1..120, description 0..2000 per f-02-publish-event.md) are shown without breaking the page; Publish stays reachable.

**Actual:** Saved, but at 1280 px the Publish button is pushed off screen and the detail page is about 22,800 px wide; still overflows at 595 px after reload.

**Evidence:** /events/6e0c7e76-9e33-4847-8026-a38ee9974084

**Scope note:** Contract line for 'no sideways scroll' not yet located in their SRS/SDS; check before sending. Unbroken 2000-char text is an extreme input, severity may drop to minor.

---

## F-02 ([#142](https://github.com/songt888/event-registration-system/issues/142)): After logout in another tab, the first tab keeps showing the account and menu

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Organizer One and Participant 3 (both roles). **Proposed severity:** major (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Sign in; open the app in tab A and tab B.
2. In tab B click Logout.
3. In tab A click My registrations (participant) or My events (organizer).

**Expected:** Per their F-01 UI contract (f-01-auth.md section 5, Protected navigation, lines 49-59): a revoked session redirects to /login.

**Actual:** Tab A keeps showing the account name and menu; only a full reload goes to Sign in.

**Evidence:** none captured yet

**Scope note:** STILL TO CHECK: whether tab A shows any protected data or only the stale header. If only the stale header, severity is minor; if protected data is shown, critical.

---

## F-03 ([#143](https://github.com/songt888/event-registration-system/issues/143)): Places-left count stays stale after the registration is refused as duplicate

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Participant 3. **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Open one unregistered event in two tabs; both show '3 of 3 places left'.
2. Register in tab B.
3. Click Register in tab A.

**Expected:** After the refusal tab A shows the current count (2 of 3) or tells the user to refresh.

**Actual:** Duplicate is correctly refused, but tab A still shows '3 of 3 places left' until reload.

**Evidence:** /events/649010dc-6a13-49b0-b29c-9e71803cad5c

**Scope note:** Contract line to be found in their F-04 UI contract before sending.

---

## F-04 ([#144](https://github.com/songt888/event-registration-system/issues/144)): Description line breaks are lost on the event page

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Organizer One. **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Create an event with a 3-line description.
2. Open its detail page; reload.

**Expected:** Lines shown as typed, or the contract says plain text on one line.

**Actual:** All 3 lines appear on one line, also after reload.

**Evidence:** /events/649010dc-6a13-49b0-b29c-9e71803cad5c

**Scope note:** Likely enhancement unless their contract says line breaks are kept.

---

## F-05 ([#145](https://github.com/songt888/event-registration-system/issues/145)): Form errors are not exposed to assistive technology

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** none (signed out) and Organizer One. **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Submit an empty Sign in form.
2. Submit an empty Create event form.
3. Inspect the fields in the DOM.

**Expected:** Error text is tied to its field (aria-invalid / aria-describedby / aria-errormessage).

**Actual:** Error text is visible but the fields have none of these attributes (DOM check).

**Evidence:** DOM inspection, no screenshot

**Scope note:** Accessibility. Their f-01 UI contract says 'show field validation' only; I grepped their SRS and did not find an accessibility requirement. Likely enhancement; confirm.

---

## F-06 ([#146](https://github.com/songt888/event-registration-system/issues/146)): 'Draft saved' message stays after the event is published

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Organizer One. **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Save a draft.
2. Click Publish on its row in My events.

**Expected:** After publishing, the stale 'Draft saved' message is gone or replaced.

**Actual:** Row shows PUBLISHED but `Draft "..." saved.` stays, also after reload.

**Evidence:** /events/c44b05e1-e3d2-46da-8d54-8664c940a03f

**Scope note:** Contract line to be found in their F-02 UI contract before sending.

---

## F-07 ([#147](https://github.com/songt888/event-registration-system/issues/147)): At 320 px the Restore button of the window decoration sticks out about 81 px

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** Participant 3. **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. At 320 px open My registrations.
2. Click Minimize window.

**Expected:** Restore button fully inside the viewport.

**Actual:** Restore button sits about 81 px off the right edge; the visible part is still clickable.

**Evidence:** none captured yet

**Scope note:** Their handoff section 5 says window buttons are decoration and out of tested scope: likely out of scope / enhancement.

---

## F-08 ([#148](https://github.com/songt888/event-registration-system/issues/148)): Minimize/Close buttons on the Not found page have no page name

**Reporter:** Est (ninja), UAT team. **Product team:** EN-009_P3. **Version:** `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` (served revision not confirmed). **Account:** none (Not found page). **Proposed severity:** minor (proposed).

**Preconditions:** release above, test account only, synthetic data.

**Steps**
1. Open an unknown path so the Not found page shows.
2. Read the Minimize / Close window buttons.

**Expected:** Accessible name says which window.

**Actual:** Buttons read only 'Restore window:' / 'Open window:' with no page name.

**Evidence:** none captured yet

**Scope note:** Same as F-07: window buttons are decoration and out of tested scope per their handoff section 5.
