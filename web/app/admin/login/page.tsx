import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MIN_PASSWORD_LENGTH, adminSetupProblems, isAdmin } from "@/lib/admin-auth";
import { eyebrow, inputClass, labelClass, primaryButton } from "../../_components/ui";
import { logIn } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const query = await searchParams;
  const wrong = query.error === "wrong";
  const problems = adminSetupProblems();

  return (
    <main className="mx-auto w-full max-w-sm px-4 pb-16 pt-12">
      <p className={eyebrow}>Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Sign in</h1>

      {problems.length === 0 ? (
        <form action={logIn} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
          {wrong ? (
            <p role="alert" className="rounded-lg border border-wine/30 bg-blush px-3 py-2 text-sm text-wine-deep">
              That password is not right.
            </p>
          ) : null}
          <label className={labelClass}>
            Password
            <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </label>
          <button type="submit" className={primaryButton}>
            Sign in
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5 text-sm leading-relaxed text-ink shadow-sm">
          <p className="font-medium">The admin page is not switched on yet.</p>
          <p className="mt-2 font-medium text-wine-deep">What is wrong right now:</p>
          <ul className="mt-1 list-disc pl-5 text-wine-deep">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-3 text-muted">
            In Vercel, open the <strong className="text-ink">together</strong> project, not another one. Go to
            Settings, then Environment Variables, add these for Production, save, then redeploy:
          </p>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>
              <code className="text-ink">SUPABASE_SECRET_KEY</code>: from Supabase, Settings, API Keys, the secret key.
            </li>
            <li>
              <code className="text-ink">ADMIN_PASSWORD</code>: a password you choose, at least {MIN_PASSWORD_LENGTH} characters.
            </li>
          </ul>
        </div>
      )}
    </main>
  );
}
