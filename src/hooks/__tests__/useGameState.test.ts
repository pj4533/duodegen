import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../useGameState";

describe("useGameState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle phase", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.phase).toBe("idle");
    expect(result.current.state.roundNumber).toBe(0);
  });

  it("transitions to dealing then playerBet on startRound", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startRound();
    });
    expect(result.current.state.phase).toBe("dealing");

    // After deal delay (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(["playerBet", "aiBet"]).toContain(result.current.state.phase);
    expect(result.current.state.playerHand).not.toBeNull();
    expect(result.current.state.aiHand).not.toBeNull();
  });

  it("handles player bet action", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startRound();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // If player has first turn, we can bet
    if (result.current.state.phase === "playerBet") {
      act(() => {
        result.current.playerBet("check");
      });
      // Should transition to aiBet
      expect(result.current.state.phase).toBe("aiBet");
    }
  });

  it("AI takes action after delay when in aiBet phase", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startRound();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    if (result.current.state.phase === "playerBet") {
      act(() => {
        result.current.playerBet("check");
      });
      expect(result.current.state.phase).toBe("aiBet");

      // AI takes action after 500-1500ms
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      // AI should have acted - either showdown or back to playerBet
      expect(["playerBet", "showdown", "roundEnd"]).toContain(
        result.current.state.phase
      );
    }
  });

  it("newGame resets to initial state", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startRound();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.newGame();
    });
    expect(result.current.state.phase).toBe("idle");
    expect(result.current.state.roundNumber).toBe(0);
    expect(result.current.state.bet.playerSilver).toBe(15);
  });

  it("handleTimerExpired triggers auto-call", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startRound();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    if (result.current.state.phase === "playerBet") {
      act(() => {
        result.current.handleTimerExpired();
      });
      // Should have auto-called (moved to aiBet or showdown)
      expect(result.current.state.phase).not.toBe("playerBet");
    }
  });
});
