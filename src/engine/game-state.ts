import { GameState, GameAction, BetState, RoundResult } from "./types";
import { STARTING_SILVER, ANTE_PER_PLAYER } from "@/lib/constants";
import { applyBet, isBettingComplete } from "./betting";
import { evaluateHand } from "./hand-evaluator";

function createInitialBetState(
  playerSilver: number,
  aiSilver: number
): BetState {
  return {
    pot: 0,
    currentBet: 0,
    playerSilver,
    aiSilver,
    playerBetThisRound: 0,
    aiBetThisRound: 0,
    lastRaise: 0,
    bettingStarted: false,
    playerActed: false,
    aiActed: false,
  };
}

function createBetStateWithAnte(
  playerSilver: number,
  aiSilver: number
): BetState {
  const ante = Math.min(ANTE_PER_PLAYER, playerSilver, aiSilver);
  return {
    pot: ante * 2,
    currentBet: 0,
    playerSilver: playerSilver - ante,
    aiSilver: aiSilver - ante,
    playerBetThisRound: 0,
    aiBetThisRound: 0,
    lastRaise: 0,
    bettingStarted: false,
    playerActed: false,
    aiActed: false,
  };
}

function createFoldResult(
  state: GameState,
  folder: "player" | "ai"
): RoundResult {
  const playerContribution = ANTE_PER_PLAYER + state.bet.playerBetThisRound;
  const aiContribution = ANTE_PER_PLAYER + state.bet.aiBetThisRound;
  const playerWins = folder === "ai";
  return {
    playerHand: state.playerHand!,
    aiHand: state.aiHand!,
    playerHandResult: evaluateHand(state.playerHand!),
    aiHandResult: evaluateHand(state.aiHand!),
    winner: playerWins ? "player" : "ai",
    potWon: state.bet.pot,
    playerNetGain: playerWins ? aiContribution : -playerContribution,
    wasRematch: false,
    specialResolution: `${folder === "player" ? "You" : "Opponent"} folded`,
  };
}

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    deck: [],
    playerHand: null,
    aiHand: null,
    revealedAiCardIndex: 0,
    revealedPlayerCardIndex: 0,
    bet: createInitialBetState(STARTING_SILVER, STARTING_SILVER),
    roundNumber: 0,
    playerHasFirstTurn: true,
    rematchCount: 0,
    lastResult: null,
    gameOver: false,
    actionLog: [],
  };
}

export function gameReducer(
  state: GameState,
  action: GameAction
): GameState {
  switch (action.type) {
    case "START_ROUND":
      return {
        ...state,
        phase: "dealing",
        roundNumber: state.roundNumber + 1,
        rematchCount: 0,
        lastResult: null,
      };

    case "DEAL_COMPLETE":
      return {
        ...state,
        phase: state.playerHasFirstTurn ? "playerBet" : "aiBet",
        playerHand: action.playerHand,
        aiHand: action.aiHand,
        revealedAiCardIndex: action.revealedAiIndex,
        revealedPlayerCardIndex: action.revealedPlayerIndex,
        bet: createBetStateWithAnte(state.bet.playerSilver, state.bet.aiSilver),
        actionLog: [],
      };

    case "PLAYER_BET": {
      const logEntry = {
        actor: "player" as const,
        action: action.action,
        amount: 0,
      };
      if (action.action === "fold") {
        const foldResult = createFoldResult(state, "player");
        return {
          ...state,
          phase: "roundEnd",
          lastResult: foldResult,
          playerHasFirstTurn: false,
          bet: {
            ...state.bet,
            aiSilver: state.bet.aiSilver + state.bet.pot,
            pot: 0,
          },
          actionLog: [...state.actionLog, logEntry],
        };
      }
      const appliedBet = applyBet(state.bet, "player", action.action);
      // If the player raised (increased currentBet), the AI must respond to
      // the new bet level — reset aiActed so betting isn't prematurely marked
      // complete. Skip the reset if AI is already all-in (can't act further).
      const raised = appliedBet.currentBet > state.bet.currentBet;
      const newBet = {
        ...appliedBet,
        playerActed: true,
        aiActed: raised && appliedBet.aiSilver > 0 ? false : appliedBet.aiActed,
      };
      logEntry.amount = newBet.playerBetThisRound - state.bet.playerBetThisRound;
      const bothActed = newBet.playerActed && newBet.aiActed;

      if (isBettingComplete(newBet, action.action, bothActed)) {
        return { ...state, phase: "showdown", bet: newBet, actionLog: [...state.actionLog, logEntry] };
      }
      return { ...state, phase: "aiBet", bet: newBet, actionLog: [...state.actionLog, logEntry] };
    }

    case "AI_BET": {
      const logEntry = {
        actor: "ai" as const,
        action: action.action,
        amount: 0,
      };
      if (action.action === "fold") {
        const foldResult = createFoldResult(state, "ai");
        return {
          ...state,
          phase: "roundEnd",
          lastResult: foldResult,
          playerHasFirstTurn: true,
          bet: {
            ...state.bet,
            playerSilver: state.bet.playerSilver + state.bet.pot,
            pot: 0,
          },
          actionLog: [...state.actionLog, logEntry],
        };
      }
      const appliedBet = applyBet(state.bet, "ai", action.action);
      // If the AI raised (increased currentBet), the player must respond to
      // the new bet level — reset playerActed so betting isn't prematurely
      // marked complete. Skip the reset if player is already all-in.
      const raised = appliedBet.currentBet > state.bet.currentBet;
      const newBet = {
        ...appliedBet,
        aiActed: true,
        playerActed:
          raised && appliedBet.playerSilver > 0 ? false : appliedBet.playerActed,
      };
      logEntry.amount = newBet.aiBetThisRound - state.bet.aiBetThisRound;
      const bothActed = newBet.playerActed && newBet.aiActed;

      if (isBettingComplete(newBet, action.action, bothActed)) {
        return { ...state, phase: "showdown", bet: newBet, actionLog: [...state.actionLog, logEntry] };
      }
      return { ...state, phase: "playerBet", bet: newBet, actionLog: [...state.actionLog, logEntry] };
    }

    case "TIMER_EXPIRED":
      // Auto-call on timer expiry
      return gameReducer(state, { type: "PLAYER_BET", action: "call" });

    case "RESOLVE_SHOWDOWN":
      return { ...state, phase: "showdown" };

    case "REMATCH_DEAL":
      return {
        ...state,
        phase: state.playerHasFirstTurn ? "playerBet" : "aiBet",
        playerHand: action.playerHand,
        aiHand: action.aiHand,
        revealedAiCardIndex: action.revealedAiIndex,
        revealedPlayerCardIndex: action.revealedPlayerIndex,
        rematchCount: state.rematchCount + 1,
        bet: {
          ...state.bet,
          currentBet: 0,
          playerBetThisRound: 0,
          aiBetThisRound: 0,
          lastRaise: 0,
          bettingStarted: false,
          playerActed: false,
          aiActed: false,
        },
      };

    case "ROUND_COMPLETE": {
      const result = action.result;
      let playerSilver = state.bet.playerSilver;
      let aiSilver = state.bet.aiSilver;

      if (result.winner === "player") {
        playerSilver += state.bet.pot;
      } else if (result.winner === "ai") {
        aiSilver += state.bet.pot;
      } else {
        // Draw: split pot
        const half = Math.floor(state.bet.pot / 2);
        playerSilver += half;
        aiSilver += state.bet.pot - half;
      }

      const gameOver = playerSilver <= 0 || aiSilver <= 0;

      return {
        ...state,
        phase: "roundEnd",
        lastResult: result,
        playerHasFirstTurn: result.winner === "player" ? true : result.winner === "ai" ? false : state.playerHasFirstTurn,
        bet: {
          ...state.bet,
          playerSilver,
          aiSilver,
          pot: 0,
        },
        gameOver,
      };
    }

    case "NEW_GAME":
      return createInitialGameState();

    default:
      return state;
  }
}
