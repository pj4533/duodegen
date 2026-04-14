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

  describe("game-over detection on round end", () => {
    it("sets gameOver when AI folds with 0 silver (rematch starvation bug)", () => {
      // Reproduces the real-world bug: after a prior all-in, AI is at 0
      // silver. A rematch or new round ensues where the player raises.
      // AI's only option is to fold. The fold path must set gameOver so the
      // UI shows 'New Game' instead of letting another round start with
      // ante=0 (Math.min(1, playerSilver, 0) = 0).
      const base = stateAfterDeal({
        bet: {
          pot: 4,
          currentBet: 2,
          playerSilver: 10,
          aiSilver: 0,
          playerBetThisRound: 2,
          aiBetThisRound: 0,
          lastRaise: 2,
          bettingStarted: true,
          playerActed: true,
          aiActed: false,
        },
        phase: "aiBet",
      });
      const afterFold = gameReducer(base, { type: "AI_BET", action: "fold" });
      expect(afterFold.phase).toBe("roundEnd");
      expect(afterFold.bet.aiSilver).toBe(0);
      expect(afterFold.bet.playerSilver).toBe(14); // got the 4-silver pot
      expect(afterFold.gameOver).toBe(true);
    });

    it("sets gameOver when player folds with 0 silver left", () => {
      // Player folded after bets drained them to 0 (a scenario that can
      // arise in multi-rematch betting where silver state carries).
      const base = stateAfterDeal({
        bet: {
          pot: 10,
          currentBet: 5,
          playerSilver: 0,
          aiSilver: 5,
          playerBetThisRound: 5,
          aiBetThisRound: 5,
          lastRaise: 5,
          bettingStarted: true,
          playerActed: false,
          aiActed: true,
        },
        phase: "playerBet",
      });
      const afterFold = gameReducer(base, {
        type: "PLAYER_BET",
        action: "fold",
      });
      expect(afterFold.phase).toBe("roundEnd");
      expect(afterFold.bet.playerSilver).toBe(0);
      expect(afterFold.bet.aiSilver).toBe(15); // got the 10-silver pot
      expect(afterFold.gameOver).toBe(true);
    });

    it("does not set gameOver when fold leaves both players with silver", () => {
      const base = stateAfterDeal({
        bet: {
          pot: 4,
          currentBet: 2,
          playerSilver: 10,
          aiSilver: 10,
          playerBetThisRound: 2,
          aiBetThisRound: 0,
          lastRaise: 2,
          bettingStarted: true,
          playerActed: true,
          aiActed: false,
        },
        phase: "aiBet",
      });
      const afterFold = gameReducer(base, { type: "AI_BET", action: "fold" });
      expect(afterFold.gameOver).toBe(false);
    });
  });

  describe("START_ROUND defense", () => {
    it("refuses to start a round when a player has 0 silver", () => {
      // Even if something elsewhere failed to set gameOver, START_ROUND
      // must not start a new round with 0-silver ante.
      const state = {
        ...createInitialGameState(),
        phase: "roundEnd" as const,
        bet: {
          ...createInitialGameState().bet,
          playerSilver: 15,
          aiSilver: 0,
        },
      };
      const next = gameReducer(state, { type: "START_ROUND" });
      expect(next.phase).toBe("roundEnd"); // did not transition to "dealing"
      expect(next.roundNumber).toBe(0);
      expect(next.gameOver).toBe(true); // corrected
    });

    it("refuses to start a round when gameOver is already set", () => {
      const state = {
        ...createInitialGameState(),
        phase: "roundEnd" as const,
        gameOver: true,
      };
      const next = gameReducer(state, { type: "START_ROUND" });
      expect(next.phase).toBe("roundEnd");
      expect(next.roundNumber).toBe(0);
    });

    it("starts normally when both players still have silver", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, { type: "START_ROUND" });
      expect(next.phase).toBe("dealing");
      expect(next.roundNumber).toBe(1);
    });
  });

  describe("response to all-in after passive action", () => {
    it("player gets to respond when AI goes all-in after player checks", () => {
      // Player first turn → player checks → AI all-ins.
      // Regression: betting must NOT short-circuit to showdown; player
      // must be given the chance to call or fold.
      const base = stateAfterDeal();
      const afterCheck = gameReducer(base, { type: "PLAYER_BET", action: "check" });
      expect(afterCheck.phase).toBe("aiBet");

      const afterAllIn = gameReducer(afterCheck, { type: "AI_BET", action: "allIn" });
      expect(afterAllIn.phase).toBe("playerBet");
      expect(afterAllIn.bet.aiSilver).toBe(0);
      expect(afterAllIn.bet.playerActed).toBe(false); // reset after AI raised
      expect(afterAllIn.bet.aiActed).toBe(true);
    });

    it("AI gets to respond when player goes all-in after AI checks", () => {
      // Symmetric case: AI has first turn, checks, player all-ins.
      const base = stateAfterDeal({ playerHasFirstTurn: false });
      // Manually set phase to aiBet (DEAL_COMPLETE with first-turn=false would
      // already do this, but the helper forces playerHasFirstTurn=true).
      const aiFirst = gameReducer(
        { ...base, phase: "aiBet" as const },
        { type: "AI_BET", action: "check" }
      );
      expect(aiFirst.phase).toBe("playerBet");

      const afterAllIn = gameReducer(aiFirst, { type: "PLAYER_BET", action: "allIn" });
      expect(afterAllIn.phase).toBe("aiBet");
      expect(afterAllIn.bet.playerSilver).toBe(0);
      expect(afterAllIn.bet.aiActed).toBe(false); // reset after player raised
      expect(afterAllIn.bet.playerActed).toBe(true);
    });

    it("player gets to respond to AI all-in re-raise after player raises", () => {
      // Player raises first, AI re-raises all-in → player must get a chance.
      const base = stateAfterDeal();
      const afterRaise = gameReducer(base, {
        type: "PLAYER_BET",
        action: "allIn",
      });
      expect(afterRaise.phase).toBe("aiBet");
      expect(afterRaise.bet.playerSilver).toBe(0);

      // AI goes all-in on top (short all-in since AI has same starting silver)
      const afterAiAllIn = gameReducer(afterRaise, {
        type: "AI_BET",
        action: "allIn",
      });
      // Both all-in: betting is complete (neither can act further).
      expect(afterAiAllIn.phase).toBe("showdown");
    });

    it("short all-in (cannot cover the call) still ends betting immediately", () => {
      // If the responder can't afford the full call and short-all-ins, betting
      // is complete — the responder has no more silver to act with.
      const base = stateAfterDeal({
        bet: {
          ...createInitialGameState().bet,
          pot: 2,
          currentBet: 0,
          playerSilver: 5, // low on silver
          aiSilver: 15,
          playerBetThisRound: 0,
          aiBetThisRound: 0,
          lastRaise: 0,
          bettingStarted: false,
          playerActed: false,
          aiActed: false,
        },
      });
      // Player checks.
      const afterCheck = gameReducer(base, { type: "PLAYER_BET", action: "check" });
      // AI all-ins with 15 silver.
      const afterAiAllIn = gameReducer(afterCheck, { type: "AI_BET", action: "allIn" });
      // Player has 5 silver but currentBet is 15 — player must still get to
      // decide (short-all-in or fold).
      expect(afterAiAllIn.phase).toBe("playerBet");

      // Player short-all-ins.
      const afterShortAllIn = gameReducer(afterAiAllIn, {
        type: "PLAYER_BET",
        action: "allIn",
      });
      // Now both all-in, no one can act further → showdown.
      expect(afterShortAllIn.phase).toBe("showdown");
      expect(afterShortAllIn.bet.playerSilver).toBe(0);
    });

    it("does not reset opponent's acted flag on a non-raising action", () => {
      // AI raises, player calls → bets match, should go to showdown.
      const base = stateAfterDeal({ playerHasFirstTurn: false });
      const afterAiRaise = gameReducer(
        { ...base, phase: "aiBet" as const },
        { type: "AI_BET", action: "halfRaise" }
      );
      expect(afterAiRaise.phase).toBe("playerBet");
      const afterPlayerCall = gameReducer(afterAiRaise, {
        type: "PLAYER_BET",
        action: "call",
      });
      // Call matches the bet — betting should complete.
      expect(afterPlayerCall.phase).toBe("showdown");
    });
  });
});
