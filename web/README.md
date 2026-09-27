# Together: web

The full app (D-009): couples find verified Lagos wedding vendors, message them on WhatsApp and review them. Samuel verifies vendors and approves reviews on a password-protected admin page.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Couples | Home: what Together is, categories, recently verified vendors |
| `/vendors` | Couples | Directory of verified vendors, filter by category, area and name |
| `/vendors/[slug]` | Couples | Profile: what was checked, reviews, WhatsApp button (logs an enquiry) |
| `/vendors/[slug]/review` | Couples | Leave a review. Hidden until approved |
| `/join` | Vendors | Sign up. Not public until verified |
| `/thanks` | Vendors | After sign-up, with a share-on-WhatsApp button |
| `/admin` | Samuel | Verify vendors, approve reviews, hide or delete, enquiry counts |

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
- The secret key, used only by `/admin` after the password check, can do everything.

The Supabase security advisor warns that `vendor_count()` is a security definer function callable by the anonymous role. That is intentional: it returns only the number of sign-ups.

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
