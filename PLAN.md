# Together: Plan of Record

Owner: Samuel. Change this file only through an entry in `DECISIONS.md`.

Revised 26 Sep 2026 after D-005 (one founder), D-006 (build started) and D-008 (deployment). Dates in **bold** are fixed. Dates marked *(proposed)* are a draft to confirm at the next gate.

## 1. Scope and constraints

- **Lagos only. Vendors first. One paid transaction before any new category.** (D-001)
- Samuel's hours: about 3 a week until 25 Oct, 4 until the end of November, 6 in December. Above that displaces the Novaxis AI receptionist build, the HVAC outreach or the Atelier Haute deployment, and the trade is written in `DECISIONS.md` first. (D-002)
- Building and recruiting share those hours. (D-006)
- Stack: Next.js, Supabase/Postgres, Vercel. No ML. This is a trust and operations problem, not a model problem.

## 2. The hypothesis under test

> Lagos wedding vendors lose enough money or time to a specific, nameable trust problem (unpaid balances, no-show clients, fake enquiries, being undercut by unverified competitors, or something not yet heard) that at least one of them will pay for a narrow fix, and couples will use what gets built because of it.

Discovery exists to replace the bracketed list with what vendors actually say.

## 3. How work is organised: slices, not phases

Each slice is the smallest thing that can be shown to a vendor, built and shipped before the next one starts. Discovery runs alongside every slice and feeds the gates.

### Build status (D-009, 27 Sep 2026)

The full trust loop is built and live at https://together-seven-nu.vercel.app. Couples browse verified vendors, message them on WhatsApp and leave reviews. Vendors sign up at `/join`. Samuel verifies vendors and approves reviews at `/admin`. This absorbs the build part of Slices 1 to 3. What is left before the gate is market work, and it is the same as before: vendors, conversations, couples.

### Slice 1: Vendor sign-ups. 26 Sep to 11 Oct 2026 *(proposed end)*

**Build: done.** Sign-up form at `/join`.

**Market (Samuel, about 2 h a week):**
- Go where vendors are, in person and on Instagram. Show the page, ask them to sign up on the spot, and run the vendor conversation from `research/interview-guides.md` with the ones who have time.
- Ask every vendor who signs up for one other vendor to talk to.

**Done when:** 10 vendors in the table, at least 3 signed up in person, at least 3 vendor conversations written up in `research/notes/`.

### Slice 2: Verified list. 12 Oct to **25 Oct 2026**

**Build: done 27 Sep (D-009).** A vendor goes public only after Samuel has met them or video-called them and checked one piece of evidence, such as a past client's number or a delivered job's photos with a date. He writes what he checked in `/admin`, and it shows on their profile. No software decides who is verified.

**Done when:** 5 vendors verified and listed, 2 couple conversations written up, and at least one enquiry logged for a verified vendor.

### Phase 1 gate. **25 Oct 2026.** Samuel plus a BENCH pass.

- Has any vendor named a problem they spend money or hours on today? Quote them.
- Has any vendor asked for something the page does not do? That is the next slice.
- Have 2 couples described, unprompted, a trust failure with a vendor?
- Do the teardowns (Vowthread, Inawo, EventPark) show a competitor already doing this well in Lagos with paying vendors?

**Kill criteria (any one stops the build and sends the idea back to ideation, not a rescue):**
- Fewer than 6 vendors signed up despite showing the page in person.
- No vendor names a problem they spend money or hours on today.
- A competitor already does the verified list well, in Lagos, with paying vendors.
- Logged hours above budget two weeks running with no trade recorded in `DECISIONS.md`. This is a CARE kill, not a product one.

### Slice 3: What vendors asked for. 26 Oct to 29 Nov 2026 *(proposed)*. 4 h/week.

Decided at the gate from what vendors said. Manual first: a WhatsApp number and a spreadsheet for a week before any code.

**Done when:** 5 vendors using it two weeks running without being chased, and one saying they would pay.

### Slice 4: One paid transaction. 30 Nov to 25 Dec 2026 *(proposed)*. 6 h/week.

Name a price. Ask for it. Record every yes and no with the reason. Done when one vendor has paid, with a dated screenshot of the transfer.

**Escalation:** the moment money moves in either direction, or the product carries Samuel's real name or Novaxis publicly, Samuel decides directly, outside any process.

## 4. Discovery, alongside every slice

| Evidence | Target by 25 Oct | Guide |
|---|---|---|
| Vendor conversations, at least 3 categories | 5 | `research/interview-guides.md` |
| Couple conversations, married in last 18 months or planning | 2 | `research/interview-guides.md` |
| Teardowns as couple and vendor | Vowthread, Inawo, EventPark | `research/teardown-template.md` |
| The four teams that went wide, with sources | list complete | `research/teardown-template.md` |

## 5. Known weak points (BENCH at intake: 7/10; after D-006: 6/10)

1. **The verified list is copyable.** EventPark already does something like it. The edge is being faster and on the ground, and that is a race, not a moat. The gate must surface a second reason to exist.
2. **Building before listening.** D-006 accepted this. The mitigation is that Slice 1 is deliberately tiny and doubles as a recruiting tool.
3. **One person, three hours.** Recruiting in person and coding share the same hours. The CARE kill criterion above is the guard.
4. **No couple has been interviewed.** The vendor wedge could clear every gate and still fail on the couple side.
5. **A free database can pause.** Supabase pauses free projects after a week with too little activity, and a paused project fails the next sign-up. Real visits keep it awake, and a restore is one click in the dashboard. See D-007.

## 6. Out of scope until a paid transaction exists

Couple accounts. Venues. Transport. Registry or gifting. Payments, escrow or bookings. Vendor accounts or login. Photo uploads. Any city other than Lagos. Any country other than Nigeria. Any ML. The couple-facing directory and reviews were brought forward by D-009; everything else on this list still waits.
