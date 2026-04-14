"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GameBoard from "@/components/game/GameBoard";
import StrategyAdvisor from "@/components/game/StrategyAdvisor";
import SettingsModal from "@/components/SettingsModal";
import HandGuide from "@/components/HandGuide";
import RulesModal from "@/components/RulesModal";
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
  const [showGuide, setShowGuide] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Learning mode OR debug mode disables the timer
  const timerDisabled = learningMode || debugMode;

  return (
    <>
      {/* Nav */}
      <header className="flex items-center justify-between px-3 sm:px-4 pr-16 sm:pr-24 py-2 sm:py-3 border-b border-gold-dark/10">
        <Link
          href="/"
          className="font-heading text-lg text-gold-dark hover:text-gold-light transition-colors tracking-wider"
        >
          DUODEGEN
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="text-[10px] sm:text-xs font-heading text-parchment-dark/60 hover:text-gold-light transition-colors tracking-wider uppercase"
          >
            Settings
          </button>
          <button
            onClick={() => setShowGuide(true)}
            className="text-[10px] sm:text-xs font-heading text-gold-dark hover:text-gold-light transition-colors tracking-wider uppercase"
          >
            Hand Guide
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="text-[10px] sm:text-xs font-heading text-parchment-dark/60 hover:text-parchment-light transition-colors tracking-wider uppercase"
          >
            Rules
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col items-center px-4 py-2 sm:py-3 xl:py-6 overflow-hidden">
        <div className="w-full max-w-2xl flex-1 min-h-0 flex flex-col md:flex-row md:gap-6 md:justify-center">
          <div className="flex-1 min-h-0 max-w-lg w-full">
            <GameBoard
              state={state}
              startRound={startRound}
              playerBet={playerBet}
              handleTimerExpired={handleTimerExpired}
              newGame={newGame}
              learningEnabled={learningMode}
              debugMode={timerDisabled}
            />
          </div>
          {learningMode && advice && (
            <StrategyAdvisor advice={advice} phase={state.phase} />
          )}
        </div>
      </main>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <HandGuide open={showGuide} onClose={() => setShowGuide(false)} />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </>
  );
}

export default function PlayPage() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden relative z-10">
      <Suspense>
        <PlayContent />
      </Suspense>
    </div>
  );
}
