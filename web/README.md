# Together: web

A Zola or Knot type of site for Lagos (D-009 to D-012). Couples make a free wedding website with RSVP, an invitation card and a checklist, find verified vendors, buy from them in the market, message them on WhatsApp and review them. Samuel verifies vendors, sends them shop links, approves reviews and can take down wedding sites and market items on a password-protected admin page.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Couples | Home: wedding website, checklist, RSVP and verified vendors in one place |
| `/start` | Couples | Create a free wedding website. No account; the couple gets a private edit link |
| `/w/[slug]` | Guests | The wedding website: story, ceremonies with directions, aso-ebi, RSVP, credited vendors. Not indexed by search engines |
| `/w/[slug]/card` | Guests | The invitation card as an image (D-012). The wide version is the preview WhatsApp shows for the website link; `?format=tall` is for family groups and WhatsApp status |
| `/w/[slug]/edit/[token]` | Couples | Private planner (D-011), tabs chosen with `?tab=`: overview (countdown, progress, next tasks, sharing, anniversary reminder), website (design, details, ceremonies, delete), guests (invitation card, RSVPs), checklist, budget, vendors |
| `/vendors` | Couples | Directory of verified vendors, filter by category, area and name |
| `/vendors/[slug]` | Couples | Profile: what was checked, what they sell, reviews, WhatsApp button (logs an enquiry) |
| `/vendors/[slug]/review` | Couples | Leave a review. Hidden until approved |
| `/market` | Couples | Products and services from verified vendors (D-012), filter by products, services, gifts, vendor type and words. "Ask on WhatsApp" logs an enquiry for the item |
| `/vendors/[slug]/shop/[token]` | Vendors | Private shop page: add, change and remove what they sell. No account; the link comes from Samuel |
| `/join` | Vendors | Sign up. Not public until verified |
| `/thanks` | Vendors | After sign-up, with a share-on-WhatsApp button |
| `/admin` | Samuel | Verify vendors, send shop links, approve reviews, send anniversary reminders, hide or delete, enquiry counts, take down wedding sites and market items |

## Environment variables

| Name | Where it comes from | Needed for |
|---|---|---|
| `SUPABASE_URL` | Supabase, Settings > API Keys | Everything |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase, Settings > API Keys (`sb_publishable_...`) | Public pages |
| `SUPABASE_SECRET_KEY` | Supabase, Settings > API Keys (`sb_secret_...`) | `/admin` only, server side |
| `ADMIN_PASSWORD` | You choose it, at least 12 characters | `/admin` only |

The public pages work without the last two. `/admin` shows setup instructions until both are set. Set them in Vercel yourself, as Sensitive, and redeploy. Never paste them into a chat.

## Who can do what in the database

Row Level Security, see `supabase/migrations/`:

- The public key can add a vendor sign-up, but cannot mark it verified.
- It can read verified, visible vendors only, and only a fixed list of their columns, never the hash of their shop link.
- It can read the market items of verified, visible vendors, except items Samuel has taken down. It cannot add or change items.
- Vendors change their items only through three functions (`shop_for_edit`, `save_listing`, `delete_listing`). Each checks the SHA-256 hash of the private shop token first. A shop holds at most 30 items.
- It can add a review for a verified vendor, but cannot approve it, and can read only approved reviews.
- It can never read a reviewer's WhatsApp number.
- It can log an enquiry, but cannot read enquiries. An enquiry can name an item only if it belongs to the same vendor.
- It can create a wedding website and read visible ones, including the design colour, but never the edit token hash, the couple's checklist, their budget or their anniversary reminder number.
- It can send an RSVP to an open, visible wedding, but can never read RSVPs.
- Couples change their site only through four functions (`wedding_for_edit`, `update_wedding`, `wedding_rsvps`, `delete_wedding`). Each checks the SHA-256 hash of the private token first. The token itself is never stored.
- The secret key, used only by `/admin` after the password check, can do everything.

The Supabase security advisor warns that `vendor_count()`, the four wedding functions and the three shop functions are security definer functions callable by the anonymous role. That is intentional: `vendor_count()` returns only a number, and each of the others refuses to do anything without the right private token.

## Market: things to know

- Only verified vendors sell. After verifying a vendor, press "Shop link" next to them in `/admin` and send the link on WhatsApp with the button that appears. It is shown once, because only its hash is stored. "New shop link" replaces a lost one, and the old one stops working.
- If a vendor is unverified or hidden, their items leave the market with them, and come back if they do.
- There are no photos and no checkout. Couples see work on the vendor's Instagram and pay the vendor directly. Together never takes payment.
- Take down any item that looks like a scam or has nothing to do with weddings. The vendor sees that it was taken down.

## Anniversary reminders: things to know

- A couple turns them on from the Overview tab of their planner, with a WhatsApp number and a ticked yes. The database records when they said yes, and refuses a number without it.
- `/admin` lists couples whose anniversary is in the next three weeks. Send the ready-made message with "Send on WhatsApp", then press "Mark sent", so they do not show again until next year. A weekly look is enough.
- If anyone replies STOP, press "Stop" (or "Stop reminder" in the wedding websites list). That deletes the number and the recorded yes. Couples can also stop from their planner.
- Nothing is sent automatically. Messages go from whichever WhatsApp account opens the link, so use the number you want couples to see.

## Wedding websites: things to know

- A lost edit link cannot be recovered, because only its hash is stored. The couple makes a new site.
- Guests' replies and phone numbers are visible only on the couple's private edit page, and are deleted with the site.
- Anyone can make a site, so check `/admin` now and then and take down anything that looks like a scam or abuse.
- There is no gift registry and no place for bank details, on purpose (D-010).
- The invitation card is drawn from the public page only, in the font in `assets/fonts` (Cormorant Garamond, SIL Open Font License, see `assets/fonts/OFL.txt`). Tone marks that sit on a letter as a separate mark, such as on a Yoruba ọ̀, are left off the card because the image renderer cannot place them; the website itself shows them. WhatsApp keeps a link's preview for a while, so a change may take time to show in chats.

## Admin sign-in

One password, `ADMIN_PASSWORD`. The session cookie lasts 7 days and is signed with the password, so changing the password signs everyone out. A wrong password waits a moment before answering, to slow down guessing.

## Set up Supabase from scratch (only for a new project)

1. Create a project at supabase.com. It does not need to be linked to GitHub.
2. Open the SQL editor and run the files in `supabase/migrations/` in order.
3. Copy the URL and keys from Settings > API Keys into the environment variables above.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

## Check before committing

```bash
npm run lint
npm run build          # also generates the page types tsc needs
npx tsc --noEmit
```

## Deploy

Live at https://together-seven-nu.vercel.app (Vercel project `together`, root directory `web`). Production deploys from `main`. The setting lives in Vercel under Settings > Environments > Production > Branch Tracking, not under Settings > Git.

## If the free Supabase project pauses

Supabase pauses free projects after a week with too little database activity. Every page visit reads the database, so real traffic keeps it awake. If it pauses anyway, open the project in the Supabase dashboard and click restore. Anything submitted while it was paused was not saved.
