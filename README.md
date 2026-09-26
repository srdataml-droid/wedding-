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

**Slice 1 is live: https://together-seven-nu.vercel.app**

A vendor sign-up page, deployed 26 Sep 2026. Sign-ups land in the `vendors` table of the Supabase project, read in the dashboard's table editor. What is left of Slice 1 is market work: 10 vendors in the table, at least 3 signed up in person, 3 vendor conversations written up. Then Slice 2, the verified list, and the **25 Oct 2026** gate. Details and kill criteria are in `PLAN.md`.

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
