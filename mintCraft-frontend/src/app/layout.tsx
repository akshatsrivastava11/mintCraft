import type { Metadata } from "next";
// ✅ 1. Import ONLY the font you need
import { Luckiest_Guy } from 'next/font/google';
import { SolanaProvider } from "./providers/solanaProvider";
import "./globals.css";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCNext } from "@trpc/next";
// import { withTRPC } from "@trpc/next";

// ✅ 2. Initialize the font object
// This specific font from Google requires a weight to be specified.
const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MintCraft - AI-Powered NFT Creation Platform",
  description: "Create, mint, and trade unique digital content with cutting-edge AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        ✅ 3. Apply the font's className directly to the body.
        This handles everything for you: loading the font, creating the
        CSS, and applying the font-family.
      */}
      <body className={`${luckiestGuy.className} antialiased`}>
        <SolanaProvider>
          <div className="page-transition">
            {children}
          </div>
        </SolanaProvider>
      </body>
    </html>
  );
}
