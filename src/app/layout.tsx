import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duo - Crimson Desert Card Game",
  description:
    "Practice the Duo card game from Crimson Desert. Master hand rankings, betting strategy, and special hands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
