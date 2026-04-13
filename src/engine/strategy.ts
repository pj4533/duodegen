import {
  Stick,
  HandRank,
  HandResult,
  BetState,
  GamePhase,
  StrategyAdvice,
  HandStrengthTier,
  ActionAdvice,
} from "./types";
import { evaluateHand } from "./hand-evaluator";
import { getDisplayName, HandNameStyle } from "./hand-names";

// --- Hand Strength Classification ---

const TIER_MAP: Record<HandStrengthTier, HandRank[]> = {
  premium: [HandRank.PrimePair, HandRank.SuperiorPair, HandRank.TenPair],
  strong: [
    HandRank.Pair9, HandRank.Pair8, HandRank.Pair7, HandRank.Pair6,
    HandRank.Pair5, HandRank.Pair4, HandRank.Pair3, HandRank.Pair2,
    HandRank.Pair1, HandRank.Ali, HandRank.DokSa,
  ],
  medium: [
    HandRank.GuBing, HandRank.JangBing, HandRank.JangSa, HandRank.SelRyuk,
    HandRank.PerfectNine, HandRank.Points8, HandRank.Points7,
  ],
  weak: [HandRank.Points6, HandRank.Points5],
  trash: [
    HandRank.Points4, HandRank.Points3, HandRank.Points2,
    HandRank.Points1, HandRank.MangTong,
  ],
};

export function classifyHandStrength(result: HandResult): {
  tier: HandStrengthTier;
  percentile: number;
} {
  // Special hands get special treatment
  if (result.special === "judge") {
    return { tier: "strong", percentile: 75 };
  }
  if (result.special === "executor") {
    return { tier: "weak", percentile: 30 };
  }
  if (result.special === "highWarden") {
    return { tier: "medium", percentile: 55 };
  }
  if (result.special === "warden") {
    return { tier: "medium", percentile: 50 };
  }

  const percentile = Math.round((result.rank / HandRank.PrimePair) * 100);

  for (const [tier, ranks] of Object.entries(TIER_MAP)) {
    if (ranks.includes(result.rank)) {
      return { tier: tier as HandStrengthTier, percentile };
    }
  }

  return { tier: "weak", percentile };
}

// --- Starting Card Strength ---

const STARTING_CARD_STRENGTH: Record<number, { rank: number; label: string }> = {
  1: { rank: 1, label: "strongest start (73% chance of good hand)" },
  4: { rank: 2, label: "strong start (52% chance of good hand)" },
  9: { rank: 3, label: "above average start" },
  10: { rank: 3, label: "above average start" },
  3: { rank: 4, label: "average start" },
  8: { rank: 5, label: "average start" },
  7: { rank: 5, label: "average start" },
  2: { rank: 6, label: "below average start" },
  6: { rank: 6, label: "below average start" },
  5: { rank: 7, label: "weakest start (15% chance of good hand)" },
};

// --- Opponent Visible Card Analysis ---

export interface OpponentAnalysis {
  threatLevel: "high" | "moderate" | "low";
  threat: string;
  possibleStrong: string[];
  blockedHands: string[];
}

export function analyzeOpponentVisible(
  visibleCard: Stick,
  playerHand: [Stick, Stick],
  nameStyle: HandNameStyle = "crimsonDesert"
): OpponentAnalysis {
  const cd = nameStyle === "crimsonDesert";
  const num = visibleCard.number;
  const isRed = visibleCard.color === "red";
  const playerNums = [playerHand[0].number, playerHand[1].number];
  const playerCards = playerHand.map(
    (s) => `${s.color === "red" ? "R" : "Y"}${s.number}`
  );

  const possibleStrong: string[] = [];
  const blockedHands: string[] = [];

  // Check what strong hands the opponent could form
  if (num === 1) {
    if (isRed) {
      if (!playerCards.includes("R3")) possibleStrong.push("Superior Pair (R1+R3)");
      else blockedHands.push("Superior Pair");
      if (!playerCards.includes("R8")) possibleStrong.push("Superior Pair (R1+R8)");
      else blockedHands.push("Superior Pair");
    }
    if (!playerNums.includes(1)) possibleStrong.push("1 Pair");
    else blockedHands.push("1 Pair");
    if (!playerNums.includes(2)) possibleStrong.push(`${cd ? "One-Two" : "Ali"} (1+2)`);
    else blockedHands.push(cd ? "One-Two" : "Ali");
    if (!playerNums.includes(4)) possibleStrong.push(`${cd ? "One-Four" : "Dok-sa"} (1+4)`);
    else blockedHands.push(cd ? "One-Four" : "Dok-sa");
    if (!playerNums.includes(9)) possibleStrong.push(`${cd ? "One-Nine" : "Gu-bing"} (1+9)`);
    else blockedHands.push(cd ? "One-Nine" : "Gu-bing");
    if (!playerNums.includes(10)) possibleStrong.push(`${cd ? "One-Ten" : "Jang-bing"} (1+10)`);
    else blockedHands.push(cd ? "One-Ten" : "Jang-bing");
  } else if (num === 3) {
    if (isRed && !playerCards.includes("R8")) {
      possibleStrong.push("Prime Pair (R3+R8)");
    } else if (isRed && playerCards.includes("R8")) {
      blockedHands.push("Prime Pair");
    }
    if (!playerNums.includes(3)) possibleStrong.push("3 Pair");
    else blockedHands.push("3 Pair");
    if (!playerNums.includes(7)) possibleStrong.push("Judge (3+7)");
    else blockedHands.push("Judge");
  } else if (num === 8) {
    if (isRed && !playerCards.includes("R3")) {
      possibleStrong.push("Prime Pair (R3+R8)");
    } else if (isRed && playerCards.includes("R3")) {
      blockedHands.push("Prime Pair");
    }
    if (!playerNums.includes(8)) possibleStrong.push("8 Pair");
    else blockedHands.push("8 Pair");
  } else if (num === 4) {
    if (!playerNums.includes(4)) possibleStrong.push("4 Pair");
    else blockedHands.push("4 Pair");
    if (!playerNums.includes(1)) possibleStrong.push(`${cd ? "One-Four" : "Dok-sa"} (1+4)`);
    else blockedHands.push(cd ? "One-Four" : "Dok-sa");
    if (!playerNums.includes(10)) possibleStrong.push(`${cd ? "Four-Ten" : "Jang-sa"} (4+10)`);
    else blockedHands.push(cd ? "Four-Ten" : "Jang-sa");
    if (!playerNums.includes(6)) possibleStrong.push(`${cd ? "Four-Six" : "Se-ryuk"} (4+6)`);
    else blockedHands.push(cd ? "Four-Six" : "Se-ryuk");
    if (isRed && !playerCards.includes("R7")) possibleStrong.push("Executor (R4+R7)");
    else if (isRed && playerCards.includes("R7")) blockedHands.push("Executor");
    if (isRed && !playerCards.includes("R9")) possibleStrong.push("High Warden (R4+R9)");
    else if (isRed && playerCards.includes("R9")) blockedHands.push("High Warden");
    if (!playerNums.includes(9)) possibleStrong.push("Warden (4+9)");
    else blockedHands.push("Warden");
  } else if (num === 7) {
    if (!playerNums.includes(7)) possibleStrong.push("7 Pair");
    else blockedHands.push("7 Pair");
    if (!playerNums.includes(3)) possibleStrong.push("Judge (3+7)");
    else blockedHands.push("Judge");
    if (isRed && !playerCards.includes("R4")) possibleStrong.push("Executor (R4+R7)");
    else if (isRed && playerCards.includes("R4")) blockedHands.push("Executor");
  } else if (num === 9) {
    if (!playerNums.includes(9)) possibleStrong.push("9 Pair");
    else blockedHands.push("9 Pair");
    if (!playerNums.includes(1)) possibleStrong.push(`${cd ? "One-Nine" : "Gu-bing"} (1+9)`);
    else blockedHands.push(cd ? "One-Nine" : "Gu-bing");
    if (!playerNums.includes(4)) possibleStrong.push("Warden (4+9)");
    else blockedHands.push("Warden");
    if (isRed && !playerCards.includes("R4")) possibleStrong.push("High Warden (R4+R9)");
    else if (isRed && playerCards.includes("R4")) blockedHands.push("High Warden");
  } else if (num === 10) {
    if (!playerNums.includes(10)) possibleStrong.push("10 Pair");
    else blockedHands.push("10 Pair");
    if (!playerNums.includes(1)) possibleStrong.push(`${cd ? "One-Ten" : "Jang-bing"} (1+10)`);
    else blockedHands.push(cd ? "One-Ten" : "Jang-bing");
    if (!playerNums.includes(4)) possibleStrong.push(`${cd ? "Four-Ten" : "Jang-sa"} (4+10)`);
    else blockedHands.push(cd ? "Four-Ten" : "Jang-sa");
  } else if (num === 2) {
    if (!playerNums.includes(2)) possibleStrong.push("2 Pair");
    else blockedHands.push("2 Pair");
    if (!playerNums.includes(1)) possibleStrong.push(`${cd ? "One-Two" : "Ali"} (1+2)`);
    else blockedHands.push(cd ? "One-Two" : "Ali");
  } else if (num === 5) {
    if (!playerNums.includes(5)) possibleStrong.push("5 Pair");
    else blockedHands.push("5 Pair");
  } else if (num === 6) {
    if (!playerNums.includes(6)) possibleStrong.push("6 Pair");
    else blockedHands.push("6 Pair");
    if (!playerNums.includes(4)) possibleStrong.push(`${cd ? "Four-Six" : "Se-ryuk"} (4+6)`);
    else blockedHands.push(cd ? "Four-Six" : "Se-ryuk");
  }

  // Determine threat level
  let threatLevel: "high" | "moderate" | "low";
  if (num === 1 || (isRed && (num === 3 || num === 8))) {
    threatLevel = "high";
  } else if (num === 4 || num === 9 || num === 10) {
    threatLevel = "moderate";
  } else {
    threatLevel = "low";
  }

  const startStrength = STARTING_CARD_STRENGTH[num];
  const threat = `Shows ${num}${isRed ? " (Red)" : ""} - ${startStrength?.label ?? "average start"}`;

  return { threatLevel, threat, possibleStrong, blockedHands };
}

// --- Win Probability Against Opponent Range ---

export function calculateWinProbability(
  playerHand: [Stick, Stick],
  visibleOpponentCard: Stick
): number {
  const playerResult = evaluateHand(playerHand);
  const playerNums = new Set([
    `${playerHand[0].color[0]}${playerHand[0].number}`,
    `${playerHand[1].color[0]}${playerHand[1].number}`,
  ]);
  const visibleKey = `${visibleOpponentCard.color[0]}${visibleOpponentCard.number}`;

  // Build all possible hidden cards (20 total minus player's 2 minus the visible one)
  const allCards: Stick[] = [];
  for (let n = 1; n <= 10; n++) {
    for (const color of ["red", "yellow"] as const) {
      const key = `${color[0]}${n}`;
      if (!playerNums.has(key) && key !== visibleKey) {
        allCards.push({ number: n, color });
      }
    }
  }

  let wins = 0;
  let draws = 0;
  for (const hidden of allCards) {
    const opponentHand: [Stick, Stick] = [visibleOpponentCard, hidden];
    const opponentResult = evaluateHand(opponentHand);

    // Simple rank comparison (ignoring special hand interactions for speed)
    const effectivePlayerRank = getEffectiveRank(playerResult);
    const effectiveOpponentRank = getEffectiveRank(opponentResult);

    if (effectivePlayerRank > effectiveOpponentRank) wins++;
    else if (effectivePlayerRank === effectiveOpponentRank) draws++;
  }

  return Math.round(((wins + draws * 0.5) / allCards.length) * 100);
}

function getEffectiveRank(result: HandResult): number {
  if (result.special === "executor") return HandRank.Points1;
  if (result.special === "warden" || result.special === "highWarden") return HandRank.Points3;
  if (result.special === "judge") return HandRank.Pair8; // average case: beats most pairs
  return result.rank;
}

// --- Pot Odds ---

export function calculatePotOdds(betState: BetState): {
  needed: number;
  favorable: boolean;
} | null {
  const toCall = betState.currentBet - betState.playerBetThisRound;
  if (toCall <= 0) return null;

  const needed = Math.round((toCall / (betState.pot + toCall)) * 100);
  return { needed, favorable: needed <= 50 };
}

// --- Bluff Assessment ---

export function assessBluffViability(
  visiblePlayerCard: Stick,
  handTier: HandStrengthTier,
  potSize: number
): { viable: boolean; reason: string | null } {
  if (handTier !== "weak" && handTier !== "trash") {
    return { viable: false, reason: null };
  }

  const num = visiblePlayerCard.number;
  const isRed = visiblePlayerCard.color === "red";

  // Strong bluff cards: 1 (opponent fears Ali/Pair/Gwang), Red 3 or Red 8 (fears Gwang-ttaeng)
  if (num === 1) {
    return {
      viable: true,
      reason: "Your visible 1 threatens Ali, Pairs, or Gwang-ttaeng",
    };
  }
  if (isRed && (num === 3 || num === 8)) {
    return {
      viable: true,
      reason: `Your visible Red ${num} threatens Prime Pair`,
    };
  }
  if (num === 4) {
    return {
      viable: potSize <= 6,
      reason: potSize <= 6
        ? "Your visible 4 threatens Dok Sa, Jang Sa, or specials"
        : "Pot too large to bluff safely",
    };
  }

  return {
    viable: false,
    reason: `Visible ${num} doesn't threaten strong hands`,
  };
}

// --- Action Recommendation ---

export function recommendAction(
  tier: HandStrengthTier,
  isFacingBet: boolean,
  potOdds: { needed: number; favorable: boolean } | null,
  special: string | null,
  winProbability: number
): { action: ActionAdvice; confidence: "high" | "moderate" | "low"; reasons: string[] } {
  const reasons: string[] = [];

  // Premium hands: always raise
  if (tier === "premium") {
    reasons.push(`Wins against ${winProbability}% of possible hands`);
    reasons.push("Top-tier hand, maximize the pot");
    return { action: "raise", confidence: "high", reasons };
  }

  // Strong hands: raise or call depending on context
  if (tier === "strong") {
    reasons.push(`Wins against ${winProbability}% of possible hands`);
    if (special === "judge") {
      reasons.push("Judge beats all Pairs 9 and below");
      reasons.push("Caution: becomes Zero vs Ten Pair or higher");
    }
    if (isFacingBet) {
      return { action: "call", confidence: "high", reasons };
    }
    return { action: "raise", confidence: "high", reasons };
  }

  // Medium hands: call or check
  if (tier === "medium") {
    reasons.push(`Wins against ${winProbability}% of possible hands`);
    if (special === "warden" || special === "highWarden") {
      reasons.push("May trigger rematch if opponent is weak");
      reasons.push("Falls back to 3 Points if no rematch");
    }
    if (isFacingBet) {
      if (potOdds && potOdds.favorable) {
        reasons.push(`Pot odds favorable (need ${potOdds.needed}% equity)`);
        return { action: "call", confidence: "moderate", reasons };
      }
      reasons.push("Consider folding if raise is large");
      return { action: "call", confidence: "low", reasons };
    }
    return { action: "check", confidence: "moderate", reasons };
  }

  // Weak hands: check or fold
  if (tier === "weak") {
    reasons.push(`Only wins against ${winProbability}% of possible hands`);
    if (special === "executor") {
      reasons.push("Executor only beats Superior Pair (very rare)");
      reasons.push("Falls back to 1 Point otherwise");
    }
    if (isFacingBet) {
      if (potOdds && potOdds.favorable && potOdds.needed <= 25) {
        reasons.push(`Small call with favorable odds (need ${potOdds.needed}%)`);
        return { action: "call", confidence: "low", reasons };
      }
      return { action: "fold", confidence: "moderate", reasons };
    }
    return { action: "check", confidence: "moderate", reasons };
  }

  // Trash hands: fold or check
  reasons.push(`Very weak hand, wins only ${winProbability}% of the time`);
  if (isFacingBet) {
    return { action: "fold", confidence: "high", reasons };
  }
  return { action: "check", confidence: "moderate", reasons };
}

// --- Headline Generator ---

function buildHeadline(
  action: ActionAdvice,
  result: HandResult,
  tier: HandStrengthTier,
  nameStyle: HandNameStyle
): string {
  const handName = getDisplayName(result.rank, result.special, nameStyle);
  const tierLabels: Record<HandStrengthTier, string> = {
    premium: "elite",
    strong: "strong",
    medium: "decent",
    weak: "weak",
    trash: "very weak",
  };
  const actionLabels: Record<ActionAdvice, string> = {
    raise: "RAISE",
    call: "CALL",
    check: "CHECK",
    fold: "FOLD",
    allIn: "ALL IN",
  };

  return `${actionLabels[action]} \u2014 ${handName} is a ${tierLabels[tier]} hand`;
}

// --- Main Entry Point ---

export function generateAdvice(
  playerHand: [Stick, Stick],
  playerResult: HandResult,
  visibleOpponentCard: Stick,
  revealedPlayerCardIndex: 0 | 1,
  betState: BetState,
  phase: GamePhase,
  nameStyle: HandNameStyle = "crimsonDesert"
): StrategyAdvice | null {
  if (phase === "idle" || phase === "dealing" || phase === "rematch") {
    return null;
  }

  const { tier, percentile } = classifyHandStrength(playerResult);
  const opponentAnalysis = analyzeOpponentVisible(visibleOpponentCard, playerHand, nameStyle);
  const isFacingBet = betState.currentBet > betState.playerBetThisRound;
  const potOdds = calculatePotOdds(betState);
  const winProb = calculateWinProbability(playerHand, visibleOpponentCard);

  const visiblePlayerCard = playerHand[revealedPlayerCardIndex];
  const bluff = assessBluffViability(visiblePlayerCard, tier, betState.pot);

  const { action, confidence, reasons } = recommendAction(
    tier,
    isFacingBet,
    potOdds,
    playerResult.special,
    winProb
  );

  // Build blocker note
  let blockerNote: string | null = null;
  if (opponentAnalysis.blockedHands.length > 0) {
    const top = opponentAnalysis.blockedHands.slice(0, 2);
    blockerNote = `You block: ${top.join(", ")}`;
  }

  // Enhance reasons with opponent info
  const fullReasons = [...reasons];
  if (opponentAnalysis.threatLevel === "high" && tier !== "premium" && tier !== "strong") {
    fullReasons.push(`Opponent's visible card is dangerous (${opponentAnalysis.threat.split(" - ")[1]})`);
  }
  if (blockerNote) {
    fullReasons.push(blockerNote);
  }

  // Override: if bluff is viable and hand is bad, suggest it as alternative
  let finalAction = action;
  if (bluff.viable && action === "fold" && !isFacingBet) {
    finalAction = "raise";
    fullReasons.length = 0;
    fullReasons.push("Bluff opportunity!");
    if (bluff.reason) fullReasons.push(bluff.reason);
    fullReasons.push("Raise small to represent strength");
  }

  return {
    recommendedAction: finalAction,
    confidence,
    headline: buildHeadline(finalAction, playerResult, tier, nameStyle),
    reasons: fullReasons.slice(0, 3),
    handStrength: tier,
    handPercentile: percentile,
    opponentThreat: opponentAnalysis.threat,
    blockerNote,
    potOdds,
    bluffViable: bluff.viable,
    bluffReason: bluff.reason,
  };
}

// --- Showdown Analysis ---

export function generateShowdownAdvice(
  playerResult: HandResult,
  aiResult: HandResult,
  winner: "player" | "ai" | "draw",
  nameStyle: HandNameStyle = "crimsonDesert"
): StrategyAdvice {
  const { tier, percentile } = classifyHandStrength(playerResult);
  const aiTier = classifyHandStrength(aiResult);
  const pName = getDisplayName(playerResult.rank, playerResult.special, nameStyle);
  const aName = getDisplayName(aiResult.rank, aiResult.special, nameStyle);

  const reasons: string[] = [];
  let headline: string;

  if (winner === "player") {
    headline = `WIN \u2014 Your ${pName} beat ${aName}`;
    if (tier === "premium" || tier === "strong") {
      reasons.push("Strong hand paid off");
    } else if (tier === "weak" || tier === "trash") {
      reasons.push("Lucky win with a weak hand \u2014 don't count on this");
    }
  } else if (winner === "ai") {
    headline = `LOSS \u2014 ${aName} beat your ${pName}`;
    if (tier === "weak" || tier === "trash") {
      reasons.push("Folding would have saved Silver here");
    }
    if (aiTier.tier === "premium" || aiTier.tier === "strong") {
      reasons.push("Opponent had a strong hand \u2014 hard to avoid");
    }
  } else {
    headline = `DRAW \u2014 Both had ${pName}`;
    reasons.push("Pot split evenly");
  }

  if (playerResult.special) {
    const specialNotes: Record<string, string> = {
      judge: "Judge can surprise opponents \u2014 great for trapping",
      executor: "Executor is very situational \u2014 rarely connects",
      warden: "Warden rematches add variance to the game",
      highWarden: "High Warden covers a wide range for rematches",
    };
    if (specialNotes[playerResult.special]) {
      reasons.push(specialNotes[playerResult.special]);
    }
  }

  return {
    recommendedAction: "check",
    confidence: "moderate",
    headline,
    reasons: reasons.slice(0, 3),
    handStrength: tier,
    handPercentile: percentile,
    opponentThreat: `Opponent had: ${aName}`,
    blockerNote: null,
    potOdds: null,
    bluffViable: false,
    bluffReason: null,
  };
}
