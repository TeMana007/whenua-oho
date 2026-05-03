import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  // Includes macron precomposed glyphs (Latin Extended-A)
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Kōrero Companion",
  description: "AI-powered te reo Māori conversation practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mi" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-secondary text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
