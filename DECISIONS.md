# Decision Log

Dissent is recorded, never averaged. If a seat objects and is overruled, both the objection and the reason for overruling it are written here.

Format: ID, date, decision, who decided, objection, why overruled, revisit when.

---

## D-001. Scope for the first 90 days: Lagos only, vendors first, one paid transaction before any new category

- **Date:** 26 Sep 2026
- **Decided by:** Chair, on the Simplifier's veto. BRAIN, OPS, CARE, STAGE and BENCH convened. LENS pass of 25 Sep 2026 fed in.
- **Decision:** For 26 Sep to 25 Dec 2026 the project is Lagos wedding vendors only. No other category, city or country enters the plan until one real payment has been received. "Nigeria, then Africa" stays in the vision sentence, not in the plan.
- **Objection (Ideator):** Vendor registration, transport, venues and all of Africa should be in scope. A narrow start could look small.
- **Why overruled:** At least four earlier teams went wide and did not win. Going wide is exactly what a solo engineer with a full-time job cannot fund in hours.
- **Revisit when:** one paid transaction exists.

## D-002. Hour budget

- **Date:** 26 Sep 2026
- **Decided by:** CARE, accepted by Chair.
- **Decision:** Samuel gives this about 3 hours a week in Phase 1, 4 in Phase 2, 6 in Phase 3. The Novaxis AI receptionist build, the HVAC outreach and the Atelier Haute deployment share the same hours. Anything above the budget is traded on paper here, not by drift.
- **Objection:** none recorded.
- **Revisit when:** any phase gate, or if the Revluma contract changes. See D-006, which strains this budget.

## D-003. No code before the Phase 1 gate

- **Status: OVERRULED by D-006 on 26 Sep 2026.** Kept for the record.
- **Decided by:** Simplifier, accepted by Chair.
- **Decision:** Until 25 Oct 2026 the work is conversations and teardowns.

## D-004. Second founder's hour cap

- **Status: VOID.** See D-005. There is no second founder.

## D-005. Solo founder. The "sister" in the first draft was a wrong assumption

- **Date:** 26 Sep 2026
- **Decided by:** Samuel.
- **Decision:** There is one founder. Samuel does engineering and market work himself. He will recruit vendors directly from Lagos markets and trade communities, and ask early vendors to bring others. Every task in `PLAN.md` is owned by Samuel. Interview targets are cut to fit one person's hours.
- **How the error happened:** an earlier chat assumed a sister was the market-side partner and labelled it an assumption. The first draft of this repo carried it in as fact without checking. Recorded so the same class of error (an assumption promoted to a founder) is caught at intake next time.
- **Revisit when:** a real partner joins. That is a new decision with its own entry.

## D-006. Building starts now, in parallel with discovery

- **Date:** 26 Sep 2026
- **Decided by:** Samuel, overruling D-003 directly as founder.
- **Decision:** Code starts on 26 Sep 2026. The first build is the smallest thing a vendor can be shown in a market: a one-page site with a vendor sign-up form that writes to a database. Discovery (vendor and couple conversations, teardowns) runs alongside it and still feeds the 25 Oct gate.
- **Objection (Simplifier, CARE):** Building before anyone has said what they would pay for risks building the wrong thing, and it doubles the load on a 3-hour week: recruiting vendors and writing code now share the same hours. The Phase 1 gate loses its main purpose, which was to decide what to build.
- **Why overruled:** The founder wants momentum and something concrete to show vendors when recruiting them. A live sign-up page is also a recruiting tool, so the two lines of work reinforce each other rather than compete. The risk is accepted with two conditions: the first build stays at one page and one table until vendors are using it, and the 25 Oct gate still asks whether any vendor has named a problem they would pay to fix.
- **Revisit when:** 25 Oct 2026, or when Samuel's logged hours exceed the budget two weeks in a row.

## D-007. Slice 1 stores sign-ups in Supabase, on a new free account

- **Date:** 26 Sep 2026
- **Decided by:** Samuel.
- **Decision:** The sign-up form writes to a Supabase table. Samuel creates a new Supabase account for it because his existing organisation is at its project limit. The project is not linked to GitHub; the app needs only the project URL and the secret key.
- **Alternatives put to Samuel and declined:** a form that opens WhatsApp with the details prefilled (no database, but no record unless copied by hand, and the hand-off can fail silently); a Google Sheet behind an Apps Script endpoint, then WhatsApp (a record without a database, but another moving part).
- **Objection (Simplifier, CARE):** A free Supabase project pauses after a week with too little database activity, and a paused project fails the next vendor's sign-up. Running a database for ten names is more than the slice needs.
- **Why overruled:** Samuel knows Supabase, it is his stack, and the dashboard table editor is the admin screen, so the app stays at one page. Mitigation: the page reads the vendor count on every visit, so real traffic is real activity; a paused project is restored from the dashboard in a minute. A daily ping from Vercel was considered and rejected: the free plan allows one run a day, which Supabase's own guidance suggests is too little, and it would be artificial traffic.
- **Revisit when:** a vendor's sign-up is lost to a pause, or the Phase 1 gate.

---

## Backlog (parked by D-001, not in the plan)

| Date | Raised by | Idea | Why parked |
|---|---|---|---|
| 26 Sep 2026 | Ideator | Vendor registration at scale | D-001 |
| 26 Sep 2026 | Ideator | Transport | D-001 |
| 26 Sep 2026 | Ideator | Venues | D-001 |
| 26 Sep 2026 | Ideator | Pan-African expansion | D-001 |
