import Link from "next/link";

// One constant to change when the site gets its own domain.
const SITE_URL = "https://together-seven-nu.vercel.app";

const shareText = encodeURIComponent(
  `Together is building a list of Lagos wedding vendors couples can trust. Sign up here, it takes one minute: ${SITE_URL}`,
);

export default function ThanksPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">
        Together
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">
        You are on the list.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Thank you. We will message you on WhatsApp to confirm your details
        before the list goes live.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-ink">Know another good vendor?</p>
        <p className="mt-1 text-sm text-muted">
          Send them this page. The list is only as good as the people on it.
        </p>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-wine px-4 py-3 text-base font-semibold text-white transition hover:bg-wine-deep"
        >
          Share on WhatsApp
        </a>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-wine underline underline-offset-4"
      >
        Back to the sign-up page
      </Link>
    </main>
  );
}
