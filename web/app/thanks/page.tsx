import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">You are on the list</h1>
      <p className="mt-2 text-zinc-700">
        Thank you. We will message you on WhatsApp to confirm your details
        before the list goes live.
      </p>
      <p className="mt-2 text-zinc-700">
        Know another good vendor? Send them this page.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm text-zinc-900 underline">
        Back to the sign-up page
      </Link>
    </main>
  );
}
