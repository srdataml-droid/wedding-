# Together: web

Slice 1: the vendor sign-up page. One page, one table.

## Set up Supabase (once, about 5 minutes)

1. Create a project at supabase.com. It does not need to be linked to GitHub.
2. Open the SQL editor and run the files in `supabase/migrations/` in order.
3. Open Settings > API Keys. Copy the project URL and the publishable key (`sb_publishable_...`).

There is no secret key anywhere in this app. Row Level Security lets the publishable key add a sign-up and read the count, and nothing else. Sign-ups appear in the `vendors` table in the dashboard's table editor.

The Supabase security advisor warns that `vendor_count()` is a security definer function callable by the anonymous role. That is intentional: the function returns only the number of rows, and it is how the page reads the count without any read access to the table.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste the two values from Supabase
npm run dev
```

## Check before committing

```bash
npm run lint
npm run build          # also generates the page types tsc needs
npx tsc --noEmit
```

## Deploy

Vercel, root directory `web`, with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` set in the project's environment variables.

## If the free Supabase project pauses

Supabase pauses free projects after a week with too little database activity. Every visit to the page reads the vendor count, so real traffic keeps it awake. If it pauses anyway, open the project in the Supabase dashboard and click restore; sign-ups made while it was paused were not saved, so the vendor will have seen an error and should be asked to try again.
