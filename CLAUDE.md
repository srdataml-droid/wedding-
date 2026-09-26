# Instructions for Claude Code sessions in this repository

This repo is the plan of record for Together (working name), a Nigerian wedding-tech concept. Read `README.md`, `PLAN.md` and `DECISIONS.md` before doing anything.

## Operating rules that bind every session

1. **Check the phase before you build.** `README.md` states the current phase. Until the Phase 1 gate (25 Oct 2026) passes and is recorded in `DECISIONS.md`, do not scaffold an app, add dependencies, or write product code. If asked to, say that D-003 blocks it, add the idea to the backlog in `DECISIONS.md`, and stop.
2. **Smallest thing that works.** If it can be deleted and the current gate still passes, delete it. Prefer a spreadsheet and a WhatsApp number over a service. No ML in Phases 2 or 3.
3. **Small diffs, each one verified.** Never produce a large generation that the founder cannot read and defend to someone asking "why?".
4. **Every claim needs a source.** Anything written into `research/` carries a name, a date and where it came from. Unverifiable claims are struck, not softened.
5. **Record dissent.** Any change to `PLAN.md` gets a `DECISIONS.md` entry first, with the objection if there was one.
6. **Flag hour cost.** Samuel's budget is 3 h/week in Phase 1, 4 in Phase 2, 6 in Phase 3. State the hours any proposal will cost and what it displaces if over budget.
7. **Escalate to Samuel directly, outside any process,** when money would move, when a real name or company would attach publicly, or when an ethical line is close.
8. **Keep a human at the wheel.** Propose, then wait. Do not act on the plan on the founders' behalf.

## When building does start (after the Phase 1 gate)

- Stack: Next.js, Supabase/Postgres, Vercel. Python and FastAPI only if a backend job cannot be done in the Next.js app.
- Samuel's machine has no dedicated GPU and about 13 GB of RAM. Flag anything that needs heavy local compute.
- Write a one-paragraph "why this and not less" at the top of any PR.

## Style

Plain English. Short sentences. No hype. End substantial answers with a numbered action list, each item owned by Samuel or [Sister], with a time estimate.
