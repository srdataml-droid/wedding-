import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Together: Lagos wedding vendors you can trust",
    template: "%s · Together",
  },
  description:
    "Lagos wedding vendors, each one checked by a real person. Read reviews from real couples and message vendors on WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-paper/90">
          <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-base font-semibold tracking-tight text-ink">
              Together
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/vendors" className="text-ink hover:text-wine">
                Find vendors
              </Link>
              <Link href="/join" className="text-wine hover:text-wine-deep">
                For vendors
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 text-xs leading-relaxed text-muted">
            Together · Lagos wedding vendors, each one checked by a real person.
          </div>
        </footer>
      </body>
    </html>
  );
}
