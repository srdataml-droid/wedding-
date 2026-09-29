import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Together: plan your Lagos wedding with people you can trust",
    template: "%s · Together",
  },
  description:
    "A free wedding website with RSVP, a Nigerian wedding checklist, and Lagos vendors each checked by a real person.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-paper/90">
          <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Together
            </Link>
            <div className="flex items-center gap-3 text-sm sm:gap-5">
              <Link href="/start" className="text-ink hover:text-wine">
                <span className="sm:hidden">Website</span>
                <span className="hidden sm:inline">Wedding website</span>
              </Link>
              <Link href="/vendors" className="text-ink hover:text-wine">
                Vendors
              </Link>
              <Link href="/market" className="text-ink hover:text-wine">
                Market
              </Link>
              <Link href="/join" className="hidden text-wine hover:text-wine-deep sm:inline">
                For vendors
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs leading-relaxed text-muted">
            <span>Together · Lagos weddings, planned with people you can trust.</span>
            <Link href="/join" className="text-wine underline underline-offset-4">
              Are you a vendor? Get verified
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
