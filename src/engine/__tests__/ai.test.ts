import { describe, it, expect } from "vitest";
import { decideAiAction } from "../ai";
import { Stick, BetState } from "../types";
import { createInitialBetState } from "../betting";

function stick(number: number, color: "red" | "yellow" = "red"): Stick {
  return { number, color };
}

function betStateWithRaise(): BetState {
  return {
    ...createInitialBetState(15, 15),
    pot: 6,
    currentBet: 3,
    playerBetThisRound: 3,
    playerSilver: 12,
    lastRaise: 3,
    bettingStarted: true,
  };
}

describe("decideAiAction", () => {
  it("returns a valid bet action", () => {
    const hand: [Stick, Stick] = [stick(9, "red"), stick(9, "yellow")];
    const visibleCard = stick(3, "yellow");
    const betState = createInitialBetState(15, 15);
    const action = decideAiAction(hand, visibleCard, betState);
    expect(["check", "call", "halfRaise", "doubleRaise", "allIn", "fold"]).toContain(action);
  });

  it("never folds with a strong hand when checking is available", () => {
    const hand: [Stick, Stick] = [stick(10, "red"), stick(10, "yellow")]; // Ten Pair
    const visibleCard = stick(2, "yellow");
    const betState = createInitialBetState(15, 15);
    // Run multiple times to verify probabilistically
    for (let i = 0; i < 50; i++) {
      const action = decideAiAction(hand, visibleCard, betState);
      expect(action).not.toBe("fold");
    }
  });

  it("returns a valid action when facing a raise", () => {
    const hand: [Stick, Stick] = [stick(5, "yellow"), stick(3, "yellow")]; // 8 points
    const visibleCard = stick(2, "yellow");
    const betState = betStateWithRaise();
    const action = decideAiAction(hand, visibleCard, betState);
    expect(["call", "halfRaise", "doubleRaise", "allIn", "fold"]).toContain(action);
  });

  it("handles weak hand correctly", () => {
    const hand: [Stick, Stick] = [stick(2, "yellow"), stick(8, "yellow")]; // Mang Tong (0)
    const visibleCard = stick(9, "red");
    const betState = createInitialBetState(15, 15);
    const action = decideAiAction(hand, visibleCard, betState);
    // Should return a valid action (likely check)
    expect(["check", "call", "halfRaise", "doubleRaise", "allIn", "fold"]).toContain(action);
  });

  it("returns only available action when just one option", () => {
    const hand: [Stick, Stick] = [stick(1, "yellow"), stick(2, "yellow")]; // Ali
    const visibleCard = stick(5, "yellow");
    // State where AI has 0 silver and must fold or has no other choice
    const betState: BetState = {
      pot: 10,
      currentBet: 5,
      playerSilver: 5,
      aiSilver: 0,
      playerBetThisRound: 5,
      aiBetThisRound: 0,
      lastRaise: 5,
      bettingStarted: true,
      playerActed: true,
      aiActed: false,
    };
    const action = decideAiAction(hand, visibleCard, betState);
    // With 0 silver and a bet to face, only fold is available
    expect(action).toBe("fold");
  });
});
