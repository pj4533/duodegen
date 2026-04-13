import { describe, it, expect } from "vitest";
import { createInitialGameState, gameReducer } from "../game-state";
import { Stick, GameState } from "../types";

function stick(number: number, color: "red" | "yellow" = "red"): Stick {
  return { number, color };
}

function stateAfterDeal(overrides?: Partial<GameState>): GameState {
  let state = createInitialGameState();
  state = gameReducer(state, { type: "START_ROUND" });
  state = gameReducer(state, {
    type: "DEAL_COMPLETE",
    playerHand: [stick(5, "red"), stick(7, "yellow")],
    aiHand: [stick(3, "yellow"), stick(9, "yellow")],
    revealedAiIndex: 0,
    revealedPlayerIndex: 1,
  });
  if (overrides) {
    state = { ...state, ...overrides };
  }
  return state;
}

describe("createInitialGameState", () => {
  it("starts in idle phase", () => {
    const state = createInitialGameState();
    expect(state.phase).toBe("idle");
    expect(state.roundNumber).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it("initializes with correct silver amounts", () => {
    const state = createInitialGameState();
    expect(state.bet.playerSilver).toBe(15);
    expect(state.bet.aiSilver).toBe(15);
  });
});

describe("gameReducer", () => {
  describe("START_ROUND", () => {
    it("transitions from idle to dealing", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, { type: "START_ROUND" });
      expect(next.phase).toBe("dealing");
      expect(next.roundNumber).toBe(1);
      expect(next.rematchCount).toBe(0);
    });
  });

  describe("DEAL_COMPLETE", () => {
    it("transitions to playerBet when player has first turn", () => {
      let state = createInitialGameState();
      state = gameReducer(state, { type: "START_ROUND" });
      const next = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(1), stick(2)],
        aiHand: [stick(3), stick(4)],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      expect(next.phase).toBe("playerBet");
      expect(next.playerHand).toEqual([stick(1), stick(2)]);
      expect(next.aiHand).toEqual([stick(3), stick(4)]);
    });

    it("deducts ante from each player and seeds the pot", () => {
      let state = createInitialGameState();
      state = gameReducer(state, { type: "START_ROUND" });
      const next = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(1), stick(2)],
        aiHand: [stick(3), stick(4)],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      expect(next.bet.pot).toBe(2);  // 1 ante per player
      expect(next.bet.playerSilver).toBe(14);  // 15 - 1
      expect(next.bet.aiSilver).toBe(14);  // 15 - 1
    });

    it("transitions to aiBet when AI has first turn", () => {
      let state = createInitialGameState();
      state = { ...state, playerHasFirstTurn: false };
      state = gameReducer(state, { type: "START_ROUND" });
      const next = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(1), stick(2)],
        aiHand: [stick(3), stick(4)],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      expect(next.phase).toBe("aiBet");
    });
  });

  describe("PLAYER_BET", () => {
    it("check transitions to aiBet", () => {
      const state = stateAfterDeal();
      const next = gameReducer(state, { type: "PLAYER_BET", action: "check" });
      expect(next.phase).toBe("aiBet");
    });

    it("fold gives pot to AI and ends round", () => {
      const state = stateAfterDeal();
      // First make AI bet so there's something to fold against
      const afterAiAction = gameReducer(
        { ...state, phase: "playerBet", bet: { ...state.bet, currentBet: 3, aiBetThisRound: 3, pot: 3, lastRaise: 3, aiSilver: 12, bettingStarted: true } },
        { type: "PLAYER_BET", action: "fold" }
      );
      expect(afterAiAction.phase).toBe("roundEnd");
      expect(afterAiAction.bet.aiSilver).toBe(12 + 3); // AI gets pot
      expect(afterAiAction.bet.pot).toBe(0); // pot cleared after fold
    });

    it("fold produces a lastResult with specialResolution", () => {
      const state = stateAfterDeal();
      const withBet = {
        ...state,
        phase: "playerBet" as const,
        bet: { ...state.bet, currentBet: 3, aiBetThisRound: 3, pot: 5, lastRaise: 3, aiSilver: 12, bettingStarted: true },
      };
      const next = gameReducer(withBet, { type: "PLAYER_BET", action: "fold" });
      expect(next.lastResult).not.toBeNull();
      expect(next.lastResult!.winner).toBe("ai");
      expect(next.lastResult!.specialResolution).toBe("You folded");
      expect(next.lastResult!.potWon).toBe(5);
    });

    it("all-in as opening bet transitions to aiBet", () => {
      const state = stateAfterDeal();
      const next = gameReducer(state, { type: "PLAYER_BET", action: "allIn" });
      expect(next.phase).toBe("aiBet");
      expect(next.bet.playerSilver).toBe(0);
      expect(next.bet.pot).toBe(2 + 14); // ante + all-in
    });
  });

  describe("AI_BET", () => {
    it("AI fold gives pot to player", () => {
      const state = stateAfterDeal();
      const withBet = {
        ...state,
        phase: "aiBet" as const,
        bet: { ...state.bet, currentBet: 3, playerBetThisRound: 3, pot: 3, lastRaise: 3, playerSilver: 12, bettingStarted: true },
      };
      const next = gameReducer(withBet, { type: "AI_BET", action: "fold" });
      expect(next.phase).toBe("roundEnd");
      expect(next.bet.playerSilver).toBe(12 + 3);
    });

    it("AI fold produces a lastResult with specialResolution", () => {
      const state = stateAfterDeal();
      const withBet = {
        ...state,
        phase: "aiBet" as const,
        bet: { ...state.bet, currentBet: 14, playerBetThisRound: 14, pot: 16, lastRaise: 14, playerSilver: 0, bettingStarted: true, playerActed: true },
      };
      const next = gameReducer(withBet, { type: "AI_BET", action: "fold" });
      expect(next.lastResult).not.toBeNull();
      expect(next.lastResult!.winner).toBe("player");
      expect(next.lastResult!.specialResolution).toBe("Opponent folded");
      expect(next.lastResult!.potWon).toBe(16);
    });

    it("AI short all-in completes betting when bets are unequal", () => {
      const state = stateAfterDeal();
      // Player went all-in with 14, AI has 12
      const withBet = {
        ...state,
        phase: "aiBet" as const,
        bet: {
          ...state.bet,
          currentBet: 14,
          playerBetThisRound: 14,
          playerSilver: 0,
          aiSilver: 12,
          pot: 16,
          lastRaise: 14,
          bettingStarted: true,
          playerActed: true,
        },
      };
      const next = gameReducer(withBet, { type: "AI_BET", action: "allIn" });
      expect(next.phase).toBe("showdown"); // betting complete, go to showdown
      expect(next.bet.aiSilver).toBe(0);
      expect(next.bet.aiBetThisRound).toBe(12);
      expect(next.bet.pot).toBe(28); // 16 + 12
    });

    it("AI check after player check goes to showdown with ante pot", () => {
      const state = stateAfterDeal();
      const afterPlayerCheck = gameReducer(state, {
        type: "PLAYER_BET",
        action: "check",
      });
      expect(afterPlayerCheck.phase).toBe("aiBet");
      const afterAiCheck = gameReducer(afterPlayerCheck, {
        type: "AI_BET",
        action: "check",
      });
      expect(afterAiCheck.phase).toBe("showdown");
      // Pot should still have the antes even after both check
      expect(afterAiCheck.bet.pot).toBe(2);
    });
  });

  describe("TIMER_EXPIRED", () => {
    it("auto-calls for player", () => {
      const state = stateAfterDeal();
      const withBet = {
        ...state,
        bet: { ...state.bet, currentBet: 3, aiBetThisRound: 3, pot: 3, lastRaise: 3, aiSilver: 12, bettingStarted: true },
      };
      const next = gameReducer(withBet, { type: "TIMER_EXPIRED" });
      // Timer expired triggers a call - should move to showdown or aiBet
      expect(next.bet.playerBetThisRound).toBe(3);
    });
  });

  describe("ROUND_COMPLETE", () => {
    it("awards pot to winner", () => {
      const state = stateAfterDeal();
      const withPot = {
        ...state,
        phase: "showdown" as const,
        bet: { ...state.bet, pot: 10, playerSilver: 5, aiSilver: 5 },
      };
      const next = gameReducer(withPot, {
        type: "ROUND_COMPLETE",
        result: {
          playerHand: [stick(5), stick(7)],
          aiHand: [stick(3), stick(9)],
          playerHandResult: { rank: 2, name: "2 Points", special: null },
          aiHandResult: { rank: 2, name: "2 Points", special: null },
          winner: "player",
          potWon: 10,
          playerNetGain: 5,
          wasRematch: false,
          specialResolution: null,
        },
      });
      expect(next.bet.playerSilver).toBe(15); // 5 + 10
      expect(next.bet.aiSilver).toBe(5);
      expect(next.playerHasFirstTurn).toBe(true);
      expect(next.phase).toBe("roundEnd");
    });

    it("splits pot on draw", () => {
      const state = stateAfterDeal();
      const withPot = {
        ...state,
        phase: "showdown" as const,
        bet: { ...state.bet, pot: 10, playerSilver: 5, aiSilver: 5 },
      };
      const next = gameReducer(withPot, {
        type: "ROUND_COMPLETE",
        result: {
          playerHand: [stick(5), stick(7)],
          aiHand: [stick(5), stick(7)],
          playerHandResult: { rank: 2, name: "2 Points", special: null },
          aiHandResult: { rank: 2, name: "2 Points", special: null },
          winner: "draw",
          potWon: 0,
          playerNetGain: 0,
          wasRematch: false,
          specialResolution: null,
        },
      });
      expect(next.bet.playerSilver).toBe(10); // 5 + 5
      expect(next.bet.aiSilver).toBe(10); // 5 + 5
    });

    it("sets gameOver when player runs out", () => {
      const state = stateAfterDeal();
      const withPot = {
        ...state,
        phase: "showdown" as const,
        bet: { ...state.bet, pot: 5, playerSilver: 0, aiSilver: 10 },
      };
      const next = gameReducer(withPot, {
        type: "ROUND_COMPLETE",
        result: {
          playerHand: [stick(5), stick(7)],
          aiHand: [stick(3), stick(9)],
          playerHandResult: { rank: 2, name: "2 Points", special: null },
          aiHandResult: { rank: 2, name: "2 Points", special: null },
          winner: "ai",
          potWon: 5,
          playerNetGain: -3,
          wasRematch: false,
          specialResolution: null,
        },
      });
      expect(next.gameOver).toBe(true);
    });
  });

  describe("REMATCH_DEAL", () => {
    it("increments rematchCount and resets betting", () => {
      const state = stateAfterDeal();
      const withPot = {
        ...state,
        phase: "showdown" as const,
        bet: { ...state.bet, pot: 10 },
      };
      const next = gameReducer(withPot, {
        type: "REMATCH_DEAL",
        playerHand: [stick(2), stick(6)],
        aiHand: [stick(7), stick(8)],
        revealedAiIndex: 1,
        revealedPlayerIndex: 0,
      });
      expect(next.rematchCount).toBe(1);
      expect(next.bet.currentBet).toBe(0);
      expect(next.bet.pot).toBe(10); // pot carries over
      expect(next.playerHand).toEqual([stick(2), stick(6)]);
    });
  });

  describe("NEW_GAME", () => {
    it("resets everything", () => {
      const state = stateAfterDeal();
      const next = gameReducer(state, { type: "NEW_GAME" });
      expect(next.phase).toBe("idle");
      expect(next.roundNumber).toBe(0);
      expect(next.bet.playerSilver).toBe(15);
      expect(next.bet.aiSilver).toBe(15);
    });
  });

  describe("silver accounting", () => {
    it("player loses only ante when folding immediately", () => {
      // Both start at 15. Ante takes 1 each -> pot=2, player=14, ai=14
      // Player has first turn, folds immediately
      const state = stateAfterDeal();
      expect(state.bet.pot).toBe(2);
      expect(state.bet.playerSilver).toBe(14);
      expect(state.bet.aiSilver).toBe(14);

      const next = gameReducer(state, { type: "PLAYER_BET", action: "fold" });
      expect(next.phase).toBe("roundEnd");
      expect(next.lastResult!.playerNetGain).toBe(-1); // lost only the ante
      expect(next.bet.playerSilver).toBe(14); // unchanged from before fold
      expect(next.bet.aiSilver).toBe(16); // gets the pot
    });

    it("player loses only ante when folding after opponent raises", () => {
      // AI goes first: set playerHasFirstTurn=false BEFORE dealing
      let state = createInitialGameState();
      state = gameReducer({ ...state, playerHasFirstTurn: false }, { type: "START_ROUND" });
      state = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(5, "red"), stick(7, "yellow")],
        aiHand: [stick(3, "yellow"), stick(9, "yellow")],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      expect(state.phase).toBe("aiBet");

      // AI half-raises (pot=2, raise=1)
      const afterAiRaise = gameReducer(state, { type: "AI_BET", action: "halfRaise" });
      expect(afterAiRaise.bet.pot).toBe(3); // 2 + 1
      expect(afterAiRaise.bet.aiSilver).toBe(13); // 14 - 1
      expect(afterAiRaise.bet.playerSilver).toBe(14); // unchanged
      expect(afterAiRaise.phase).toBe("playerBet");

      // Player folds
      const afterFold = gameReducer(afterAiRaise, { type: "PLAYER_BET", action: "fold" });
      expect(afterFold.lastResult!.playerNetGain).toBe(-1); // only lost ante
      expect(afterFold.bet.playerSilver).toBe(14); // unchanged
      expect(afterFold.bet.aiSilver).toBe(16); // 13 + pot of 3
    });

    it("player loses ante + call amount when calling and losing", () => {
      // AI goes first
      let state = createInitialGameState();
      state = gameReducer({ ...state, playerHasFirstTurn: false }, { type: "START_ROUND" });
      state = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(5, "red"), stick(7, "yellow")],
        aiHand: [stick(3, "yellow"), stick(9, "yellow")],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      const afterAiRaise = gameReducer(state, { type: "AI_BET", action: "halfRaise" });

      // Player calls (must match currentBet=1)
      const afterCall = gameReducer(afterAiRaise, { type: "PLAYER_BET", action: "call" });
      expect(afterCall.bet.playerSilver).toBe(13); // 14 - 1 call
      expect(afterCall.bet.playerBetThisRound).toBe(1);
      expect(afterCall.bet.pot).toBe(4); // 3 + 1
      expect(afterCall.phase).toBe("showdown"); // both acted, bets matched
    });

    it("silver sums are always conserved", () => {
      const state = stateAfterDeal();
      const totalStart = state.bet.playerSilver + state.bet.aiSilver + state.bet.pot;
      expect(totalStart).toBe(30); // 14 + 14 + 2 = 30 (15+15)

      // Player checks
      const s1 = gameReducer(state, { type: "PLAYER_BET", action: "check" });
      expect(s1.bet.playerSilver + s1.bet.aiSilver + s1.bet.pot).toBe(30);

      // AI half-raises
      const s2 = gameReducer(s1, { type: "AI_BET", action: "halfRaise" });
      expect(s2.bet.playerSilver + s2.bet.aiSilver + s2.bet.pot).toBe(30);

      // Player calls
      const s3 = gameReducer(s2, { type: "PLAYER_BET", action: "call" });
      expect(s3.bet.playerSilver + s3.bet.aiSilver + s3.bet.pot).toBe(30);
    });

    it("fold after raise shows correct net in action log", () => {
      let state = createInitialGameState();
      state = gameReducer({ ...state, playerHasFirstTurn: false }, { type: "START_ROUND" });
      state = gameReducer(state, {
        type: "DEAL_COMPLETE",
        playerHand: [stick(5, "red"), stick(7, "yellow")],
        aiHand: [stick(3, "yellow"), stick(9, "yellow")],
        revealedAiIndex: 0,
        revealedPlayerIndex: 1,
      });
      const afterAiRaise = gameReducer(state, { type: "AI_BET", action: "halfRaise" });
      const afterFold = gameReducer(afterAiRaise, { type: "PLAYER_BET", action: "fold" });

      expect(afterFold.actionLog).toHaveLength(2);
      expect(afterFold.actionLog[0]).toMatchObject({ actor: "ai", action: "halfRaise" });
      expect(afterFold.actionLog[1]).toMatchObject({ actor: "player", action: "fold", amount: 0 });
    });

    it("all-in and call tracks silver correctly", () => {
      const state = stateAfterDeal();

      // Player goes all-in (14 silver)
      const s1 = gameReducer(state, { type: "PLAYER_BET", action: "allIn" });
      expect(s1.bet.playerSilver).toBe(0);
      expect(s1.bet.playerBetThisRound).toBe(14);
      expect(s1.bet.pot).toBe(16); // 2 + 14

      // AI calls (must match 14, but only has 14)
      const s2 = gameReducer(s1, { type: "AI_BET", action: "call" });
      expect(s2.bet.aiSilver).toBe(0);
      expect(s2.bet.pot).toBe(30); // all silver in pot
      expect(s2.bet.playerSilver + s2.bet.aiSilver + s2.bet.pot).toBe(30);
    });
  });
});
