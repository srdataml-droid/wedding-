import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-16 text-center">
      <h1 className="text-2xl font-semibold text-ink">We could not find that page.</h1>
      <p className="mt-2 text-sm text-muted">The vendor may no longer be listed.</p>
      <Link href="/vendors" className="mt-6 inline-block text-sm font-semibold text-wine underline underline-offset-4">
        See all verified vendors
      </Link>
    </main>
  );
}
