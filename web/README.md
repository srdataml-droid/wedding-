# Together: web

A Zola or Knot type of site for Lagos (D-009, D-010). Couples make a free wedding website with RSVP and a checklist, find verified vendors, message them on WhatsApp and review them. Samuel verifies vendors, approves reviews and can take down wedding sites on a password-protected admin page.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Couples | Home: wedding website, checklist, RSVP and verified vendors in one place |
| `/start` | Couples | Create a free wedding website. No account; the couple gets a private edit link |
| `/w/[slug]` | Guests | The wedding website: story, ceremonies with directions, aso-ebi, RSVP, credited vendors. Not indexed by search engines |
| `/w/[slug]/edit/[token]` | Couples | Private edit page: RSVP list, checklist, details, ceremonies, vendors, delete |
| `/vendors` | Couples | Directory of verified vendors, filter by category, area and name |
| `/vendors/[slug]` | Couples | Profile: what was checked, reviews, WhatsApp button (logs an enquiry) |
| `/vendors/[slug]/review` | Couples | Leave a review. Hidden until approved |
| `/join` | Vendors | Sign up. Not public until verified |
| `/thanks` | Vendors | After sign-up, with a share-on-WhatsApp button |
| `/admin` | Samuel | Verify vendors, approve reviews, hide or delete, enquiry counts, take down wedding sites |

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
- It can read verified, visible vendors only.
- It can add a review for a verified vendor, but cannot approve it, and can read only approved reviews.
- It can never read a reviewer's WhatsApp number.
- It can log an enquiry, but cannot read enquiries.
- It can create a wedding website and read visible ones, but never the edit token hash or the couple's checklist.
- It can send an RSVP to an open, visible wedding, but can never read RSVPs.
- Couples change their site only through four functions (`wedding_for_edit`, `update_wedding`, `wedding_rsvps`, `delete_wedding`). Each checks the SHA-256 hash of the private token first. The token itself is never stored.
- The secret key, used only by `/admin` after the password check, can do everything.

The Supabase security advisor warns that `vendor_count()` and the four wedding functions are security definer functions callable by the anonymous role. That is intentional: `vendor_count()` returns only a number, and each wedding function refuses to do anything without the couple's token.

## Wedding websites: things to know

- A lost edit link cannot be recovered, because only its hash is stored. The couple makes a new site.
- Guests' replies and phone numbers are visible only on the couple's private edit page, and are deleted with the site.
- Anyone can make a site, so check `/admin` now and then and take down anything that looks like a scam or abuse.
- There is no gift registry and no place for bank details, on purpose (D-010).

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
