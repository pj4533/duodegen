import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
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
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts disabled", () => {
    const { result } = renderHook(() => useLearningMode(makeState()));
    expect(result.current.enabled).toBe(false);
    expect(result.current.advice).toBeNull();
  });

  it("toggles on and off", () => {
    const { result } = renderHook(() => useLearningMode(makeState()));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem("duodegen-learning-mode")).toBe("true");

    act(() => {
      result.current.toggle();
    });
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem("duodegen-learning-mode")).toBe("false");
  });

  it("returns null advice when disabled even with hands", () => {
    const { result } = renderHook(() => useLearningMode(stateWithHands()));
    expect(result.current.advice).toBeNull();
  });

  it("returns advice when enabled with hands", () => {
    const state = stateWithHands();
    const { result } = renderHook(() => useLearningMode(state));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.advice).not.toBeNull();
    expect(result.current.advice!.recommendedAction).toBeDefined();
  });

  it("returns null advice when no player hand", () => {
    const state = makeState({ phase: "playerBet" });
    const { result } = renderHook(() => useLearningMode(state));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.advice).toBeNull();
  });

  it("returns null advice when no AI hand (even with player hand)", () => {
    const state = makeState({
      phase: "playerBet",
      playerHand: [
        { number: 1, color: "red" },
        { number: 2, color: "yellow" },
      ],
      aiHand: null,
    });
    const { result } = renderHook(() => useLearningMode(state));

    act(() => {
      result.current.toggle();
    });
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
    const { result } = renderHook(() => useLearningMode(state));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.advice).not.toBeNull();
    expect(result.current.advice!.headline).toContain("WIN");
  });

  it("hydrates from localStorage", () => {
    localStorage.setItem("duodegen-learning-mode", "true");
    const { result } = renderHook(() => useLearningMode(stateWithHands()));

    // After useEffect runs, it should be enabled
    expect(result.current.enabled).toBe(true);
    expect(result.current.advice).not.toBeNull();
  });
});
