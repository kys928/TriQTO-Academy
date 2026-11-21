import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriQTO Academy",
  description: "Learn quantum mechanics, computing, and the geometry behind TriQTO.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={"dark " + GeistSans.variable + " " + GeistMono.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
