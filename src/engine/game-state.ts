import { GameState, GameAction, BetState } from "./types";
import { STARTING_SILVER, ANTE_PER_PLAYER } from "@/lib/constants";
import { applyBet, isBettingComplete } from "./betting";

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
      };

    case "PLAYER_BET": {
      if (action.action === "fold") {
        return {
          ...state,
          phase: "roundEnd",
          bet: {
            ...state.bet,
            aiSilver: state.bet.aiSilver + state.bet.pot,
            pot: 0,
          },
        };
      }
      const newBet = {
        ...applyBet(state.bet, "player", action.action),
        playerActed: true,
      };
      const bothActed = newBet.playerActed && newBet.aiActed;

      if (isBettingComplete(newBet, action.action, bothActed)) {
        return { ...state, phase: "showdown", bet: newBet };
      }
      return { ...state, phase: "aiBet", bet: newBet };
    }

    case "AI_BET": {
      if (action.action === "fold") {
        return {
          ...state,
          phase: "roundEnd",
          bet: {
            ...state.bet,
            playerSilver: state.bet.playerSilver + state.bet.pot,
            pot: 0,
          },
        };
      }
      const newBet = {
        ...applyBet(state.bet, "ai", action.action),
        aiActed: true,
      };
      const bothActed = newBet.playerActed && newBet.aiActed;

      if (isBettingComplete(newBet, action.action, bothActed)) {
        return { ...state, phase: "showdown", bet: newBet };
      }
      return { ...state, phase: "playerBet", bet: newBet };
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
