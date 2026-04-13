import { HandRank, SpecialHand } from "./types";

export type HandNameStyle = "crimsonDesert" | "traditional";

interface HandNameSet {
  ranks: Record<HandRank, string>;
  specials: Record<SpecialHand, string>;
}

const CRIMSON_DESERT_NAMES: HandNameSet = {
  ranks: {
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
  },
  specials: {
    judge: "Judge",
    executor: "Executor",
    warden: "Warden",
    highWarden: "High Warden",
  },
};

const TRADITIONAL_NAMES: HandNameSet = {
  ranks: {
    [HandRank.PrimePair]: "38 Bright Pair",
    [HandRank.SuperiorPair]: "Bright Pair",
    [HandRank.TenPair]: "10 Ttaeng",
    [HandRank.Pair9]: "9 Ttaeng",
    [HandRank.Pair8]: "8 Ttaeng",
    [HandRank.Pair7]: "7 Ttaeng",
    [HandRank.Pair6]: "6 Ttaeng",
    [HandRank.Pair5]: "5 Ttaeng",
    [HandRank.Pair4]: "4 Ttaeng",
    [HandRank.Pair3]: "3 Ttaeng",
    [HandRank.Pair2]: "2 Ttaeng",
    [HandRank.Pair1]: "1 Ttaeng",
    [HandRank.Ali]: "Ali",
    [HandRank.DokSa]: "Dok-sa",
    [HandRank.GuBing]: "Gu-bing",
    [HandRank.JangBing]: "Jang-bing",
    [HandRank.JangSa]: "Jang-sa",
    [HandRank.SelRyuk]: "Se-ryuk",
    [HandRank.PerfectNine]: "Gap-o",
    [HandRank.Points8]: "8 Kkeut",
    [HandRank.Points7]: "7 Kkeut",
    [HandRank.Points6]: "6 Kkeut",
    [HandRank.Points5]: "5 Kkeut",
    [HandRank.Points4]: "4 Kkeut",
    [HandRank.Points3]: "3 Kkeut",
    [HandRank.Points2]: "2 Kkeut",
    [HandRank.Points1]: "1 Kkeut",
    [HandRank.MangTong]: "Mang-tong",
  },
  specials: {
    judge: "Pair Catcher",
    executor: "Secret Inspector",
    warden: "Gu-sa",
    highWarden: "Animal Gu-sa",
  },
};

const NAME_SETS: Record<HandNameStyle, HandNameSet> = {
  crimsonDesert: CRIMSON_DESERT_NAMES,
  traditional: TRADITIONAL_NAMES,
};

export function getHandName(rank: HandRank, style: HandNameStyle): string {
  return NAME_SETS[style].ranks[rank];
}

export function getSpecialName(
  special: SpecialHand,
  style: HandNameStyle
): string {
  return NAME_SETS[style].specials[special];
}

export function getDisplayName(
  rank: HandRank,
  special: SpecialHand | null,
  style: HandNameStyle
): string {
  const rankName = getHandName(rank, style);
  if (special) {
    const specialName = getSpecialName(special, style);
    return `${specialName} (${rankName})`;
  }
  return rankName;
}

// Guide data for HandGuide and Rules page
export function getRankingsGuide(style: HandNameStyle) {
  const names = NAME_SETS[style];
  return [
    { name: names.ranks[HandRank.PrimePair], cards: "Red 3 + Red 8", tier: "special" as const },
    { name: names.ranks[HandRank.SuperiorPair], cards: "Red 1 + Red 8 or Red 1 + Red 3", tier: "special" as const },
    { name: names.ranks[HandRank.TenPair], cards: "10 + 10", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair9], cards: "9 + 9", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair8], cards: "8 + 8", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair7], cards: "7 + 7", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair6], cards: "6 + 6", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair5], cards: "5 + 5", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair4], cards: "4 + 4", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair3], cards: "3 + 3", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair2], cards: "2 + 2", tier: "pair" as const },
    { name: names.ranks[HandRank.Pair1], cards: "1 + 1", tier: "pair" as const },
    { name: names.ranks[HandRank.Ali], cards: "1 + 2", tier: "named" as const },
    { name: names.ranks[HandRank.DokSa], cards: "1 + 4", tier: "named" as const },
    { name: names.ranks[HandRank.GuBing], cards: "1 + 9", tier: "named" as const },
    { name: names.ranks[HandRank.JangBing], cards: "1 + 10", tier: "named" as const },
    { name: names.ranks[HandRank.JangSa], cards: "4 + 10", tier: "named" as const },
    { name: names.ranks[HandRank.SelRyuk], cards: "4 + 6", tier: "named" as const },
    { name: names.ranks[HandRank.PerfectNine], cards: "Sum ends in 9", tier: "points" as const },
    { name: "8-1 " + (style === "crimsonDesert" ? "Points" : "Kkeut"), cards: "Sum ends in 8-1", tier: "points" as const },
    { name: names.ranks[HandRank.MangTong], cards: "Sum ends in 0", tier: "points" as const },
  ];
}

export function getSpecialsGuide(style: HandNameStyle) {
  const names = NAME_SETS[style];
  return [
    {
      name: names.specials.judge,
      cards: "3 + 7",
      effect: style === "crimsonDesert"
        ? "Beats 9-Pair or lower. Becomes Zero vs Ten Pair+."
        : "Beats 9 Ttaeng or lower. Becomes Mang-tong vs 10 Ttaeng+.",
    },
    {
      name: names.specials.executor,
      cards: "Red 4 + Red 7",
      effect: style === "crimsonDesert"
        ? "Beats Superior Pair only. Becomes 1 Point otherwise."
        : "Beats Bright Pair only. Becomes 1 Kkeut otherwise.",
    },
    {
      name: names.specials.warden,
      cards: "4 + 9",
      effect: style === "crimsonDesert"
        ? "Rematch if opponent has One-Two or lower."
        : "Rematch if opponent has Ali or lower.",
    },
    {
      name: names.specials.highWarden,
      cards: "Red 4 + Red 9",
      effect: style === "crimsonDesert"
        ? "Rematch if opponent has 9-Pair or lower."
        : "Rematch if opponent has 9 Ttaeng or lower.",
    },
  ];
}
