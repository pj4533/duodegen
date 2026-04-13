import { Stick, BetAction, BetState, HandRank } from "./types";
import { evaluateHand } from "./hand-evaluator";
import { getAvailableActions } from "./betting";

function weightedRandom(options: { action: BetAction; weight: number }[]): BetAction {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const opt of options) {
    r -= opt.weight;
    if (r <= 0) return opt.action;
  }
  return options[options.length - 1].action;
}

export function decideAiAction(
  aiHand: [Stick, Stick],
  visiblePlayerCard: Stick,
  betState: BetState
): BetAction {
  const available = getAvailableActions(betState, "ai");
  if (available.length === 0) return "fold";
  if (available.length === 1) return available[0];

  const handResult = evaluateHand(aiHand);
  const rank = handResult.rank;
  const isFacingBet = betState.currentBet > betState.aiBetThisRound;

  // Categorize hand strength
  const isStrong =
    rank >= HandRank.Pair1 ||
    rank === HandRank.Ali ||
    rank === HandRank.DokSa ||
    rank === HandRank.GuBing ||
    handResult.special !== null;
  const isMedium =
    rank >= HandRank.SelRyuk ||
    rank >= HandRank.Points7;
  const isWeak = rank <= HandRank.Points6;

  // Build weighted options from available actions
  const options: { action: BetAction; weight: number }[] = [];

  for (const action of available) {
    let weight = 1;

    if (isStrong) {
      switch (action) {
        case "halfRaise":
        case "doubleRaise":
          weight = 7;
          break;
        case "allIn":
          weight = rank >= HandRank.TenPair ? 5 : 2;
          break;
        case "call":
          weight = 3;
          break;
        case "check":
          weight = 1;
          break;
        case "fold":
          weight = 0;
          break;
      }
    } else if (isMedium) {
      switch (action) {
        case "check":
          weight = isFacingBet ? 0 : 5;
          break;
        case "call":
          weight = 5;
          break;
        case "halfRaise":
          weight = 2;
          break;
        case "doubleRaise":
          weight = 1;
          break;
        case "allIn":
          weight = 0;
          break;
        case "fold":
          weight = isFacingBet ? 2 : 0;
          break;
      }
    } else if (isWeak) {
      switch (action) {
        case "check":
          weight = isFacingBet ? 0 : 6;
          break;
        case "call":
          weight = 2;
          break;
        case "halfRaise":
          weight = 1;
          break;
        case "doubleRaise":
          weight = 0;
          break;
        case "allIn":
          weight = 0;
          break;
        case "fold":
          weight = isFacingBet ? 5 : 0;
          break;
      }
    }

    // Adjust for visible player card intel
    if (visiblePlayerCard.number === aiHand[0].number || visiblePlayerCard.number === aiHand[1].number) {
      // Player might have a pair with one of our numbers - less likely we win
      if (action === "fold") weight += 2;
    }

    if (weight > 0) {
      options.push({ action, weight });
    }
  }

  if (options.length === 0) {
    // Fallback: pick first available
    return available[0];
  }

  return weightedRandom(options);
}
