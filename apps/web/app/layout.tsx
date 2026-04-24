import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// ─── Startup guards ────────────────────────────────────────────────────────
// These run at import time (server startup). Any missing required env var
// throws loudly — no silent mock fallback.
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "[birthday-surprise] ANTHROPIC_API_KEY is not set.\n" +
      "Add it to your .env.local file before starting the server.\n" +
      "The app cannot generate experiences without it."
  );
}

if (!process.env.LEMONSQUEEZY_API_KEY) {
  throw new Error(
    "[birthday-surprise] LEMONSQUEEZY_API_KEY is not set.\n" +
      "Add it to your .env.local file before starting the server.\n" +
      "The app cannot process payments without it."
  );
}

export const metadata: Metadata = {
  title: "Birthday Surprise",
  description: "Create unforgettable birthday moments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
