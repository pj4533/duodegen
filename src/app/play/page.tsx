"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GameBoard from "@/components/game/GameBoard";
import StrategyAdvisor from "@/components/game/StrategyAdvisor";
import SettingsModal from "@/components/SettingsModal";
import { useGameState } from "@/hooks/useGameState";
import { useLearningMode } from "@/hooks/useLearningMode";
import { useSettings } from "@/hooks/useSettings";

function PlayContent() {
  const searchParams = useSearchParams();
  const debugMode = searchParams.get("debug") !== null;
  const { learningMode, handNameStyle } = useSettings();
  const { state, startRound, playerBet, handleTimerExpired, newGame } =
    useGameState();
  const { advice } = useLearningMode(state, learningMode, handNameStyle);
  const [showSettings, setShowSettings] = useState(false);

  // Learning mode OR debug mode disables the timer
  const timerDisabled = learningMode || debugMode;

  return (
    <>
      <main className="flex-1 flex flex-col md:flex-row items-center md:items-start justify-center gap-4 px-4 py-6">
        <GameBoard
          state={state}
          startRound={startRound}
          playerBet={playerBet}
          handleTimerExpired={handleTimerExpired}
          newGame={newGame}
          learningEnabled={learningMode}
          debugMode={timerDisabled}
          onOpenSettings={() => setShowSettings(true)}
        />
        {learningMode && advice && (
          <StrategyAdvisor advice={advice} phase={state.phase} />
        )}
      </main>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default function PlayPage() {
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
      <Suspense>
        <PlayContent />
      </Suspense>
    </div>
  );
}
