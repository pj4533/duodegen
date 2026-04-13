"use client";

import Link from "next/link";
import GameBoard from "@/components/game/GameBoard";

export default function PlayPage() {
  return (
    <div className="flex flex-1 flex-col relative z-10">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gold-dark/10">
        <Link
          href="/"
          className="font-heading text-lg text-gold-dark hover:text-gold-light transition-colors tracking-wider"
        >
          DUO
        </Link>
        <Link
          href="/rules"
          className="text-xs font-heading text-parchment-dark/60 hover:text-parchment-light transition-colors tracking-wider uppercase"
        >
          Rules
        </Link>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <GameBoard />
      </main>
    </div>
  );
}
