import { BetAction, BetState } from "./types";

export function createInitialBetState(
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

export function getAvailableActions(
  betState: BetState,
  actor: "player" | "ai"
): BetAction[] {
  const silver =
    actor === "player" ? betState.playerSilver : betState.aiSilver;
  const myBet =
    actor === "player"
      ? betState.playerBetThisRound
      : betState.aiBetThisRound;
  const toCall = betState.currentBet - myBet;
  const actions: BetAction[] = [];

  // Check: only available if no one has bet yet
  if (betState.currentBet === 0) {
    actions.push("check");
  }

  // Call: match the current bet (only if there's something to call)
  if (toCall > 0 && silver >= toCall) {
    actions.push("call");
  }

  // Half Raise: 50% of current pot (must be > toCall)
  const halfRaiseAmount = Math.floor(betState.pot / 2);
  if (halfRaiseAmount > 0 && silver >= toCall + halfRaiseAmount) {
    actions.push("halfRaise");
  }

  // Double Raise: 2x the last raise amount (must be > toCall)
  const doubleRaiseAmount = betState.lastRaise * 2;
  if (
    betState.lastRaise > 0 &&
    doubleRaiseAmount > 0 &&
    silver >= toCall + doubleRaiseAmount
  ) {
    actions.push("doubleRaise");
  }

  // All In: available when you have silver and it's not the same as calling
  // Allows "short all-in" when you can't afford to call the full bet
  if (silver > 0 && silver !== toCall) {
    actions.push("allIn");
  }

  // Fold is always available (unless you can check)
  if (betState.currentBet > 0) {
    actions.push("fold");
  }

  return actions;
}

export function applyBet(
  betState: BetState,
  actor: "player" | "ai",
  action: BetAction
): BetState {
  const state = { ...betState };
  const isPlayer = actor === "player";
  const silver = isPlayer ? state.playerSilver : state.aiSilver;
  const myBet = isPlayer
    ? state.playerBetThisRound
    : state.aiBetThisRound;
  const toCall = state.currentBet - myBet;

  switch (action) {
    case "check":
      state.bettingStarted = true;
      break;

    case "call": {
      const amount = Math.min(toCall, silver);
      if (isPlayer) {
        state.playerSilver -= amount;
        state.playerBetThisRound += amount;
      } else {
        state.aiSilver -= amount;
        state.aiBetThisRound += amount;
      }
      state.pot += amount;
      state.bettingStarted = true;
      break;
    }

    case "halfRaise": {
      const raiseAmount = Math.floor(state.pot / 2);
      const totalAmount = toCall + raiseAmount;
      const capped = Math.min(totalAmount, silver);
      if (isPlayer) {
        state.playerSilver -= capped;
        state.playerBetThisRound += capped;
      } else {
        state.aiSilver -= capped;
        state.aiBetThisRound += capped;
      }
      state.pot += capped;
      state.currentBet = isPlayer
        ? state.playerBetThisRound
        : state.aiBetThisRound;
      state.lastRaise = raiseAmount;
      state.bettingStarted = true;
      break;
    }

    case "doubleRaise": {
      const raiseAmount = state.lastRaise * 2;
      const totalAmount = toCall + raiseAmount;
      const capped = Math.min(totalAmount, silver);
      if (isPlayer) {
        state.playerSilver -= capped;
        state.playerBetThisRound += capped;
      } else {
        state.aiSilver -= capped;
        state.aiBetThisRound += capped;
      }
      state.pot += capped;
      state.currentBet = isPlayer
        ? state.playerBetThisRound
        : state.aiBetThisRound;
      state.lastRaise = raiseAmount;
      state.bettingStarted = true;
      break;
    }

    case "allIn": {
      const amount = silver;
      if (isPlayer) {
        state.playerSilver = 0;
        state.playerBetThisRound += amount;
      } else {
        state.aiSilver = 0;
        state.aiBetThisRound += amount;
      }
      state.pot += amount;
      const newBet = isPlayer
        ? state.playerBetThisRound
        : state.aiBetThisRound;
      if (newBet > state.currentBet) {
        state.lastRaise = newBet - state.currentBet;
        state.currentBet = newBet;
      }
      state.bettingStarted = true;
      break;
    }

    case "fold":
      // Fold is handled by the game state (pot goes to opponent)
      break;
  }

  return state;
}

export function isBettingComplete(
  betState: BetState,
  lastAction: BetAction,
  bothActed: boolean
): boolean {
  if (lastAction === "fold") return true;

  // If both have acted and bets are matched, betting is done
  if (bothActed && betState.playerBetThisRound === betState.aiBetThisRound) {
    return true;
  }

  // If both have acted and at least one is all-in, betting is done
  // (covers short all-in where bets don't match)
  if (
    bothActed &&
    (betState.playerSilver === 0 || betState.aiSilver === 0)
  ) {
    return true;
  }

  return false;
}
