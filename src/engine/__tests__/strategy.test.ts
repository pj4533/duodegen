import { describe, it, expect } from "vitest";
import {
  classifyHandStrength,
  analyzeOpponentVisible,
  calculateWinProbability,
  calculatePotOdds,
  assessBluffViability,
  recommendAction,
  generateAdvice,
  generateShowdownAdvice,
} from "../strategy";
import { evaluateHand } from "../hand-evaluator";
import { Stick, BetState } from "../types";

function stick(number: number, color: "red" | "yellow" = "red"): Stick {
  return { number, color };
}

function baseBetState(overrides?: Partial<BetState>): BetState {
  return {
    pot: 2,
    currentBet: 0,
    playerSilver: 14,
    aiSilver: 14,
    playerBetThisRound: 0,
    aiBetThisRound: 0,
    lastRaise: 0,
    bettingStarted: false,
    playerActed: false,
    aiActed: false,
    ...overrides,
  };
}

describe("classifyHandStrength", () => {
  it("classifies Prime Pair as premium", () => {
    const result = evaluateHand([stick(3, "red"), stick(8, "red")]);
    const { tier, percentile } = classifyHandStrength(result);
    expect(tier).toBe("premium");
    expect(percentile).toBe(100);
  });

  it("classifies Ten Pair as premium", () => {
    const result = evaluateHand([stick(10, "red"), stick(10, "yellow")]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("premium");
  });

  it("classifies Ali as strong", () => {
    const result = evaluateHand([stick(1), stick(2)]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("strong");
  });

  it("classifies 9 Pair as strong", () => {
    const result = evaluateHand([stick(9, "red"), stick(9, "yellow")]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("strong");
  });

  it("classifies Perfect Nine as medium", () => {
    const result = evaluateHand([stick(2), stick(7)]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("medium");
  });

  it("classifies 7 Points as medium", () => {
    const result = evaluateHand([stick(5), stick(2, "yellow")]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("medium");
  });

  it("classifies 5 Points as weak", () => {
    const result = evaluateHand([stick(2, "yellow"), stick(3, "yellow")]);
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("weak");
  });

  it("classifies Mang Tong as trash", () => {
    const result = evaluateHand([stick(2, "yellow"), stick(8, "yellow")]); // 2+8=10, 0 points
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("trash");
  });

  it("classifies Judge as strong", () => {
    const result = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
    expect(result.special).toBe("judge");
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("strong");
  });

  it("classifies Executor as weak", () => {
    const result = evaluateHand([stick(4, "red"), stick(7, "red")]);
    expect(result.special).toBe("executor");
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("weak");
  });

  it("classifies Warden as medium", () => {
    const result = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
    expect(result.special).toBe("warden");
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("medium");
  });

  it("classifies High Warden as medium", () => {
    const result = evaluateHand([stick(4, "red"), stick(9, "red")]);
    expect(result.special).toBe("highWarden");
    const { tier } = classifyHandStrength(result);
    expect(tier).toBe("medium");
  });
});

describe("analyzeOpponentVisible", () => {
  it("flags opponent showing 1 as high threat", () => {
    const analysis = analyzeOpponentVisible(
      stick(1, "red"),
      [stick(5, "red"), stick(6, "yellow")]
    );
    expect(analysis.threatLevel).toBe("high");
    expect(analysis.possibleStrong.length).toBeGreaterThan(3);
  });

  it("flags opponent showing 5 as low threat", () => {
    const analysis = analyzeOpponentVisible(
      stick(5, "yellow"),
      [stick(1, "red"), stick(2, "red")]
    );
    expect(analysis.threatLevel).toBe("low");
    expect(analysis.possibleStrong.length).toBeLessThanOrEqual(1);
  });

  it("detects blocked hands when player holds matching cards", () => {
    const analysis = analyzeOpponentVisible(
      stick(3, "red"),
      [stick(8, "red"), stick(2, "yellow")]
    );
    expect(analysis.blockedHands).toContain("Prime Pair");
  });

  it("shows Prime Pair as possible when not blocked", () => {
    const analysis = analyzeOpponentVisible(
      stick(3, "red"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.possibleStrong).toContain("Prime Pair (R3+R8)");
  });

  it("includes Judge as possible for opponent showing 3", () => {
    const analysis = analyzeOpponentVisible(
      stick(3, "yellow"),
      [stick(5, "red"), stick(6, "red")]
    );
    expect(analysis.possibleStrong).toContain("Judge (3+7)");
  });

  it("blocks Judge when player holds both 7s", () => {
    const analysis = analyzeOpponentVisible(
      stick(3, "yellow"),
      [stick(7, "red"), stick(7, "yellow")]
    );
    expect(analysis.blockedHands).toContain("Judge");
  });

  it("analyzes opponent showing 4 (moderate threat)", () => {
    const analysis = analyzeOpponentVisible(
      stick(4, "red"),
      [stick(5, "yellow"), stick(2, "yellow")] // don't hold 6, 7, 9, 10 so they're all possible
    );
    expect(analysis.threatLevel).toBe("moderate");
    expect(analysis.possibleStrong).toContain("One-Four (1+4)");
    expect(analysis.possibleStrong).toContain("Four-Ten (4+10)");
    expect(analysis.possibleStrong).toContain("Four-Six (4+6)");
    expect(analysis.possibleStrong).toContain("Executor (R4+R7)");
    expect(analysis.possibleStrong).toContain("High Warden (R4+R9)");
    expect(analysis.possibleStrong).toContain("Warden (4+9)");
  });

  it("blocks Executor when player holds R7 against R4", () => {
    const analysis = analyzeOpponentVisible(
      stick(4, "red"),
      [stick(7, "red"), stick(2, "yellow")]
    );
    expect(analysis.blockedHands).toContain("Executor");
  });

  it("analyzes opponent showing 7", () => {
    const analysis = analyzeOpponentVisible(
      stick(7, "yellow"),
      [stick(1, "red"), stick(2, "red")]
    );
    expect(analysis.threatLevel).toBe("low");
    expect(analysis.possibleStrong).toContain("Judge (3+7)");
  });

  it("analyzes opponent showing Red 7 with Executor possible", () => {
    const analysis = analyzeOpponentVisible(
      stick(7, "red"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.possibleStrong).toContain("Executor (R4+R7)");
  });

  it("analyzes opponent showing 8 (non-red)", () => {
    const analysis = analyzeOpponentVisible(
      stick(8, "yellow"),
      [stick(1, "red"), stick(2, "red")]
    );
    expect(analysis.threatLevel).toBe("low");
    expect(analysis.possibleStrong).toContain("8 Pair");
  });

  it("analyzes opponent showing Red 8 as high threat", () => {
    const analysis = analyzeOpponentVisible(
      stick(8, "red"),
      [stick(1, "yellow"), stick(2, "yellow")]
    );
    expect(analysis.threatLevel).toBe("high");
    expect(analysis.possibleStrong).toContain("Prime Pair (R3+R8)");
  });

  it("analyzes opponent showing 9 (moderate)", () => {
    const analysis = analyzeOpponentVisible(
      stick(9, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.threatLevel).toBe("moderate");
    expect(analysis.possibleStrong).toContain("One-Nine (1+9)");
    expect(analysis.possibleStrong).toContain("Warden (4+9)");
  });

  it("analyzes opponent showing Red 9 with High Warden possible", () => {
    const analysis = analyzeOpponentVisible(
      stick(9, "red"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.possibleStrong).toContain("High Warden (R4+R9)");
  });

  it("analyzes opponent showing 10 (moderate)", () => {
    const analysis = analyzeOpponentVisible(
      stick(10, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.threatLevel).toBe("moderate");
    expect(analysis.possibleStrong).toContain("10 Pair");
    expect(analysis.possibleStrong).toContain("One-Ten (1+10)");
    expect(analysis.possibleStrong).toContain("Four-Ten (4+10)");
  });

  it("analyzes opponent showing 2 (low threat)", () => {
    const analysis = analyzeOpponentVisible(
      stick(2, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")]
    );
    expect(analysis.threatLevel).toBe("low");
    expect(analysis.possibleStrong).toContain("One-Two (1+2)");
    expect(analysis.possibleStrong).toContain("2 Pair");
  });

  it("analyzes opponent showing 6 (low threat)", () => {
    const analysis = analyzeOpponentVisible(
      stick(6, "yellow"),
      [stick(5, "yellow"), stick(2, "yellow")]
    );
    expect(analysis.threatLevel).toBe("low");
    expect(analysis.possibleStrong).toContain("Four-Six (4+6)");
    expect(analysis.possibleStrong).toContain("6 Pair");
  });

  it("blocks cards when player holds matching numbers", () => {
    const analysis = analyzeOpponentVisible(
      stick(10, "yellow"),
      [stick(10, "red"), stick(1, "red")]
    );
    expect(analysis.blockedHands).toContain("10 Pair");
    expect(analysis.blockedHands).toContain("One-Ten");
  });

  it("blocks warden when player holds 4 against 9", () => {
    const analysis = analyzeOpponentVisible(
      stick(9, "yellow"),
      [stick(4, "red"), stick(2, "yellow")]
    );
    expect(analysis.blockedHands).toContain("Warden");
  });

  it("blocks High Warden when player holds R4 against R9", () => {
    const analysis = analyzeOpponentVisible(
      stick(9, "red"),
      [stick(4, "red"), stick(2, "yellow")]
    );
    expect(analysis.blockedHands).toContain("High Warden");
  });

  it("blocks Ali when player holds 1 against 2", () => {
    const analysis = analyzeOpponentVisible(
      stick(2, "yellow"),
      [stick(1, "red"), stick(5, "yellow")]
    );
    expect(analysis.blockedHands).toContain("One-Two");
  });

  it("uses traditional names when nameStyle is traditional", () => {
    // Opponent showing 1 with traditional style
    const analysis1 = analyzeOpponentVisible(
      stick(1, "red"),
      [stick(5, "yellow"), stick(6, "yellow")],
      "traditional"
    );
    expect(analysis1.possibleStrong).toContain("Ali (1+2)");
    expect(analysis1.possibleStrong).toContain("Dok-sa (1+4)");
    expect(analysis1.possibleStrong).toContain("Gu-bing (1+9)");
    expect(analysis1.possibleStrong).toContain("Jang-bing (1+10)");

    // Opponent showing 4 with traditional style
    const analysis4 = analyzeOpponentVisible(
      stick(4, "red"),
      [stick(5, "yellow"), stick(2, "yellow")],
      "traditional"
    );
    expect(analysis4.possibleStrong).toContain("Dok-sa (1+4)");
    expect(analysis4.possibleStrong).toContain("Jang-sa (4+10)");
    expect(analysis4.possibleStrong).toContain("Se-ryuk (4+6)");

    // Opponent showing 9 with traditional style
    const analysis9 = analyzeOpponentVisible(
      stick(9, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")],
      "traditional"
    );
    expect(analysis9.possibleStrong).toContain("Gu-bing (1+9)");

    // Opponent showing 10 with traditional style
    const analysis10 = analyzeOpponentVisible(
      stick(10, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")],
      "traditional"
    );
    expect(analysis10.possibleStrong).toContain("Jang-bing (1+10)");
    expect(analysis10.possibleStrong).toContain("Jang-sa (4+10)");

    // Opponent showing 2 with traditional style
    const analysis2 = analyzeOpponentVisible(
      stick(2, "yellow"),
      [stick(5, "yellow"), stick(6, "yellow")],
      "traditional"
    );
    expect(analysis2.possibleStrong).toContain("Ali (1+2)");

    // Opponent showing 6 with traditional style
    const analysis6 = analyzeOpponentVisible(
      stick(6, "yellow"),
      [stick(5, "yellow"), stick(2, "yellow")],
      "traditional"
    );
    expect(analysis6.possibleStrong).toContain("Se-ryuk (4+6)");
  });

  it("uses traditional blocker names when nameStyle is traditional", () => {
    const analysis = analyzeOpponentVisible(
      stick(2, "yellow"),
      [stick(1, "red"), stick(5, "yellow")],
      "traditional"
    );
    expect(analysis.blockedHands).toContain("Ali");

    const analysis10 = analyzeOpponentVisible(
      stick(10, "yellow"),
      [stick(10, "red"), stick(1, "red")],
      "traditional"
    );
    expect(analysis10.blockedHands).toContain("Jang-bing");
  });
});

describe("calculateWinProbability", () => {
  it("returns high probability for Prime Pair", () => {
    const prob = calculateWinProbability(
      [stick(3, "red"), stick(8, "red")],
      stick(5, "yellow")
    );
    expect(prob).toBeGreaterThanOrEqual(90);
  });

  it("returns low probability for Mang Tong", () => {
    const prob = calculateWinProbability(
      [stick(2, "yellow"), stick(8, "yellow")], // 2+8=10, Mang Tong
      stick(1, "red")
    );
    expect(prob).toBeLessThan(30);
  });

  it("returns moderate probability for medium hands", () => {
    const prob = calculateWinProbability(
      [stick(2, "red"), stick(7, "yellow")],
      stick(6, "yellow")
    );
    expect(prob).toBeGreaterThan(30);
    expect(prob).toBeLessThan(80);
  });
});

describe("calculatePotOdds", () => {
  it("returns null when no bet to call", () => {
    const result = calculatePotOdds(baseBetState());
    expect(result).toBeNull();
  });

  it("calculates pot odds when facing a bet", () => {
    const result = calculatePotOdds(
      baseBetState({ pot: 6, currentBet: 2, playerBetThisRound: 0 })
    );
    expect(result).not.toBeNull();
    expect(result!.needed).toBe(25); // 2 / (6+2) = 25%
    expect(result!.favorable).toBe(true);
  });

  it("marks unfavorable pot odds correctly", () => {
    const result = calculatePotOdds(
      baseBetState({ pot: 4, currentBet: 10, playerBetThisRound: 0 })
    );
    expect(result).not.toBeNull();
    expect(result!.needed).toBe(71); // 10/(4+10) = 71%
    expect(result!.favorable).toBe(false);
  });
});

describe("assessBluffViability", () => {
  it("says bluff is viable when showing 1 with weak hand", () => {
    const result = assessBluffViability(stick(1, "red"), "trash", 4);
    expect(result.viable).toBe(true);
    expect(result.reason).toContain("1");
  });

  it("says bluff is viable when showing Red 3 with weak hand", () => {
    const result = assessBluffViability(stick(3, "red"), "weak", 4);
    expect(result.viable).toBe(true);
    expect(result.reason).toContain("Prime Pair");
  });

  it("says bluff not viable when showing 5", () => {
    const result = assessBluffViability(stick(5, "yellow"), "trash", 4);
    expect(result.viable).toBe(false);
  });

  it("says bluff not viable with strong hand", () => {
    const result = assessBluffViability(stick(1, "red"), "strong", 4);
    expect(result.viable).toBe(false);
  });

  it("says bluff viable with card 4 and small pot", () => {
    const result = assessBluffViability(stick(4, "yellow"), "weak", 4);
    expect(result.viable).toBe(true);
    expect(result.reason).toContain("4");
  });

  it("says bluff not viable with card 4 and large pot", () => {
    const result = assessBluffViability(stick(4, "yellow"), "weak", 10);
    expect(result.viable).toBe(false);
    expect(result.reason).toContain("Pot too large");
  });

  it("says bluff viable with Red 8", () => {
    const result = assessBluffViability(stick(8, "red"), "trash", 4);
    expect(result.viable).toBe(true);
    expect(result.reason).toContain("Prime Pair");
  });
});

describe("recommendAction", () => {
  it("recommends raise for premium hands", () => {
    const { action, confidence } = recommendAction("premium", false, null, null, 95);
    expect(action).toBe("raise");
    expect(confidence).toBe("high");
  });

  it("recommends call for strong hands facing a bet", () => {
    const { action } = recommendAction("strong", true, null, null, 70);
    expect(action).toBe("call");
  });

  it("recommends raise for strong hands not facing a bet", () => {
    const { action } = recommendAction("strong", false, null, null, 70);
    expect(action).toBe("raise");
  });

  it("recommends check for medium hands not facing a bet", () => {
    const { action } = recommendAction("medium", false, null, null, 50);
    expect(action).toBe("check");
  });

  it("recommends fold for trash hands facing a bet", () => {
    const { action } = recommendAction("trash", true, null, null, 10);
    expect(action).toBe("fold");
  });

  it("includes special hand info for Judge", () => {
    const { reasons } = recommendAction("strong", false, null, "judge", 75);
    expect(reasons.some((r) => r.includes("Judge"))).toBe(true);
  });

  it("recommends call for medium with favorable pot odds", () => {
    const { action } = recommendAction(
      "medium", true, { needed: 25, favorable: true }, null, 50
    );
    expect(action).toBe("call");
  });

  it("recommends call for medium with unfavorable pot odds but still calls", () => {
    const { action, confidence } = recommendAction(
      "medium", true, { needed: 60, favorable: false }, null, 50
    );
    expect(action).toBe("call");
    expect(confidence).toBe("low");
  });

  it("includes warden info in reasons", () => {
    const { reasons } = recommendAction("medium", false, null, "warden", 50);
    expect(reasons.some((r) => r.includes("rematch"))).toBe(true);
  });

  it("includes highWarden info in reasons", () => {
    const { reasons } = recommendAction("medium", false, null, "highWarden", 55);
    expect(reasons.some((r) => r.includes("rematch"))).toBe(true);
  });

  it("includes executor info in reasons", () => {
    const { reasons } = recommendAction("weak", false, null, "executor", 30);
    expect(reasons.some((r) => r.includes("Executor"))).toBe(true);
  });

  it("recommends call for weak with very favorable pot odds", () => {
    const { action } = recommendAction(
      "weak", true, { needed: 20, favorable: true }, null, 30
    );
    expect(action).toBe("call");
  });

  it("recommends fold for weak with unfavorable pot odds", () => {
    const { action } = recommendAction(
      "weak", true, { needed: 60, favorable: false }, null, 30
    );
    expect(action).toBe("fold");
  });

  it("recommends check for trash not facing bet", () => {
    const { action } = recommendAction("trash", false, null, null, 10);
    expect(action).toBe("check");
  });
});

describe("generateAdvice", () => {
  it("returns null for idle phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5), 0, baseBetState(), "idle");
    expect(advice).toBeNull();
  });

  it("returns advice for playerBet phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5, "yellow"), 0, baseBetState(), "playerBet");
    expect(advice).not.toBeNull();
    expect(advice!.handStrength).toBe("strong");
    expect(advice!.recommendedAction).toBe("raise");
  });

  it("suggests fold for trash hand facing a bet", () => {
    const hand: [Stick, Stick] = [stick(5, "yellow"), stick(5, "red")]; // Mang Tong (5 Pair = 10 = 0)
    const result = evaluateHand(hand);
    const advice = generateAdvice(
      hand,
      result,
      stick(1, "red"),
      0,
      baseBetState({ currentBet: 3, playerBetThisRound: 0, pot: 6 }),
      "playerBet"
    );
    expect(advice).not.toBeNull();
    // Should either fold or suggest a bluff depending on visible card
  });

  it("includes blocker note when player blocks opponent hand", () => {
    const hand: [Stick, Stick] = [stick(8, "red"), stick(2, "yellow")];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(3, "red"), 0, baseBetState(), "playerBet");
    expect(advice).not.toBeNull();
    expect(advice!.blockerNote).toContain("Prime Pair");
  });

  it("returns advice for showdown phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5, "yellow"), 0, baseBetState(), "showdown");
    expect(advice).not.toBeNull();
  });

  it("returns null for dealing phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5), 0, baseBetState(), "dealing");
    expect(advice).toBeNull();
  });

  it("returns null for rematch phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5), 0, baseBetState(), "rematch");
    expect(advice).toBeNull();
  });

  it("overrides fold to raise when bluff is viable and not facing bet", () => {
    // 1+5=6 points (weak tier), visible card at index 0 is 1 = bluff viable
    const hand: [Stick, Stick] = [stick(1, "yellow"), stick(5, "yellow")];
    const result = evaluateHand(hand);
    const advice = generateAdvice(
      hand, result, stick(8, "yellow"), 0, baseBetState(), "playerBet"
    );
    expect(advice).not.toBeNull();
    expect(advice!.bluffViable).toBe(true);
  });

  it("includes opponent threat warning for weak hands against dangerous cards", () => {
    const hand: [Stick, Stick] = [stick(5, "yellow"), stick(6, "yellow")]; // 1 point (trash)
    const result = evaluateHand(hand);
    const advice = generateAdvice(
      hand, result, stick(1, "red"), 0, baseBetState(), "playerBet"
    );
    expect(advice).not.toBeNull();
    expect(advice!.reasons.some(r => r.includes("dangerous"))).toBe(true);
  });

  it("returns advice during aiBet phase", () => {
    const hand: [Stick, Stick] = [stick(1), stick(2)];
    const result = evaluateHand(hand);
    const advice = generateAdvice(hand, result, stick(5, "yellow"), 0, baseBetState(), "aiBet");
    expect(advice).not.toBeNull();
  });

  it("includes pot odds info when facing a bet", () => {
    const hand: [Stick, Stick] = [stick(2, "red"), stick(7, "yellow")]; // 9 points
    const result = evaluateHand(hand);
    const advice = generateAdvice(
      hand, result, stick(5, "yellow"), 0,
      baseBetState({ currentBet: 3, playerBetThisRound: 0, pot: 6 }),
      "playerBet"
    );
    expect(advice).not.toBeNull();
    expect(advice!.potOdds).not.toBeNull();
  });
});

describe("generateShowdownAdvice", () => {
  it("generates win advice", () => {
    const playerResult = evaluateHand([stick(1), stick(2)]); // Ali
    const aiResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]); // 1 Point
    const advice = generateShowdownAdvice(playerResult, aiResult, "player");
    expect(advice.headline).toContain("WIN");
    expect(advice.headline).toContain("One-Two");
  });

  it("generates loss advice", () => {
    const playerResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]); // 1 Point
    const aiResult = evaluateHand([stick(1), stick(2)]); // Ali
    const advice = generateShowdownAdvice(playerResult, aiResult, "ai");
    expect(advice.headline).toContain("LOSS");
  });

  it("generates draw advice", () => {
    const playerResult = evaluateHand([stick(1, "red"), stick(2, "red")]);
    const aiResult = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]);
    const advice = generateShowdownAdvice(playerResult, aiResult, "draw");
    expect(advice.headline).toContain("DRAW");
  });

  it("includes special hand notes", () => {
    const playerResult = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]); // Judge
    const aiResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]);
    const advice = generateShowdownAdvice(playerResult, aiResult, "player");
    expect(advice.reasons.some((r) => r.includes("Judge"))).toBe(true);
  });

  it("suggests folding would have saved silver on weak hand loss", () => {
    const playerResult = evaluateHand([stick(2, "yellow"), stick(8, "yellow")]); // Mang Tong
    const aiResult = evaluateHand([stick(1, "red"), stick(2, "red")]); // Ali
    const advice = generateShowdownAdvice(playerResult, aiResult, "ai");
    expect(advice.headline).toContain("LOSS");
    expect(advice.reasons.some(r => r.includes("Folding"))).toBe(true);
  });

  it("notes opponent had strong hand on loss", () => {
    const playerResult = evaluateHand([stick(5, "yellow"), stick(3, "yellow")]); // 8 points
    const aiResult = evaluateHand([stick(9, "red"), stick(9, "yellow")]); // 9 Pair
    const advice = generateShowdownAdvice(playerResult, aiResult, "ai");
    expect(advice.reasons.some(r => r.includes("strong hand"))).toBe(true);
  });

  it("notes lucky win with weak hand", () => {
    const playerResult = evaluateHand([stick(2, "yellow"), stick(3, "yellow")]); // 5 points (weak)
    const aiResult = evaluateHand([stick(2, "red"), stick(8, "yellow")]); // Mang Tong
    const advice = generateShowdownAdvice(playerResult, aiResult, "player");
    expect(advice.headline).toContain("WIN");
    expect(advice.reasons.some(r => r.includes("Lucky") || r.includes("count on"))).toBe(true);
  });

  it("notes executor special hand", () => {
    const playerResult = evaluateHand([stick(4, "red"), stick(7, "red")]); // Executor
    const aiResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]);
    const advice = generateShowdownAdvice(playerResult, aiResult, "ai");
    expect(advice.reasons.some(r => r.includes("Executor"))).toBe(true);
  });

  it("notes warden special hand", () => {
    const playerResult = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]); // Warden
    const aiResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]);
    const advice = generateShowdownAdvice(playerResult, aiResult, "player");
    expect(advice.reasons.some(r => r.includes("Warden"))).toBe(true);
  });

  it("notes highWarden special hand", () => {
    const playerResult = evaluateHand([stick(4, "red"), stick(9, "red")]); // High Warden
    const aiResult = evaluateHand([stick(5, "yellow"), stick(6, "yellow")]);
    const advice = generateShowdownAdvice(playerResult, aiResult, "player");
    expect(advice.reasons.some(r => r.includes("High Warden"))).toBe(true);
  });
});
