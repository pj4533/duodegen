"use client";

import Link from "next/link";
import GameBoard from "@/components/game/GameBoard";
import StrategyAdvisor from "@/components/game/StrategyAdvisor";
import { useGameState } from "@/hooks/useGameState";
import { useLearningMode } from "@/hooks/useLearningMode";

export default function PlayPage() {
  const { state, startRound, playerBet, handleTimerExpired, newGame } =
    useGameState();
  const { enabled, toggle, advice } = useLearningMode(state);

  return (
    <div className="flex flex-1 flex-col relative z-10">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gold-dark/10">
        <Link
          href="/"
          className="font-heading text-lg text-gold-dark hover:text-gold-light transition-colors tracking-wider"
        >
          DUODEGEN
        </Link>
        <Link
          href="/rules"
          className="text-xs font-heading text-parchment-dark/60 hover:text-parchment-light transition-colors tracking-wider uppercase"
        >
          Rules
        </Link>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col md:flex-row items-center md:items-start justify-center gap-4 px-4 py-6">
        <GameBoard
          state={state}
          startRound={startRound}
          playerBet={playerBet}
          handleTimerExpired={handleTimerExpired}
          newGame={newGame}
          learningEnabled={enabled}
          onToggleLearning={toggle}
        />
        {enabled && advice && (
          <StrategyAdvisor advice={advice} phase={state.phase} />
        )}
      </main>
    </div>
  );
}
