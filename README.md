# Together (working name)

The trusted layer for Nigerian weddings, starting with vendors in Lagos.

One founder: Samuel. Engineering and market work, alongside a full-time job. About 3 hours a week on this until 25 Oct 2026, 4 until the end of November, 6 in December.

## The rulings that shape everything here

For the first 90 days (26 Sep to 25 Dec 2026):

- **Lagos only.**
- **Vendors first.**
- **One paid transaction before any new category.**
- **One slice at a time.** Build the smallest thing a vendor can be shown, ship it, recruit with it, then decide the next slice from what vendors said (D-006).

"Nigeria, then Africa" is the vision sentence. It is not in the plan. Every objection and the reason it was overruled is in `DECISIONS.md`.

## Status

**Live: https://together-seven-nu.vercel.app** (D-009 to D-012, 27 to 29 Sep 2026)

A Zola or Knot type of site for Lagos. Couples make a free wedding website with RSVP, a planner and an invitation card for WhatsApp at `/start`, browse verified vendors, buy from them in the market at `/market`, message them on WhatsApp and leave reviews. Couples can also ask for a yearly anniversary reminder. Vendors sign up at `/join` and, once verified, list what they sell through a private shop link. Samuel verifies vendors, sends shop links and reminders, approves reviews and can take things down at `/admin`. What is left before the **25 Oct 2026** gate is field work: vendors verified, conversations written up, and the first couples making a website. Details and kill criteria are in `PLAN.md`. Pages and setup are in `web/README.md`.

## What is in this repo

| Path | What it is for |
|---|---|
| `web/` | The app. Next.js, Supabase, Vercel. `web/README.md` says how to run and deploy it. |
| `PLAN.md` | Slices, gates, hours, dates, kill criteria. The plan of record. |
| `DECISIONS.md` | Decision log. Dissent is recorded, never averaged. |
| `OPERATING_PROMPT.md` | Paste at the top of any chat about the project. |
| `research/interview-guides.md` | Vendor and couple conversation guides, plus the note template. Notes go in `research/notes/`. |
| `research/teardown-template.md` | How to tear down Vowthread, Inawo and EventPark as both a couple and a vendor. Sheets go in `research/teardowns/`. |
| `CLAUDE.md` | Rules any Claude Code session opened in this repo inherits automatically. |
| `.mcp.json` | Points Claude Code at the Supabase project. Each machine authenticates once with `/mcp`. |

## Where things live

- Code: this repo. `main` is the trunk and the Vercel production branch. Work happens on short-lived branches merged into it.
- Hosting: Vercel project `together`, root directory `web`. Every push to `main` deploys.
- Database: Supabase project `xfxqlcmsfkbvbybkrppq`. No secret key is used anywhere; see D-008.

## Next actions

1. Open the live page on your phone, sign up as a test vendor, find the row in the Supabase table editor, delete it. 5 minutes.
2. Send the link to the first vendor and ask them to sign up while you watch. 10 minutes each.
3. Run the vendor conversation from `research/interview-guides.md` with the ones who have time, and write the notes up the same day. 30 minutes each.
4. Tear down Vowthread and Inawo as both couple and vendor, by 11 Oct. 2 hours.
5. Put **25 Oct 2026** in the calendar as the Phase 1 gate, with the kill criteria from `PLAN.md` attached to the event. 5 minutes.
