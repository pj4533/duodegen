import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/hooks/useSettings";
import GitHubCorner from "@/components/GitHubCorner";

export const metadata: Metadata = {
  title: "Duodegen - Crimson Desert Card Game",
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
      <body className="min-h-full flex flex-col antialiased">
        <SettingsProvider>
          <GitHubCorner />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
