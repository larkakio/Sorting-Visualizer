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

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID?.trim() ?? "";

export const metadata: Metadata = {
  title: "Neon Lattice Sorter",
  description:
    "Cyberpunk mobile sorting puzzle on Base — swipe the lattice, claim your daily check-in.",
  ...(baseAppId ? { other: { "base:app_id": baseAppId } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        {baseAppId ? (
          <meta name="base:app_id" content={baseAppId} key="base-app-id" />
        ) : null}
      </head>
      <body className="font-ui min-h-dvh overflow-x-hidden antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
