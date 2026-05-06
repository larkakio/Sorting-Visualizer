import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Matches Base dashboard app; override with NEXT_PUBLIC_BASE_APP_ID on Vercel if needed. */
const DEFAULT_BASE_APP_ID = "69faf7f4e7419956c4ab4879";

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID?.trim() || DEFAULT_BASE_APP_ID;

export const metadata: Metadata = {
  title: "Neon Lattice Sorter",
  description:
    "Cyberpunk mobile sorting puzzle on Base — swipe the lattice, claim your daily check-in.",
  other: { "base:app_id": baseAppId },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        <meta name="base:app_id" content={baseAppId} key="base-app-id" />
      </head>
      <body className="font-ui min-h-dvh overflow-x-hidden antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
