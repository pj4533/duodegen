"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { BetAction } from "@/engine/types";
import { createInitialGameState, gameReducer } from "@/engine/game-state";
import { createDeck, shuffleDeck, dealHands } from "@/engine/deck";
import { evaluateHand, resolveShowdown } from "@/engine/hand-evaluator";
import { decideAiAction } from "@/engine/ai";
import { MAX_REMATCHES } from "@/lib/constants";

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup AI timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  const startRound = useCallback(() => {
    dispatch({ type: "START_ROUND" });

    const deck = shuffleDeck(createDeck());
    const { playerHand, aiHand } = dealHands(deck);
    const revealedAiIndex = Math.random() < 0.5 ? 0 : 1;
    const revealedPlayerIndex = Math.random() < 0.5 ? 0 : 1;

    // Small delay for dealing feel
    setTimeout(() => {
      dispatch({
        type: "DEAL_COMPLETE",
        playerHand,
        aiHand,
        revealedAiIndex: revealedAiIndex as 0 | 1,
        revealedPlayerIndex: revealedPlayerIndex as 0 | 1,
      });
    }, 300);
  }, []);

  const playerBet = useCallback((action: BetAction) => {
    dispatch({ type: "PLAYER_BET", action });
  }, []);

  const handleTimerExpired = useCallback(() => {
    dispatch({ type: "TIMER_EXPIRED" });
  }, []);

  const newGame = useCallback(() => {
    dispatch({ type: "NEW_GAME" });
  }, []);

  // AI turn side effect
  useEffect(() => {
    if (state.phase !== "aiBet" || !state.aiHand || !state.playerHand) return;

    const visiblePlayerCard = state.playerHand[state.revealedPlayerCardIndex];

    aiTimeoutRef.current = setTimeout(() => {
      const action = decideAiAction(state.aiHand!, visiblePlayerCard, state.bet);
      dispatch({ type: "AI_BET", action });
    }, 500 + Math.random() * 1000); // 0.5-1.5s "thinking" delay

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [state.phase, state.aiHand, state.playerHand, state.revealedPlayerCardIndex, state.bet]);

  // Showdown resolution side effect
  useEffect(() => {
    if (state.phase !== "showdown" || !state.playerHand || !state.aiHand)
      return;

    const playerResult = evaluateHand(state.playerHand);
    const aiResult = evaluateHand(state.aiHand);
    const outcome = resolveShowdown(
      playerResult,
      aiResult,
      state.rematchCount,
      MAX_REMATCHES
    );

    const resolveTimeout = setTimeout(() => {
      if (outcome.result === "rematch") {
        // Trigger rematch
        const deck = shuffleDeck(createDeck());
        const { playerHand, aiHand } = dealHands(deck);
        dispatch({
          type: "REMATCH_DEAL",
          playerHand,
          aiHand,
          revealedAiIndex: (Math.random() < 0.5 ? 0 : 1) as 0 | 1,
          revealedPlayerIndex: (Math.random() < 0.5 ? 0 : 1) as 0 | 1,
        });
      } else {
        const winner =
          outcome.result === "draw"
            ? "draw"
            : outcome.winner === "player1"
              ? "player"
              : "ai";

        dispatch({
          type: "ROUND_COMPLETE",
          result: {
            playerHand: state.playerHand!,
            aiHand: state.aiHand!,
            playerHandResult: playerResult,
            aiHandResult: aiResult,
            winner: winner as "player" | "ai" | "draw",
            potWon: state.bet.pot,
            wasRematch: state.rematchCount > 0,
            specialResolution: outcome.specialResolution,
          },
        });
      }
    }, 1500); // Delay for showdown reveal

    return () => clearTimeout(resolveTimeout);
  }, [state.phase, state.playerHand, state.aiHand, state.rematchCount, state.bet.pot]);

  return {
    state,
    startRound,
    playerBet,
    handleTimerExpired,
    newGame,
  };
}
