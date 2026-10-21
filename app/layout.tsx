import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Idea Breakdown Coach — Turn Messy Ideas Into Clear AI Build Steps",
  description:
    "A clean coach for beginners to transform raw project ideas into structured 5-part execution blueprints and AI coding agent prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-canvas text-zinc-100 min-h-screen selection:bg-accent/20 selection:text-accent`}
      >
        {children}
      </body>
    </html>
  );
}
