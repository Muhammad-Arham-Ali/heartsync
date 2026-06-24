import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeartSync 💕 — ISHA ARHAM QUIZ GAME",
  description:
    "A GAME JISSAY INSHA'ALLAH LARAI NHI HOGI",
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
