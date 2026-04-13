export type StickColor = "red" | "yellow";

export interface Stick {
  number: number; // 1-10
  color: StickColor;
}

/**
 * Hand ranks ordered by strength. Higher numeric value = stronger hand.
 * Standard ranks are used for direct comparison via rank1 > rank2.
 */
export enum HandRank {
  MangTong = 0, // Zero (sum ends in 0)
  Points1 = 1,
  Points2 = 2,
  Points3 = 3,
  Points4 = 4,
  Points5 = 5,
  Points6 = 6,
  Points7 = 7,
  Points8 = 8,
  PerfectNine = 9,
  SelRyuk = 10, // 4+6
  JangSa = 11, // 4+10
  JangBing = 12, // 1+10
  GuBing = 13, // 1+9
  DokSa = 14, // 1+4
  Ali = 15, // 1+2
  Pair1 = 16,
  Pair2 = 17,
  Pair3 = 18,
  Pair4 = 19,
  Pair5 = 20,
  Pair6 = 21,
  Pair7 = 22,
  Pair8 = 23,
  Pair9 = 24,
  TenPair = 25,
  SuperiorPair = 26, // Red 1 + Red 8 OR Red 1 + Red 3
  PrimePair = 27, // Red 3 + Red 8
}

export type SpecialHand =
  | "judge" // 3+7: beats 9-Pair or lower, else becomes Zero
  | "executor" // Red 4 + Red 7: beats Superior Pair, else 1 Point
  | "warden" // 4+9 any color: rematch if opponent has Ali or lower
  | "highWarden"; // Red 4 + Red 9: rematch if opponent has 9-Pair or lower

export interface HandResult {
  rank: HandRank;
  name: string;
  special: SpecialHand | null;
}

export type ShowdownOutcome =
  | { result: "win"; winner: "player1" | "player2" }
  | { result: "draw" }
  | { result: "rematch" };

export type BetAction =
  | "check"
  | "call"
  | "halfRaise"
  | "doubleRaise"
  | "allIn"
  | "fold";

export interface BetState {
  pot: number;
  currentBet: number;
  playerSilver: number;
  aiSilver: number;
  playerBetThisRound: number;
  aiBetThisRound: number;
  lastRaise: number;
  bettingStarted: boolean;
  playerActed: boolean;
  aiActed: boolean;
}

export type GamePhase =
  | "idle"
  | "dealing"
  | "playerBet"
  | "aiBet"
  | "showdown"
  | "rematch"
  | "roundEnd";

export interface ActionLogEntry {
  actor: "player" | "ai";
  action: BetAction;
  amount: number;
}

export interface GameState {
  phase: GamePhase;
  deck: Stick[];
  playerHand: [Stick, Stick] | null;
  aiHand: [Stick, Stick] | null;
  revealedAiCardIndex: 0 | 1;
  revealedPlayerCardIndex: 0 | 1;
  bet: BetState;
  roundNumber: number;
  playerHasFirstTurn: boolean;
  rematchCount: number;
  lastResult: RoundResult | null;
  gameOver: boolean;
  actionLog: ActionLogEntry[];
}

export interface RoundResult {
  playerHand: [Stick, Stick];
  aiHand: [Stick, Stick];
  playerHandResult: HandResult;
  aiHandResult: HandResult;
  winner: "player" | "ai" | "draw";
  potWon: number;
  wasRematch: boolean;
  specialResolution: string | null;
}

export type GameAction =
  | { type: "START_ROUND" }
  | {
      type: "DEAL_COMPLETE";
      playerHand: [Stick, Stick];
      aiHand: [Stick, Stick];
      revealedAiIndex: 0 | 1;
      revealedPlayerIndex: 0 | 1;
    }
  | { type: "PLAYER_BET"; action: BetAction }
  | { type: "AI_BET"; action: BetAction }
  | { type: "TIMER_EXPIRED" }
  | { type: "RESOLVE_SHOWDOWN" }
  | {
      type: "REMATCH_DEAL";
      playerHand: [Stick, Stick];
      aiHand: [Stick, Stick];
      revealedAiIndex: 0 | 1;
      revealedPlayerIndex: 0 | 1;
    }
  | { type: "ROUND_COMPLETE"; result: RoundResult }
  | { type: "NEW_GAME" };

// --- Learning Mode / Strategy Advisor Types ---

export type HandStrengthTier = "premium" | "strong" | "medium" | "weak" | "trash";
export type ActionAdvice = "raise" | "call" | "check" | "fold" | "allIn";

export interface StrategyAdvice {
  recommendedAction: ActionAdvice;
  confidence: "high" | "moderate" | "low";
  headline: string;
  reasons: string[];
  handStrength: HandStrengthTier;
  handPercentile: number;
  opponentThreat: string;
  blockerNote: string | null;
  potOdds: { needed: number; favorable: boolean } | null;
  bluffViable: boolean;
  bluffReason: string | null;
}
