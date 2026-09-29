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

## D-008. The app uses the publishable key. No secret is deployed anywhere

- **Date:** 26 Sep 2026
- **Decided by:** Chair, during deployment. Samuel asked for the deployment to be done end to end.
- **Decision:** The sign-up page talks to Supabase with the publishable key, which is designed to be public. Row Level Security allows exactly two things: adding a sign-up that is not self-marked as verified, and calling a function that returns the vendor count. Reading, changing or deleting rows is only possible from the dashboard.
- **Why:** The Supabase connector can hand over the project URL and publishable key but, by design, never the secret key, and a secret should not travel through a chat. Removing the secret also removes something to leak or rotate.
- **Objection (Backend Engineer):** Anyone holding the publishable key can add junk rows through the REST API directly, bypassing the form's validation.
- **Why overruled:** The form is public anyway, so the same junk could be typed into it. At ten vendors, junk is deleted by hand in the dashboard. If spam appears, the fix is a check in the policy or a captcha on the form, not a secret.
- **Revisit when:** spam rows appear, or Slice 2 needs the page to read vendor rows, which will need its own read policy limited to verified rows.
- **Update 27 Sep 2026 (D-009):** the public site still uses only the publishable key. The new admin page needs the secret key on the server. Samuel pastes it into Vercel himself; it never passes through a chat.

## D-009. Build the full app now: the whole trust loop, without accounts or payments

- **Date:** 27 Sep 2026
- **Decided by:** Samuel ("make the full app now"), overruling the slice order in `PLAN.md`.
- **Decision:** Build the complete loop in one go. Couples browse verified vendors, filter by category and area, open a profile, message the vendor on WhatsApp, and leave a review. Each WhatsApp tap is logged as an enquiry. Vendors sign up at `/join`. Samuel verifies vendors and approves reviews on a password-protected `/admin` page. Slices 2 and 3 of the plan are absorbed into this build.
- **Interpretation, stated by the Chair:** "full app" was read as the full trust loop, not a marketplace. Still out: vendor or couple accounts, payments or escrow, bookings, photo uploads, other cities, other categories, ML. Each of those either moves money, stores more personal data, or needs a law or regulator check first.
- **Objection (Simplifier, BENCH):** Zero vendors are signed up and zero conversations are written up. This builds a directory, reviews and an admin console before anyone has said they want them. The 25 Oct gate loses its job of deciding what to build.
- **Objection (CARE):** More software means more to maintain on 3 hours a week.
- **Why overruled:** The founder's call. The parts built are the ones the plan already predicted (the verified list), plus two that produce the evidence the gate needs: enquiries per vendor show whether Together sends vendors business, and reviews show whether couples care. None of it costs money or takes on new legal risk.
- **Promises the site now makes, which Samuel must keep:** every vendor is met or video-called before going live; every reviewer is contacted before their review goes up; couples pay no fee.
- **Revisit when:** 25 Oct 2026 gate. If no vendor has received an enquiry by then, the directory is not the wedge.

## D-010. A Zola or Knot type of site: add the couple's side, a wedding website with RSVP

- **Date:** 28 Sep 2026
- **Decided by:** Samuel ("lets have a zola or knot type of site").
- **Interpretation, stated by the Chair:** Zola and The Knot pair a vendor marketplace with the couple's own planning tools. Together already had the marketplace, so this adds the couple's side, adapted to Lagos: a free wedding website with the story, each ceremony, times and directions, aso-ebi details and a hashtag; online RSVP; a Nigerian wedding checklist; and credits for the verified vendors the couple booked, which shows every guest a Together vendor. The whole site also got a more polished look.
- **How couples edit without accounts:** each website has a private edit link. Only a SHA-256 hash of its token is stored. Every change goes through a database function that checks the token. If a couple loses the link, it cannot be recovered; they make a new site.
- **Still out:** couple accounts and passwords, gift registry, bank details for cash gifts, payments, guest-list import, budget tracker, invitations, photo uploads, other cities. Registry and bank details move money and invite fraud, such as a fake page with someone else's account number, so they wait for Samuel's own decision under the escalation rule.
- **New personal data:** guests' names, replies, optional phone numbers and messages. They are visible only through the couple's private link, never through the public key. They are deleted when the couple deletes the site. Wedding pages are kept out of search engines.
- **Objection (Simplifier):** Two sides to build and recruit for, with zero vendors and zero couples so far. Every new page is more to test and maintain.
- **Objection (BENCH):** Anyone can now publish a page on Together. That is a scam and abuse risk under the Together name. Mitigations: Samuel can take any wedding site down from `/admin`, no money or bank details can be shown, and every page says the RSVP goes only to the couple.
- **Objection (CARE):** Moderating wedding pages adds to a 3-hour week.
- **Why overruled:** The founder's call. The wedding website is also the growth loop: each couple shares their link with every guest, and each page credits verified vendors and invites guests to make their own. It costs nothing to run and needs no new secret.
- **Revisit when:** 25 Oct 2026 gate. Measure how many couples made a site, how many RSVPs came in, and how many vendors were credited.

## D-011. More like The Knot or Zola: a planner dashboard, website designs, a budget tracker

- **Date:** 29 Sep 2026
- **Decided by:** Samuel ("i wanna make it like either the knot or zola wedding app... lets do that a bit").
- **Decision:** The couple's private edit page becomes a planner with six tabs: Overview, Website, Guests, Checklist, Budget, Vendors. Overview shows the countdown, checklist progress, guests coming, budget paid and vendors booked, plus the next three open tasks. Wedding websites get four designs in aso-ebi colours: wine, emerald, royal blue, coral. A private budget tracker records planned and paid amounts across 13 Nigerian wedding costs against an optional total.
- **Pulled from the backlog:** the budget tracker (parked by D-010). Guest-list import, couple accounts, registry and bank details stay parked.
- **Privacy:** the budget is private like the checklist. The public key cannot read it; only the couple's private link can. The design colour is public, because guests' pages need it.
- **Objection (Simplifier):** Samuel has not yet tried D-010 himself, and no couple has used it. This polishes a tool with no users.
- **Objection (BENCH):** The admin page is still switched off, so the only defence against abusive wedding pages is not working. This build does not fix that.
- **Why overruled:** The founder's call. It is small, adds no new secret, moves no money and keeps the same privacy model. The admin gap is Samuel's to close in Vercel, and it is first on his action list.
- **Revisit when:** 25 Oct 2026 gate, with the D-010 measures.

## D-012. A market, invitation cards and anniversary reminders

- **Date:** 29 Sep 2026
- **Decided by:** Samuel ("add a market place and a place that ppl can show what they sale be it product or services and a way ppl can create rspv ad share invites then looking forward to reminders from agent or us about anniverssary gift purchases and other likeables").
- **Interpretation, stated by the Chair:**
  - **Market.** Verified vendors list what they sell, products or services, with a price. Couples browse at `/market`, filter by products, services or gifts, and ask the seller on WhatsApp. Each tap is logged as an enquiry, like the profile button. There is no checkout. Buyers pay sellers directly, off the site.
  - **Who can sell.** Only verified vendors. A market trader signs up at `/join` like any other vendor. After Samuel verifies them, he sends them a private shop link from `/admin`. Through it they add, change and remove their items. Like the couple's edit link, only a hash of it is stored. It is not an account: no password, no email, nothing to log in to.
  - **Invitations.** RSVP already exists on every wedding website. New: an invitation card drawn from the couple's names, date, ceremonies and design. It shows as the preview whenever the website link is shared on WhatsApp. A tall version can be posted in family groups or on WhatsApp status. The planner's Guests tab gets an invite section.
  - **Anniversary reminders, "from us".** In the planner, a couple can ask for one WhatsApp message a year, about two weeks before their anniversary, with gift ideas from the market. Samuel sends it by hand: `/admin` lists who is due, with the message ready to send. Nothing is sent without a ticked consent box. The date of consent is kept. The couple can stop it from the planner or by replying STOP.
  - **"Other likeables"** was read as the gift ideas in that message: items vendors mark as good gifts.
  - A new vendor category, "Gifts / souvenirs", so gift and souvenir sellers can sign up. Souvenirs are already a wedding purchase, so this stays inside D-001.
- **Not built, and escalated to Samuel:**
  - **Reminders "from agent".** Automatic sending needs a paid service (a WhatsApp Business API account or an email service), a key, and a business name registered with Meta, or a domain for email. Money moves and a name attaches publicly, so Samuel decides. An AI agent that writes the messages or picks gifts is ML, which the plan rules out.
  - **Fees.** Charging sellers or taking a cut of sales is a money decision. Nothing on the site charges anyone.
  - **Checkout, photos, personal invites.** No payments or escrow. No photo uploads: buyers see work on the seller's Instagram or ask on WhatsApp. No per-guest invites, which need a guest list, still parked.
- **New personal data:** the couple's WhatsApp number for reminders, with the date they agreed. Only the couple's private link and `/admin` can see it, and it is deleted with the website. Market items are public, like vendor profiles.
- **Objection (Simplifier):** Three features at once, with zero verified vendors, zero couples and `/admin` still switched off. The market stays empty until vendors are verified, and the first reminder cannot go out until a year after the first wedding on Together. The smallest version of this request is the invitation card alone.
- **Objection (BENCH):** A market is where Lagos wedding scams live, such as aso-ebi paid for and never delivered. Mitigations: only verified vendors can list, Samuel can take any item down, and the market says Together never takes payment and tells buyers how to stay safe. `/admin` is still off, so today no vendor can be verified and no shop link can be sent.
- **Objection (CARE):** More work by hand, every week and every year: sending shop links (about 2 minutes a vendor), checking new items (about 5 minutes a week once vendors list), and sending reminders (about 2 minutes each, from a list that only grows).
- **Objection (Counsel):** Messages that market to people should rest on clear, recorded consent that can be withdrawn (Nigeria Data Protection Act 2023; not checked by a lawyer). Built with a ticked box, a stated purpose and frequency, a recorded date and two ways to stop. The site still has no privacy page saying who holds the data. Naming a person or company there attaches a name publicly, so that is Samuel's decision.
- **Why overruled:** The founder's call. Each part is the smallest version that needs no money, no new secret and no new kind of login. The market reuses the verified list and the private-link pattern. Invitations reuse the website. Reminders are sent by a person, which also shows whether couples want them before anyone pays for automation.
- **Promises the site now makes, which Samuel must keep:** only verified vendors appear in the market (the database enforces it), and couples who ask for reminders get at most one message a year, and none after they say stop.
- **Revisit when:** 25 Oct 2026 gate. Measure items listed, enquiries from the market, and couples who asked for reminders.

---

## Backlog (parked by D-001, not in the plan)

| Date | Raised by | Idea | Why parked |
|---|---|---|---|
| 26 Sep 2026 | Ideator | Vendor registration at scale | D-001 |
| 26 Sep 2026 | Ideator | Transport | D-001 |
| 26 Sep 2026 | Ideator | Venues | D-001 |
| 26 Sep 2026 | Ideator | Pan-African expansion | D-001 |
| 28 Sep 2026 | Chair | Gift registry, or bank details for cash gifts on wedding sites | D-010: money and fraud risk, Samuel decides |
| 28 Sep 2026 | Chair | Couple accounts, so a lost edit link can be recovered | D-010 |
| 28 Sep 2026 | Chair | Guest-list import (the budget tracker was built by D-011) | D-010 |
| 29 Sep 2026 | Samuel | Automatic anniversary reminders on WhatsApp or email ("from agent") | D-012: a paid service, a key and a public business name. Samuel decides |
| 29 Sep 2026 | Chair | Fees or commission from sellers in the market | D-012: money, Samuel decides |
| 29 Sep 2026 | Chair | Photos on market items | D-012: storage and moderation. Photo uploads are out of scope |
| 29 Sep 2026 | Chair | Personal invites for each guest, showing who has not replied | D-012: needs a guest list |
| 29 Sep 2026 | Chair | Reminders for birthdays and other dates, or for couples without a wedding website | D-012: a new audience, D-001 |
| 29 Sep 2026 | Chair | Vendors edit their own profile through the shop link | D-012 |
