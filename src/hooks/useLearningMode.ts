"use client";

import { useMemo } from "react";
import { GameState, StrategyAdvice } from "@/engine/types";
import { HandNameStyle } from "@/engine/hand-names";
import { evaluateHand } from "@/engine/hand-evaluator";
import { generateAdvice, generateShowdownAdvice } from "@/engine/strategy";

export function useLearningMode(
  state: GameState,
  enabled: boolean,
  nameStyle: HandNameStyle = "crimsonDesert"
) {
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
        state.lastResult.winner,
        nameStyle
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
      state.phase,
      nameStyle
    );
  }, [
    enabled,
    nameStyle,
    state.phase,
    state.playerHand,
    state.aiHand,
    state.revealedAiCardIndex,
    state.revealedPlayerCardIndex,
    state.bet,
    state.lastResult,
  ]);

  return { advice };
}
