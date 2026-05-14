import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixelTitle = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-title",
  display: "swap",
});

const pixelBody = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUANTIX - AI search that doesn't lie",
  description: "AI-powered search with verified answers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelTitle.variable} ${pixelBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-200 scanlines">
        {children}
      </body>
    </html>
  );
}
