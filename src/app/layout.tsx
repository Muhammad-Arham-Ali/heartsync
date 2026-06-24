import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeartSync 💕 — Couples Quiz Game",
  description:
    "A real-time cross-device trivia game for couples. Test how well you know each other with HeartSync!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[Nunito]">{children}</body>
    </html>
  );
}
