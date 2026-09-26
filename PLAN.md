# Together: Plan of Record

Owner: both founders. Change this file only through an entry in `DECISIONS.md`.

Dates in **bold** were fixed in the council session of 26 Sep 2026. Dates marked *(proposed)* were not in that session's output and are a first draft for both founders to confirm in Phase 0.

## 1. Scope and constraints

- **Lagos only. Vendors first. One paid transaction before any new category.** (D-001)
- Samuel's hours: 3 a week in Phase 1, 4 in Phase 2, 6 in Phase 3. Anything above that displaces the Novaxis AI receptionist build, the HVAC outreach, or the Atelier Haute deployment, and the trade is written in `DECISIONS.md` first. (D-002)
- No code before the Phase 1 gate. (D-003)
- [Sister]'s hours: agreed in Phase 0 and recorded in `DECISIONS.md`.
- Hardware and stack, for when building starts: Next.js, Supabase/Postgres, Vercel. No ML in Phases 2 or 3. This is a trust and operations problem, not a model problem.

## 2. The hypothesis under test

> Lagos wedding vendors lose enough money or time to a specific, nameable trust problem (unpaid balances, no-show clients, fake enquiries, being undercut by unverified competitors, or something we have not heard yet) that at least one of them will pay for a narrow fix, and couples on the other side will use what we build because of it.

This is a hypothesis. Phase 1 exists to replace the bracketed list with what vendors actually say.

## 3. Phases

### Phase 0: Alignment. 26 Sep to 4 Oct 2026. Samuel 3 h.

| # | Task | Owner | Time |
|---|---|---|---|
| 0.1 | Send [Sister] the three honest sentences below and the hour cap. | Samuel | 30 min |
| 0.2 | Paste `OPERATING_PROMPT.md` into a shared chat or Project. | Samuel | 10 min |
| 0.3 | Book the first three vendor conversations for the week of 5 Oct. | [Sister] | 1 h |
| 0.4 | Tear down Vowthread and Inawo as both couple and vendor. | Samuel | 2 h |
| 0.5 | Put **25 Oct 2026** in both calendars as the Phase 1 exit, kill criteria attached. | Both | 5 min |
| 0.6 | [Sister] states her own weekly hour cap. Record it in `DECISIONS.md`. | [Sister] | 10 min |

**The three honest sentences** (drafted from the council rulings; edit into Samuel's own voice before sending):

1. I can give this about 3 hours a week right now, rising to 6 by December, and not more without dropping something I have already committed to.
2. We start with Lagos vendors only, and we do not add a second category until one person has paid us money.
3. The vision is Nigeria and then Africa, but the next 90 days are deliberately small, because the teams before us went wide and lost.

**Exit:** all six tasks done. No gate review needed; the Simplifier waives ceremony at this stakes level.

### Phase 1: Discovery. 5 Oct to **25 Oct 2026**. Samuel 3 h/week.

Targets (proposed; confirm in Phase 0):

| Evidence | Target | Owner | Guide |
|---|---|---|---|
| Vendor conversations, at least 3 categories | 10 | [Sister] | `research/interview-guides.md` |
| Couple conversations, married in last 18 months or planning now | 5 | Either | `research/interview-guides.md` |
| Teardowns as couple and as vendor | Vowthread, Inawo, EventPark | Samuel | `research/teardown-template.md` |
| The four teams that went wide, with sources | list complete | Samuel | `research/teardown-template.md` |

**Exit gate (25 Oct, both founders plus a BENCH pass):**

- The problem statement in section 2 is rewritten in vendors' own words, with at least 3 verbatim quotes pointing at the same problem.
- At least one vendor has said what they currently spend (money or hours) on that problem.
- At least 2 couples have described, unprompted, a trust failure with a vendor.
- The teardowns show what EventPark's verified register does and does not do, with screenshots dated.
- A named smallest-thing-that-works for Phase 2 that fits 4 h/week and needs no code in its first week.

**Kill criteria (any one triggers a stop and a return to ideation, not a rescue):**

- Fewer than 6 vendor conversations completed. The market side cannot run at this tempo; fix that before anything else.
- No vendor names a problem they spend money or hours on today. The vendor wedge is wrong.
- Zero couple conversations completed. The BENCH weak point stands and Phase 2 cannot start.
- The teardowns show a competitor already doing the smallest-thing-that-works well, in Lagos, with paying vendors. Being second and slower is not a plan.

### Phase 2: Smallest thing that works. 26 Oct to 29 Nov 2026 *(proposed)*. Samuel 4 h/week.

Contents are decided at the Phase 1 gate, not now. Standing rules for whatever it is:

- Week 1 is manual: a WhatsApp number, a spreadsheet, and [Sister] doing the thing by hand for 3 to 5 vendors.
- Code is written only for the step that the manual version cannot keep up with.
- Small diffs, each one read and verified before the next.
- **Exit gate:** 5 vendors using the manual or semi-manual version for two consecutive weeks without being chased, and at least one saying they would pay.

### Phase 3: One paid transaction. 30 Nov to 25 Dec 2026 *(proposed)*. Samuel 6 h/week.

- Name a price. Ask for it. Record every yes and every no with the reason.
- **Exit gate:** one real payment, from a vendor, for the thing built in Phase 2. Screenshot of the transfer, dated.
- **Escalation:** the moment any money moves in either direction, or the product carries either founder's real name publicly, Samuel decides directly, outside council process.

## 4. Gates and who signs

| Gate | Date | Who signs | What BENCH asks |
|---|---|---|---|
| Phase 1 exit | **25 Oct 2026** | Both founders | Did any kill criterion trigger? Is the problem in vendors' words? Is there a couple-side signal? |
| Phase 2 exit | 29 Nov 2026 *(proposed)* | Both founders | Are vendors using it unchased? Can Samuel defend every piece of it to a judge who asks "why?" |
| Phase 3 exit | 25 Dec 2026 *(proposed)* | Both founders | Did money move? What does the 90-day retrospective say? |

## 5. Known weak points (BENCH score at intake: 7/10)

1. **The verified register is copyable.** EventPark already does it. The only edge is being faster and on the ground, and that is a race, not a moat. Phase 1 must surface a second reason to exist or the plan goes back to ideation.
2. **No couple has been interviewed.** The vendor wedge could clear every gate and still fail on the other side. Fixed by the couple target in Phase 1.
3. **Two-person dependency on one person's calendar.** Most Phase 1 evidence depends on [Sister]'s reply time and availability, which has not been agreed. Fixed by task 0.6.

## 6. Explicitly out of scope until a paid transaction exists

Couple-facing app. Venues. Transport. Registry or gifting. Payments or escrow. Any city other than Lagos. Any country other than Nigeria. Vendor registration at scale. Any ML.
