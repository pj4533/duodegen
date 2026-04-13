"use client";

import { useState, useMemo, useEffect } from "react";
import { GameState, StrategyAdvice } from "@/engine/types";
import { evaluateHand } from "@/engine/hand-evaluator";
import { generateAdvice, generateShowdownAdvice } from "@/engine/strategy";

const STORAGE_KEY = "duodegen-learning-mode";

export function useLearningMode(state: GameState) {
  const [enabled, setEnabled] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setEnabled(true);
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const advice = useMemo<StrategyAdvice | null>(() => {
    if (!enabled) return null;
    if (!state.playerHand) return null;

    // Showdown/roundEnd with results: use showdown advisor
    if (
      (state.phase === "showdown" || state.phase === "roundEnd") &&
      state.lastResult
    ) {
      return generateShowdownAdvice(
        state.lastResult.playerHandResult,
        state.lastResult.aiHandResult,
        state.lastResult.winner
      );
    }

    // Active phases: need opponent visible card
    if (!state.aiHand) return null;
    const visibleOpponentCard = state.aiHand[state.revealedAiCardIndex];
    const playerResult = evaluateHand(state.playerHand);

    return generateAdvice(
      state.playerHand,
      playerResult,
      visibleOpponentCard,
      state.revealedPlayerCardIndex,
      state.bet,
      state.phase
    );
  }, [
    enabled,
    state.phase,
    state.playerHand,
    state.aiHand,
    state.revealedAiCardIndex,
    state.revealedPlayerCardIndex,
    state.bet,
    state.lastResult,
  ]);

  return { enabled, toggle, advice };
}
