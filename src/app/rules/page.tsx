"use client";

import Link from "next/link";
import { getRankingsGuide, getSpecialsGuide } from "@/engine/hand-names";
import { useSettings } from "@/hooks/useSettings";

export default function RulesPage() {
  const { handNameStyle } = useSettings();
  const RANKINGS = getRankingsGuide(handNameStyle);
  const SPECIALS = getSpecialsGuide(handNameStyle);

  return (
    <div className="flex flex-1 flex-col relative z-10">
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gold-dark/10">
        <Link
          href="/"
          className="font-heading text-lg text-gold-dark hover:text-gold-light transition-colors tracking-wider"
        >
          DUODEGEN
        </Link>
        <Link
          href="/play"
          className="text-xs font-heading text-parchment-dark/60 hover:text-parchment-light transition-colors tracking-wider uppercase"
        >
          Play
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full space-y-8">
        <h1 className="font-heading text-4xl text-gold-light tracking-wider text-center">
          Rules of Duo
        </h1>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Overview
          </h2>
          <div className="space-y-2 text-sm text-parchment-dark leading-relaxed">
            <p>
              Duo is a card game played with <strong className="text-parchment-light">20 numbered sticks</strong> (1-10, each in Red and Yellow).
              Based on the Korean game <em>Seotda</em>, it is played at the Hernand Inn in Crimson Desert.
            </p>
            <p>
              Each player is dealt <strong className="text-parchment-light">2 sticks</strong>. You can see one of your opponent&apos;s sticks.
              After a round of betting, the highest-ranked hand wins the pot.
            </p>
          </div>
        </section>

        {/* Buy-in & Betting */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Betting
          </h2>
          <div className="space-y-2 text-sm text-parchment-dark leading-relaxed">
            <p>Buy-in: <strong className="text-parchment-light">15 Silver</strong> at the Hernand Inn.</p>
            <p>Each hand begins with a <strong className="text-parchment-light">1 Silver ante</strong> from each player, seeding the pot with 2 Silver.</p>
            <p>You have <strong className="text-parchment-light">10 seconds</strong> to choose an action. If time runs out, you automatically Call.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { action: "Check", desc: "Pass without betting. Only if no one has raised." },
              { action: "Call", desc: "Match the current bet." },
              { action: "Half-Pot", desc: "Raise by half the current pot." },
              { action: "Raise", desc: "Raise by double the previous raise." },
              { action: "All-in", desc: "Bet all your remaining silver." },
              { action: "Fold", desc: "Forfeit the round." },
            ].map((b) => (
              <div
                key={b.action}
                className="bg-crimson-900/30 rounded p-2 border border-crimson-800/20"
              >
                <span className="font-heading text-parchment-light">{b.action}</span>
                <span className="text-parchment-dark/70 text-xs block">{b.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hand Rankings */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Hand Rankings
          </h2>
          <p className="text-xs text-parchment-dark/60">Best to worst, top to bottom.</p>
          <div className="space-y-1">
            {RANKINGS.map((r, i) => (
              <div
                key={r.name}
                className="flex items-baseline gap-3 py-1 text-sm border-b border-crimson-900/20 last:border-0"
              >
                <span className="text-gold-dark/60 text-xs font-heading w-8 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="font-heading text-parchment-light min-w-[80px] sm:min-w-[100px]">
                  {r.name}
                </span>
                <span className="text-parchment-dark/70 text-xs">{r.cards}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Special Hands */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Special Hands
          </h2>
          <p className="text-xs text-parchment-dark/60">
            These hands have conditional abilities that override normal rankings.
          </p>
          <div className="space-y-3">
            {SPECIALS.map((s) => (
              <div
                key={s.name}
                className="bg-crimson-900/30 rounded-lg p-3 border border-gold-dark/15 space-y-1"
              >
                <span className="font-heading text-gold-light">{s.name}</span>
                <p className="text-xs text-parchment-dark/70">Cards: {s.cards}</p>
                <p className="text-sm text-parchment-light">{s.effect}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rematch */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Rematch Rules
          </h2>
          <div className="text-sm text-parchment-dark leading-relaxed space-y-1">
            <p>When a Warden or High Warden triggers a rematch:</p>
            <ul className="list-disc list-inside space-y-1 text-parchment-dark/80">
              <li>The pot carries over (no additional cost)</li>
              <li>All sticks are reshuffled and re-dealt</li>
              <li>Maximum 3 rematches per round</li>
              <li>If the cap is reached, hands are compared by fallback values</li>
            </ul>
          </div>
        </section>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href="/play"
            className="font-heading text-gold-dark hover:text-gold-light transition-colors tracking-wider"
          >
            Play Duo &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
