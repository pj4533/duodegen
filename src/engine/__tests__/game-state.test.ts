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

    it("AI check after player check goes to showdown", () => {
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
});
