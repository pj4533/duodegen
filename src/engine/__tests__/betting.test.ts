import { describe, it, expect } from "vitest";
import {
  createInitialBetState,
  getAvailableActions,
  applyBet,
  isBettingComplete,
} from "../betting";

describe("createInitialBetState", () => {
  it("creates a clean bet state with given silver amounts", () => {
    const state = createInitialBetState(15, 15);
    expect(state.pot).toBe(0);
    expect(state.currentBet).toBe(0);
    expect(state.playerSilver).toBe(15);
    expect(state.aiSilver).toBe(15);
    expect(state.playerBetThisRound).toBe(0);
    expect(state.aiBetThisRound).toBe(0);
    expect(state.lastRaise).toBe(0);
    expect(state.bettingStarted).toBe(false);
  });
});

describe("getAvailableActions", () => {
  it("allows check when no bet has been placed", () => {
    const state = createInitialBetState(15, 15);
    const actions = getAvailableActions(state, "player");
    expect(actions).toContain("check");
    expect(actions).not.toContain("fold");
  });

  it("does not allow check after a bet is placed", () => {
    const state = createInitialBetState(15, 15);
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    state.pot = 3;
    state.lastRaise = 3;
    const actions = getAvailableActions(state, "player");
    expect(actions).not.toContain("check");
    expect(actions).toContain("call");
    expect(actions).toContain("fold");
  });

  it("allows fold only when there is a bet to face", () => {
    const state = createInitialBetState(15, 15);
    const actionsNoBet = getAvailableActions(state, "player");
    expect(actionsNoBet).not.toContain("fold");

    state.currentBet = 5;
    state.aiBetThisRound = 5;
    state.pot = 5;
    state.lastRaise = 5;
    const actionsWithBet = getAvailableActions(state, "player");
    expect(actionsWithBet).toContain("fold");
  });

  it("allows allIn when player has more silver than the call amount", () => {
    const state = createInitialBetState(10, 15);
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    state.pot = 3;
    state.lastRaise = 3;
    const actions = getAvailableActions(state, "player");
    expect(actions).toContain("allIn");
  });

  it("does not allow allIn when player has no silver", () => {
    const state = createInitialBetState(0, 15);
    const actions = getAvailableActions(state, "player");
    expect(actions).not.toContain("allIn");
  });

  it("allows halfRaise when pot is non-zero and player has enough silver", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 6;
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    state.lastRaise = 3;
    // halfRaise = 3 (half of 6), toCall = 3, total needed = 6
    const actions = getAvailableActions(state, "player");
    expect(actions).toContain("halfRaise");
  });

  it("allows doubleRaise when lastRaise > 0 and player has enough silver", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 6;
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    state.lastRaise = 3;
    // doubleRaise = 6 (2x3), toCall = 3, total needed = 9
    const actions = getAvailableActions(state, "player");
    expect(actions).toContain("doubleRaise");
  });

  it("does not allow doubleRaise when no previous raise", () => {
    const state = createInitialBetState(15, 15);
    state.lastRaise = 0;
    const actions = getAvailableActions(state, "player");
    expect(actions).not.toContain("doubleRaise");
  });

  it("does not allow halfRaise when pot is 0", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 0;
    const actions = getAvailableActions(state, "player");
    expect(actions).not.toContain("halfRaise");
  });

  it("does not offer call when there is nothing to call", () => {
    const state = createInitialBetState(15, 15);
    state.currentBet = 0;
    const actions = getAvailableActions(state, "player");
    expect(actions).not.toContain("call");
  });
});

describe("applyBet", () => {
  it("check does not change pot or silver", () => {
    const state = createInitialBetState(15, 15);
    const result = applyBet(state, "player", "check");
    expect(result.pot).toBe(0);
    expect(result.playerSilver).toBe(15);
    expect(result.bettingStarted).toBe(true);
  });

  it("call matches the current bet", () => {
    const state = createInitialBetState(15, 15);
    state.currentBet = 5;
    state.aiBetThisRound = 5;
    state.pot = 5;
    const result = applyBet(state, "player", "call");
    expect(result.playerSilver).toBe(10);
    expect(result.playerBetThisRound).toBe(5);
    expect(result.pot).toBe(10);
  });

  it("halfRaise adds half the pot as a raise", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 6;
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    // toCall = 3, halfRaise = 3 (floor(6/2)), total = 6
    const result = applyBet(state, "player", "halfRaise");
    expect(result.playerSilver).toBe(9); // 15 - 6
    expect(result.playerBetThisRound).toBe(6);
    expect(result.pot).toBe(12);
    expect(result.lastRaise).toBe(3);
    expect(result.currentBet).toBe(6);
  });

  it("doubleRaise doubles the last raise", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 6;
    state.currentBet = 3;
    state.aiBetThisRound = 3;
    state.lastRaise = 3;
    // toCall = 3, doubleRaise = 6 (2*3), total = 9
    const result = applyBet(state, "player", "doubleRaise");
    expect(result.playerSilver).toBe(6); // 15 - 9
    expect(result.playerBetThisRound).toBe(9);
    expect(result.pot).toBe(15);
    expect(result.lastRaise).toBe(6);
    expect(result.currentBet).toBe(9);
  });

  it("allIn bets all remaining silver", () => {
    const state = createInitialBetState(10, 15);
    state.pot = 5;
    state.currentBet = 5;
    state.aiBetThisRound = 5;
    const result = applyBet(state, "player", "allIn");
    expect(result.playerSilver).toBe(0);
    expect(result.playerBetThisRound).toBe(10);
    expect(result.pot).toBe(15);
  });

  it("fold does not change bet state", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 5;
    const result = applyBet(state, "player", "fold");
    expect(result.pot).toBe(5);
    expect(result.playerSilver).toBe(15);
  });

  it("applies bets to AI correctly", () => {
    const state = createInitialBetState(15, 15);
    state.pot = 0;
    const result = applyBet(state, "ai", "check");
    expect(result.aiSilver).toBe(15);
    expect(result.bettingStarted).toBe(true);
  });
});

describe("isBettingComplete", () => {
  it("complete after fold", () => {
    const state = createInitialBetState(15, 15);
    expect(isBettingComplete(state, "fold", false)).toBe(true);
  });

  it("complete when both acted and bets match", () => {
    const state = createInitialBetState(15, 15);
    state.playerBetThisRound = 5;
    state.aiBetThisRound = 5;
    expect(isBettingComplete(state, "call", true)).toBe(true);
  });

  it("not complete when bets don't match", () => {
    const state = createInitialBetState(15, 15);
    state.playerBetThisRound = 5;
    state.aiBetThisRound = 3;
    expect(isBettingComplete(state, "halfRaise", true)).toBe(false);
  });

  it("complete when both checked (bets both 0, both acted)", () => {
    const state = createInitialBetState(15, 15);
    state.playerBetThisRound = 0;
    state.aiBetThisRound = 0;
    expect(isBettingComplete(state, "check", true)).toBe(true);
  });

  it("complete when one is all-in and other has called", () => {
    const state = createInitialBetState(0, 5);
    state.playerSilver = 0;
    state.playerBetThisRound = 10;
    state.aiBetThisRound = 10;
    expect(isBettingComplete(state, "call", true)).toBe(true);
  });
});
