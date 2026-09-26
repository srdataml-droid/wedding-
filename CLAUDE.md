# Instructions for Claude Code sessions in this repository

This repo is the plan of record and the code for Together (working name), a Nigerian wedding-tech concept: the trusted layer for Lagos wedding vendors. Read `README.md`, `PLAN.md` and `DECISIONS.md` before doing anything.

One founder: Samuel. He does engineering and market work himself. There is no second founder (D-005).

## Operating rules that bind every session

1. **Stay inside the current slice.** `PLAN.md` names what is being built right now. Build that and nothing next to it. A new feature idea goes in the backlog in `DECISIONS.md`, not in the code.
2. **Smallest thing that works.** If it can be deleted and vendors can still sign up, delete it. No auth, no payments, no ML, no second category until `PLAN.md` says so.
3. **Small diffs, each one verified.** Run lint and typecheck before every commit. Never produce a large generation the founder cannot read and defend to someone asking "why?".
4. **Every claim needs a source.** Anything written into `research/` carries a name, a date and where it came from. Unverifiable claims are struck, not softened.
5. **Record dissent.** Any change to `PLAN.md` gets a `DECISIONS.md` entry first, with the objection if there was one.
6. **Flag hour cost.** Samuel's budget is 3 h/week until 25 Oct, then 4, then 6. State the hours any proposal will cost and what it displaces if over budget.
7. **Escalate to Samuel directly, outside any process,** when money would move, when a real name or company would attach publicly, or when an ethical line is close.
8. **Keep a human at the wheel.** Propose, then wait. Do not act on the plan on the founder's behalf.

## Code

- App lives in `web/`. Next.js (App Router, TypeScript, Tailwind), Supabase/Postgres, deployed on Vercel. Python and FastAPI only if a backend job cannot be done in the Next.js app.
- `main` is production. Every push to it deploys the live site at https://together-seven-nu.vercel.app. Any other branch gets its own preview URL, so try changes there first.
- Database changes are SQL files in `web/supabase/migrations/`, applied in order. Never change the schema any other way.
- Secrets go in `web/.env.local` (gitignored). Never commit a key.
- Samuel's machine has no dedicated GPU and about 13 GB of RAM. Flag anything that needs heavy local compute.
- Write a one-paragraph "why this and not less" at the top of any PR.

## Style

Plain English. Short sentences. No hype. End substantial answers with a numbered action list, each item with a time estimate.
