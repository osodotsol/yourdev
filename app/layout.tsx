import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, DM_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YourDev — Build it. Understand it. Verify it.",
  description:
    "YourDev transforms messy brainstorms into structured, agent-ready execution blueprints. Build it. Understand it. Verify it.",
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so the :root design tokens can resolve them.
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
