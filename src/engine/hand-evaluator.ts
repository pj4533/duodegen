import { Stick, HandRank, HandResult, SpecialHand, ShowdownOutcome } from "./types";

const HAND_NAMES: Record<HandRank, string> = {
  [HandRank.PrimePair]: "Prime Pair",
  [HandRank.SuperiorPair]: "Superior Pair",
  [HandRank.TenPair]: "Ten Pair",
  [HandRank.Pair9]: "9 Pair",
  [HandRank.Pair8]: "8 Pair",
  [HandRank.Pair7]: "7 Pair",
  [HandRank.Pair6]: "6 Pair",
  [HandRank.Pair5]: "5 Pair",
  [HandRank.Pair4]: "4 Pair",
  [HandRank.Pair3]: "3 Pair",
  [HandRank.Pair2]: "2 Pair",
  [HandRank.Pair1]: "1 Pair",
  [HandRank.Ali]: "One-Two",
  [HandRank.DokSa]: "One-Four",
  [HandRank.GuBing]: "One-Nine",
  [HandRank.JangBing]: "One-Ten",
  [HandRank.JangSa]: "Four-Ten",
  [HandRank.SelRyuk]: "Four-Six",
  [HandRank.PerfectNine]: "Perfect Nine",
  [HandRank.Points8]: "8 Points",
  [HandRank.Points7]: "7 Points",
  [HandRank.Points6]: "6 Points",
  [HandRank.Points5]: "5 Points",
  [HandRank.Points4]: "4 Points",
  [HandRank.Points3]: "3 Points",
  [HandRank.Points2]: "2 Points",
  [HandRank.Points1]: "1 Point",
  [HandRank.MangTong]: "Zero",
};

function sortedNumbers(hand: [Stick, Stick]): [number, number] {
  const a = hand[0].number;
  const b = hand[1].number;
  return a <= b ? [a, b] : [b, a];
}

function bothRed(hand: [Stick, Stick]): boolean {
  return hand[0].color === "red" && hand[1].color === "red";
}

function hasNumbers(hand: [Stick, Stick], a: number, b: number): boolean {
  const [lo, hi] = sortedNumbers(hand);
  return lo === Math.min(a, b) && hi === Math.max(a, b);
}

function detectSpecial(hand: [Stick, Stick]): SpecialHand | null {
  // High Warden: Red 4 + Red 9
  if (hasNumbers(hand, 4, 9) && bothRed(hand)) return "highWarden";
  // Warden: 4+9 any color
  if (hasNumbers(hand, 4, 9)) return "warden";
  // Executor: Red 4 + Red 7
  if (hasNumbers(hand, 4, 7) && bothRed(hand)) return "executor";
  // Judge: 3+7 any color
  if (hasNumbers(hand, 3, 7)) return "judge";
  return null;
}

export function evaluateHand(hand: [Stick, Stick]): HandResult {
  const [lo, hi] = sortedNumbers(hand);
  const special = detectSpecial(hand);

  // Prime Pair: Red 3 + Red 8
  if (lo === 3 && hi === 8 && bothRed(hand)) {
    return { rank: HandRank.PrimePair, name: HAND_NAMES[HandRank.PrimePair], special: null };
  }

  // Superior Pair: Red 1 + Red 8 OR Red 1 + Red 3
  if (bothRed(hand) && lo === 1 && (hi === 8 || hi === 3)) {
    return { rank: HandRank.SuperiorPair, name: HAND_NAMES[HandRank.SuperiorPair], special: null };
  }

  // Ten Pair
  if (lo === 10 && hi === 10) {
    return { rank: HandRank.TenPair, name: HAND_NAMES[HandRank.TenPair], special: null };
  }

  // Regular Pairs (9 down to 1)
  if (lo === hi) {
    const rank = (HandRank.Pair1 + (lo - 1)) as HandRank;
    return { rank, name: HAND_NAMES[rank], special };
  }

  // Named hands
  if (lo === 1 && hi === 2) {
    return { rank: HandRank.Ali, name: HAND_NAMES[HandRank.Ali], special };
  }
  if (lo === 1 && hi === 4) {
    return { rank: HandRank.DokSa, name: HAND_NAMES[HandRank.DokSa], special };
  }
  if (lo === 1 && hi === 9) {
    return { rank: HandRank.GuBing, name: HAND_NAMES[HandRank.GuBing], special };
  }
  if (lo === 1 && hi === 10) {
    return { rank: HandRank.JangBing, name: HAND_NAMES[HandRank.JangBing], special };
  }
  if (lo === 4 && hi === 10) {
    return { rank: HandRank.JangSa, name: HAND_NAMES[HandRank.JangSa], special };
  }
  if (lo === 4 && hi === 6) {
    return { rank: HandRank.SelRyuk, name: HAND_NAMES[HandRank.SelRyuk], special };
  }

  // Point hands: last digit of sum
  const points = (lo + hi) % 10;
  if (points === 0) {
    return { rank: HandRank.MangTong, name: HAND_NAMES[HandRank.MangTong], special };
  }
  if (points === 9) {
    return { rank: HandRank.PerfectNine, name: HAND_NAMES[HandRank.PerfectNine], special };
  }
  const rank = points as HandRank; // Points1-Points8 map directly
  return { rank, name: HAND_NAMES[rank], special };
}

export function getHandDisplayName(result: HandResult): string {
  if (result.special) {
    const specialNames: Record<SpecialHand, string> = {
      judge: "Judge",
      executor: "Executor",
      warden: "Warden",
      highWarden: "High Warden",
    };
    return `${specialNames[result.special]} (${result.name})`;
  }
  return result.name;
}

/**
 * Resolve a showdown between two hands, accounting for special hand abilities.
 *
 * Resolution order:
 * 1. Prime Pair is unbeatable
 * 2. Executor (Red 4+7) beats Superior Pair
 * 3. Judge (3+7) beats 9-Pair or lower
 * 4. High Warden (Red 4+9) triggers rematch if opponent has 9-Pair or lower
 * 5. Warden (4+9) triggers rematch if opponent has Ali or lower
 * 6. Standard rank comparison
 */
export function resolveShowdown(
  hand1Result: HandResult,
  hand2Result: HandResult,
  rematchCount: number,
  maxRematches: number
): ShowdownOutcome & { specialResolution: string | null } {
  // 1. Prime Pair is unbeatable
  if (hand1Result.rank === HandRank.PrimePair && hand2Result.rank === HandRank.PrimePair) {
    return { result: "draw", specialResolution: null };
  }
  if (hand1Result.rank === HandRank.PrimePair) {
    return { result: "win", winner: "player1", specialResolution: null };
  }
  if (hand2Result.rank === HandRank.PrimePair) {
    return { result: "win", winner: "player2", specialResolution: null };
  }

  // 2. Executor beats Superior Pair only
  if (hand1Result.special === "executor" && hand2Result.rank === HandRank.SuperiorPair) {
    return {
      result: "win",
      winner: "player1",
      specialResolution: "Executor beats Superior Pair!",
    };
  }
  if (hand2Result.special === "executor" && hand1Result.rank === HandRank.SuperiorPair) {
    return {
      result: "win",
      winner: "player2",
      specialResolution: "Executor beats Superior Pair!",
    };
  }

  // 3. Judge beats 9-Pair or lower
  if (hand1Result.special === "judge") {
    if (hand2Result.rank <= HandRank.Pair9) {
      return {
        result: "win",
        winner: "player1",
        specialResolution: "Judge beats all Pairs 9 and below!",
      };
    }
    // Judge becomes Zero against Ten Pair or higher
    const judgeAsMangTong: HandResult = {
      rank: HandRank.MangTong,
      name: "Zero",
      special: null,
    };
    return resolveStandard(judgeAsMangTong, hand2Result);
  }
  if (hand2Result.special === "judge") {
    if (hand1Result.rank <= HandRank.Pair9) {
      return {
        result: "win",
        winner: "player2",
        specialResolution: "Judge beats all Pairs 9 and below!",
      };
    }
    const judgeAsMangTong: HandResult = {
      rank: HandRank.MangTong,
      name: "Zero",
      special: null,
    };
    return resolveStandard(hand1Result, judgeAsMangTong);
  }

  // 4. High Warden triggers rematch if opponent has 9-Pair or lower
  if (hand1Result.special === "highWarden" && hand2Result.rank <= HandRank.Pair9) {
    if (rematchCount < maxRematches) {
      return { result: "rematch", specialResolution: "High Warden triggers rematch!" };
    }
    // Max rematches reached, fall back to 3 points
    const wardenFallback: HandResult = {
      rank: HandRank.Points3,
      name: "3 Points",
      special: null,
    };
    return resolveStandard(wardenFallback, hand2Result);
  }
  if (hand2Result.special === "highWarden" && hand1Result.rank <= HandRank.Pair9) {
    if (rematchCount < maxRematches) {
      return { result: "rematch", specialResolution: "High Warden triggers rematch!" };
    }
    const wardenFallback: HandResult = {
      rank: HandRank.Points3,
      name: "3 Points",
      special: null,
    };
    return resolveStandard(hand1Result, wardenFallback);
  }

  // 5. Warden triggers rematch if opponent has Ali or lower
  if (hand1Result.special === "warden" && hand2Result.rank <= HandRank.Ali) {
    if (rematchCount < maxRematches) {
      return { result: "rematch", specialResolution: "Warden triggers rematch!" };
    }
    const wardenFallback: HandResult = {
      rank: HandRank.Points3,
      name: "3 Points",
      special: null,
    };
    return resolveStandard(wardenFallback, hand2Result);
  }
  if (hand2Result.special === "warden" && hand1Result.rank <= HandRank.Ali) {
    if (rematchCount < maxRematches) {
      return { result: "rematch", specialResolution: "Warden triggers rematch!" };
    }
    const wardenFallback: HandResult = {
      rank: HandRank.Points3,
      name: "3 Points",
      special: null,
    };
    return resolveStandard(hand1Result, wardenFallback);
  }

  // 6. Standard comparison (Executor fallback = 1 point, Warden fallback = 3 points)
  const effective1 = getEffectiveResult(hand1Result);
  const effective2 = getEffectiveResult(hand2Result);
  return resolveStandard(effective1, effective2);
}

function getEffectiveResult(result: HandResult): HandResult {
  if (result.special === "executor") {
    return { rank: HandRank.Points1, name: "1 Point", special: null };
  }
  if (result.special === "warden" || result.special === "highWarden") {
    return { rank: HandRank.Points3, name: "3 Points", special: null };
  }
  return result;
}

function resolveStandard(
  h1: HandResult,
  h2: HandResult
): ShowdownOutcome & { specialResolution: string | null } {
  if (h1.rank > h2.rank) return { result: "win", winner: "player1", specialResolution: null };
  if (h2.rank > h1.rank) return { result: "win", winner: "player2", specialResolution: null };
  return { result: "draw", specialResolution: null };
}
