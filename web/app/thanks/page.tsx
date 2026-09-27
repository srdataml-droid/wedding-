import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/format";
import { cardClass, eyebrow, primaryButton } from "../_components/ui";

export const metadata: Metadata = { title: "You are on the list" };

const shareText = encodeURIComponent(
  `Together is building a list of Lagos wedding vendors couples can trust. Sign up here, it takes one minute: ${SITE_URL}/join`,
);

export default function ThanksPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10">
      <p className={eyebrow}>Together</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">You are on the list.</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Thank you. We will message you on WhatsApp to arrange a quick check of
        your past work. Your profile goes live once that is done.
      </p>

      <div className={`mt-6 ${cardClass}`}>
        <p className="text-sm font-medium text-ink">Know another good vendor?</p>
        <p className="mt-1 text-sm text-muted">
          Send them this page. The list is only as good as the people on it.
        </p>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 ${primaryButton}`}
        >
          Share on WhatsApp
        </a>
      </div>

      <Link href="/" className="mt-6 inline-block text-sm text-wine underline underline-offset-4">
        Go to the Together home page
      </Link>
    </main>
  );
}
