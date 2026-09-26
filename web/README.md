# Together: web

Slice 1: the vendor sign-up page. One page, one table.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the two values from Supabase
npm run dev
```

Apply `supabase/migrations/0001_vendors.sql` to the Supabase project once, in the SQL editor or with the Supabase CLI. Submissions appear in the `vendors` table in the dashboard.

## Check before committing

```bash
npm run lint
npm run build          # also generates the page types tsc needs
npx tsc --noEmit
```

## Deploy

Vercel, root directory `web`, with the same two env vars set in the project settings.
