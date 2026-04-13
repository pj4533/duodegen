import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLearningMode } from "../useLearningMode";
import { GameState } from "@/engine/types";
import { createInitialGameState } from "@/engine/game-state";

function makeState(overrides?: Partial<GameState>): GameState {
  return { ...createInitialGameState(), ...overrides };
}

function stateWithHands(): GameState {
  return makeState({
    phase: "playerBet",
    playerHand: [
      { number: 1, color: "red" },
      { number: 2, color: "yellow" },
    ],
    aiHand: [
      { number: 5, color: "yellow" },
      { number: 6, color: "yellow" },
    ],
    revealedAiCardIndex: 0,
    revealedPlayerCardIndex: 0,
  });
}

describe("useLearningMode", () => {
  it("returns null advice when disabled", () => {
    const { result } = renderHook(() => useLearningMode(stateWithHands(), false));
    expect(result.current.advice).toBeNull();
  });

  it("returns advice when enabled with hands", () => {
    const { result } = renderHook(() => useLearningMode(stateWithHands(), true));
    expect(result.current.advice).not.toBeNull();
    expect(result.current.advice!.recommendedAction).toBeDefined();
  });

  it("returns null advice when no player hand", () => {
    const state = makeState({ phase: "playerBet" });
    const { result } = renderHook(() => useLearningMode(state, true));
    expect(result.current.advice).toBeNull();
  });

  it("returns null advice when no AI hand", () => {
    const state = makeState({
      phase: "playerBet",
      playerHand: [
        { number: 1, color: "red" },
        { number: 2, color: "yellow" },
      ],
      aiHand: null,
    });
    const { result } = renderHook(() => useLearningMode(state, true));
    expect(result.current.advice).toBeNull();
  });

  it("returns showdown advice when in roundEnd with lastResult", () => {
    const state = makeState({
      phase: "roundEnd",
      playerHand: [
        { number: 1, color: "red" },
        { number: 2, color: "yellow" },
      ],
      aiHand: [
        { number: 5, color: "yellow" },
        { number: 6, color: "yellow" },
      ],
      lastResult: {
        playerHand: [
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ],
        aiHand: [
          { number: 5, color: "yellow" },
          { number: 6, color: "yellow" },
        ],
        playerHandResult: { rank: 15, name: "Ali", special: null },
        aiHandResult: { rank: 1, name: "1 Point", special: null },
        winner: "player",
        potWon: 4,
        wasRematch: false,
        specialResolution: null,
      },
    });
    const { result } = renderHook(() => useLearningMode(state, true));
    expect(result.current.advice).not.toBeNull();
    expect(result.current.advice!.headline).toContain("WIN");
  });

  it("uses traditional names when specified", () => {
    const state = makeState({
      phase: "roundEnd",
      playerHand: [
        { number: 1, color: "red" },
        { number: 2, color: "yellow" },
      ],
      aiHand: [
        { number: 5, color: "yellow" },
        { number: 6, color: "yellow" },
      ],
      lastResult: {
        playerHand: [
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ],
        aiHand: [
          { number: 5, color: "yellow" },
          { number: 6, color: "yellow" },
        ],
        playerHandResult: { rank: 15, name: "Ali", special: null },
        aiHandResult: { rank: 1, name: "1 Point", special: null },
        winner: "player",
        potWon: 4,
        wasRematch: false,
        specialResolution: null,
      },
    });
    const { result } = renderHook(() => useLearningMode(state, true, "traditional"));
    expect(result.current.advice).not.toBeNull();
    expect(result.current.advice!.headline).toContain("알리");
  });
});
