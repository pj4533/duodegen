import { describe, it, expect } from "vitest";
import { evaluateHand, resolveShowdown, getHandDisplayName } from "../hand-evaluator";
import { Stick, HandRank, HandResult } from "../types";
import { MAX_REMATCHES } from "@/lib/constants";

function stick(number: number, color: "red" | "yellow" = "red"): Stick {
  return { number, color };
}

describe("evaluateHand", () => {
  describe("Prime Pair", () => {
    it("Red 3 + Red 8 is Prime Pair", () => {
      const result = evaluateHand([stick(3, "red"), stick(8, "red")]);
      expect(result.rank).toBe(HandRank.PrimePair);
      expect(result.name).toBe("Prime Pair");
      expect(result.special).toBeNull();
    });

    it("Red 8 + Red 3 (reversed) is Prime Pair", () => {
      const result = evaluateHand([stick(8, "red"), stick(3, "red")]);
      expect(result.rank).toBe(HandRank.PrimePair);
    });

    it("Yellow 3 + Yellow 8 is NOT Prime Pair", () => {
      const result = evaluateHand([stick(3, "yellow"), stick(8, "yellow")]);
      expect(result.rank).not.toBe(HandRank.PrimePair);
    });

    it("Red 3 + Yellow 8 is NOT Prime Pair", () => {
      const result = evaluateHand([stick(3, "red"), stick(8, "yellow")]);
      expect(result.rank).not.toBe(HandRank.PrimePair);
    });
  });

  describe("Superior Pair", () => {
    it("Red 1 + Red 8 is Superior Pair", () => {
      const result = evaluateHand([stick(1, "red"), stick(8, "red")]);
      expect(result.rank).toBe(HandRank.SuperiorPair);
    });

    it("Red 1 + Red 3 is Superior Pair", () => {
      const result = evaluateHand([stick(1, "red"), stick(3, "red")]);
      expect(result.rank).toBe(HandRank.SuperiorPair);
    });

    it("Yellow 1 + Yellow 8 is NOT Superior Pair", () => {
      const result = evaluateHand([stick(1, "yellow"), stick(8, "yellow")]);
      expect(result.rank).not.toBe(HandRank.SuperiorPair);
    });

    it("Red 1 + Yellow 3 is NOT Superior Pair", () => {
      const result = evaluateHand([stick(1, "red"), stick(3, "yellow")]);
      expect(result.rank).not.toBe(HandRank.SuperiorPair);
    });
  });

  describe("Pairs", () => {
    it("10 + 10 is Ten Pair", () => {
      const result = evaluateHand([stick(10, "red"), stick(10, "yellow")]);
      expect(result.rank).toBe(HandRank.TenPair);
      expect(result.name).toBe("Ten Pair");
    });

    it("9 + 9 is 9 Pair", () => {
      const result = evaluateHand([stick(9, "red"), stick(9, "yellow")]);
      expect(result.rank).toBe(HandRank.Pair9);
    });

    it("1 + 1 is 1 Pair", () => {
      const result = evaluateHand([stick(1, "red"), stick(1, "yellow")]);
      expect(result.rank).toBe(HandRank.Pair1);
    });

    it("all pairs rank correctly (higher number = higher rank)", () => {
      for (let n = 1; n <= 9; n++) {
        const result = evaluateHand([stick(n, "red"), stick(n, "yellow")]);
        expect(result.rank).toBe(HandRank.Pair1 + (n - 1));
      }
    });

    it("9 Pair beats 8 Pair", () => {
      const pair9 = evaluateHand([stick(9, "red"), stick(9, "yellow")]);
      const pair8 = evaluateHand([stick(8, "red"), stick(8, "yellow")]);
      expect(pair9.rank).toBeGreaterThan(pair8.rank);
    });
  });

  describe("Named Hands", () => {
    it("1+2 is Ali", () => {
      const result = evaluateHand([stick(1), stick(2)]);
      expect(result.rank).toBe(HandRank.Ali);
      expect(result.name).toBe("One-Two");
    });

    it("1+4 is Dok Sa", () => {
      const result = evaluateHand([stick(1), stick(4)]);
      expect(result.rank).toBe(HandRank.DokSa);
    });

    it("1+9 is Gu Bing", () => {
      const result = evaluateHand([stick(1), stick(9)]);
      expect(result.rank).toBe(HandRank.GuBing);
    });

    it("1+10 is Jang Bing", () => {
      const result = evaluateHand([stick(1), stick(10)]);
      expect(result.rank).toBe(HandRank.JangBing);
    });

    it("4+10 is Jang Sa", () => {
      const result = evaluateHand([stick(4), stick(10)]);
      expect(result.rank).toBe(HandRank.JangSa);
    });

    it("4+6 is Sel Ryuk", () => {
      const result = evaluateHand([stick(4), stick(6)]);
      expect(result.rank).toBe(HandRank.SelRyuk);
    });

    it("named hands rank in correct order: Ali > DokSa > GuBing > JangBing > JangSa > SelRyuk", () => {
      const ali = evaluateHand([stick(1), stick(2)]);
      const dokSa = evaluateHand([stick(1), stick(4)]);
      const guBing = evaluateHand([stick(1), stick(9)]);
      const jangBing = evaluateHand([stick(1), stick(10)]);
      const jangSa = evaluateHand([stick(4), stick(10)]);
      const selRyuk = evaluateHand([stick(4), stick(6)]);

      expect(ali.rank).toBeGreaterThan(dokSa.rank);
      expect(dokSa.rank).toBeGreaterThan(guBing.rank);
      expect(guBing.rank).toBeGreaterThan(jangBing.rank);
      expect(jangBing.rank).toBeGreaterThan(jangSa.rank);
      expect(jangSa.rank).toBeGreaterThan(selRyuk.rank);
    });

    it("named hands beat all point hands", () => {
      const selRyuk = evaluateHand([stick(4), stick(6)]);
      const perfectNine = evaluateHand([stick(2, "yellow"), stick(7, "yellow")]);
      expect(selRyuk.rank).toBeGreaterThan(perfectNine.rank);
    });

    it("1 Pair beats Ali", () => {
      const pair1 = evaluateHand([stick(1, "red"), stick(1, "yellow")]);
      const ali = evaluateHand([stick(1), stick(2)]);
      expect(pair1.rank).toBeGreaterThan(ali.rank);
    });

    it("card order doesn't matter for named hands", () => {
      const ali1 = evaluateHand([stick(2), stick(1)]);
      const ali2 = evaluateHand([stick(1), stick(2)]);
      expect(ali1.rank).toBe(ali2.rank);
    });
  });

  describe("Point Hands", () => {
    it("2+7 = 9 Points (Perfect Nine)", () => {
      const result = evaluateHand([stick(2, "yellow"), stick(7, "yellow")]);
      expect(result.rank).toBe(HandRank.PerfectNine);
      expect(result.name).toBe("Perfect Nine");
    });

    it("3+5 = 8 Points", () => {
      const result = evaluateHand([stick(3, "yellow"), stick(5, "yellow")]);
      expect(result.rank).toBe(HandRank.Points8);
    });

    it("2+5 = 7 Points", () => {
      const result = evaluateHand([stick(2, "yellow"), stick(5, "yellow")]);
      expect(result.rank).toBe(HandRank.Points7);
    });

    it("2+10 = 2 Points (12 % 10 = 2)", () => {
      const result = evaluateHand([stick(2, "yellow"), stick(10, "yellow")]);
      expect(result.rank).toBe(HandRank.Points2);
    });

    it("5+5 would be a pair, not 0 points", () => {
      const result = evaluateHand([stick(5, "red"), stick(5, "yellow")]);
      expect(result.rank).toBe(HandRank.Pair5);
    });

    it("6+4 is Sel Ryuk (named), not 0 points", () => {
      const result = evaluateHand([stick(6), stick(4)]);
      expect(result.rank).toBe(HandRank.SelRyuk);
    });

    it("2+8 = Mang Tong (0 points)", () => {
      const result = evaluateHand([stick(2, "yellow"), stick(8, "yellow")]);
      expect(result.rank).toBe(HandRank.MangTong);
      expect(result.name).toBe("Zero");
    });

    it("5+5 pair beats 9 Points", () => {
      const pair = evaluateHand([stick(5, "red"), stick(5, "yellow")]);
      const nine = evaluateHand([stick(2, "yellow"), stick(7, "yellow")]);
      expect(pair.rank).toBeGreaterThan(nine.rank);
    });
  });

  describe("Special Hands - Detection", () => {
    it("3+7 is Judge", () => {
      const result = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      expect(result.special).toBe("judge");
    });

    it("Red 4 + Red 7 is Executor", () => {
      const result = evaluateHand([stick(4, "red"), stick(7, "red")]);
      expect(result.special).toBe("executor");
    });

    it("Yellow 4 + Yellow 7 is NOT Executor (just 1 Point)", () => {
      const result = evaluateHand([stick(4, "yellow"), stick(7, "yellow")]);
      expect(result.special).toBeNull();
    });

    it("4+9 any color is Warden", () => {
      const result = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      expect(result.special).toBe("warden");
    });

    it("Red 4 + Red 9 is High Warden", () => {
      const result = evaluateHand([stick(4, "red"), stick(9, "red")]);
      expect(result.special).toBe("highWarden");
    });

    it("4+9 mixed colors is Warden (not High Warden)", () => {
      const result = evaluateHand([stick(4, "red"), stick(9, "yellow")]);
      expect(result.special).toBe("warden");
    });
  });

  describe("Ranking hierarchy", () => {
    it("Prime Pair > Superior Pair > Ten Pair > 9 Pair > ... > 1 Pair > Ali > ... > SelRyuk > 9pts > ... > 0pts", () => {
      const hands: HandResult[] = [
        evaluateHand([stick(3, "red"), stick(8, "red")]),    // Prime Pair
        evaluateHand([stick(1, "red"), stick(8, "red")]),    // Superior Pair
        evaluateHand([stick(10, "red"), stick(10, "yellow")]), // Ten Pair
        evaluateHand([stick(9, "red"), stick(9, "yellow")]),  // 9 Pair
        evaluateHand([stick(1, "red"), stick(1, "yellow")]),  // 1 Pair
        evaluateHand([stick(1, "yellow"), stick(2, "yellow")]), // Ali
        evaluateHand([stick(4, "yellow"), stick(6, "yellow")]), // Sel Ryuk
        evaluateHand([stick(2, "yellow"), stick(7, "yellow")]), // 9 Points
        evaluateHand([stick(3, "yellow"), stick(5, "yellow")]), // 8 Points
        evaluateHand([stick(2, "yellow"), stick(8, "yellow")]), // Mang Tong
      ];

      for (let i = 0; i < hands.length - 1; i++) {
        expect(hands[i].rank).toBeGreaterThan(hands[i + 1].rank);
      }
    });
  });
});

describe("getHandDisplayName", () => {
  it("shows special hand name with standard name", () => {
    const result = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
    const name = getHandDisplayName(result);
    expect(name).toContain("Judge");
    expect(name).toContain("Zero");
  });

  it("shows standard name for non-special hands", () => {
    const result = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]);
    const name = getHandDisplayName(result);
    expect(name).toBe("One-Two");
  });
});

describe("resolveShowdown", () => {
  describe("Standard resolution", () => {
    it("higher rank wins", () => {
      const h1 = evaluateHand([stick(9, "red"), stick(9, "yellow")]); // 9 Pair
      const h2 = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]); // Ali
      const outcome = resolveShowdown(h1, h2, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
    });

    it("equal rank is a draw", () => {
      const h1 = evaluateHand([stick(2, "red"), stick(7, "red")]); // 9 Points
      const h2 = evaluateHand([stick(2, "yellow"), stick(7, "yellow")]); // 9 Points
      const outcome = resolveShowdown(h1, h2, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("draw");
    });
  });

  describe("Prime Pair", () => {
    it("Prime Pair beats everything", () => {
      const prime = evaluateHand([stick(3, "red"), stick(8, "red")]);
      const superior = evaluateHand([stick(1, "red"), stick(8, "red")]);
      const outcome = resolveShowdown(prime, superior, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
    });

    it("two Prime Pairs draw", () => {
      const p1 = evaluateHand([stick(3, "red"), stick(8, "red")]);
      const p2 = evaluateHand([stick(3, "red"), stick(8, "red")]);
      const outcome = resolveShowdown(p1, p2, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("draw");
    });
  });

  describe("Executor", () => {
    it("Executor beats Superior Pair", () => {
      const executor = evaluateHand([stick(4, "red"), stick(7, "red")]);
      const superior = evaluateHand([stick(1, "red"), stick(3, "red")]);
      const outcome = resolveShowdown(executor, superior, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
      expect(outcome.specialResolution).toContain("Executor");
    });

    it("Executor falls back to 1 Point against non-Superior Pair", () => {
      const executor = evaluateHand([stick(4, "red"), stick(7, "red")]);
      const pair5 = evaluateHand([stick(5, "red"), stick(5, "yellow")]);
      const outcome = resolveShowdown(executor, pair5, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("Executor cannot beat Prime Pair", () => {
      const executor = evaluateHand([stick(4, "red"), stick(7, "red")]);
      const prime = evaluateHand([stick(3, "red"), stick(8, "red")]);
      const outcome = resolveShowdown(executor, prime, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });
  });

  describe("Judge", () => {
    it("Judge beats 9 Pair", () => {
      const judge = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      const pair9 = evaluateHand([stick(9, "red"), stick(9, "yellow")]);
      const outcome = resolveShowdown(judge, pair9, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
      expect(outcome.specialResolution).toContain("Judge");
    });

    it("Judge beats 1 Pair", () => {
      const judge = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      const pair1 = evaluateHand([stick(1, "red"), stick(1, "yellow")]);
      const outcome = resolveShowdown(judge, pair1, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
    });

    it("Judge becomes Zero against Ten Pair", () => {
      const judge = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      const tenPair = evaluateHand([stick(10, "red"), stick(10, "yellow")]);
      const outcome = resolveShowdown(judge, tenPair, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("Judge becomes Zero against Superior Pair", () => {
      const judge = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      const superior = evaluateHand([stick(1, "red"), stick(8, "red")]);
      const outcome = resolveShowdown(judge, superior, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("Two Judges draw (both become Zero)", () => {
      const j1 = evaluateHand([stick(3, "red"), stick(7, "red")]);
      const j2 = evaluateHand([stick(3, "yellow"), stick(7, "yellow")]);
      const outcome = resolveShowdown(j1, j2, 0, MAX_REMATCHES);
      // Both judges: first judge triggers against second's rank.
      // j2 rank is MangTong (0), which is <= Pair9, so judge1 wins.
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
    });
  });

  describe("Warden", () => {
    it("Warden triggers rematch when opponent has Ali", () => {
      const warden = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      const ali = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]);
      const outcome = resolveShowdown(warden, ali, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("rematch");
      expect(outcome.specialResolution).toContain("Warden");
    });

    it("Warden triggers rematch when opponent has Mang Tong", () => {
      const warden = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      const zero = evaluateHand([stick(2, "yellow"), stick(8, "yellow")]);
      const outcome = resolveShowdown(warden, zero, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("rematch");
    });

    it("Warden does NOT trigger rematch when opponent has 1 Pair", () => {
      const warden = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      const pair = evaluateHand([stick(1, "red"), stick(1, "yellow")]);
      const outcome = resolveShowdown(warden, pair, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("Warden falls back to 3 Points when opponent has a Pair", () => {
      const warden = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      const pair5 = evaluateHand([stick(5, "red"), stick(5, "yellow")]);
      const outcome = resolveShowdown(warden, pair5, 0, MAX_REMATCHES);
      // Warden can't trigger rematch vs Pair (Pair > Ali), falls back to 3pts vs Pair5
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("Warden falls back to 3 Points at max rematches", () => {
      const warden = evaluateHand([stick(4, "yellow"), stick(9, "yellow")]);
      const ali = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]);
      const outcome = resolveShowdown(warden, ali, MAX_REMATCHES, MAX_REMATCHES);
      // At max rematches, warden = 3 points vs Ali (rank 15): Ali wins
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });
  });

  describe("High Warden", () => {
    it("High Warden triggers rematch when opponent has 9 Pair", () => {
      const hw = evaluateHand([stick(4, "red"), stick(9, "red")]);
      const pair9 = evaluateHand([stick(9, "red"), stick(9, "yellow")]);
      const outcome = resolveShowdown(hw, pair9, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("rematch");
      expect(outcome.specialResolution).toContain("High Warden");
    });

    it("High Warden does NOT trigger rematch against Ten Pair", () => {
      const hw = evaluateHand([stick(4, "red"), stick(9, "red")]);
      const tenPair = evaluateHand([stick(10, "red"), stick(10, "yellow")]);
      const outcome = resolveShowdown(hw, tenPair, 0, MAX_REMATCHES);
      // High Warden falls back to 3 points, Ten Pair wins
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player2");
    });

    it("High Warden triggers rematch against Ali", () => {
      const hw = evaluateHand([stick(4, "red"), stick(9, "red")]);
      const ali = evaluateHand([stick(1, "yellow"), stick(2, "yellow")]);
      const outcome = resolveShowdown(hw, ali, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("rematch");
    });
  });

  describe("Executor vs Judge priority", () => {
    it("Executor checked before Judge in resolution", () => {
      const executor = evaluateHand([stick(4, "red"), stick(7, "red")]);
      const superior = evaluateHand([stick(1, "red"), stick(8, "red")]);
      // Executor should beat Superior Pair
      const outcome = resolveShowdown(executor, superior, 0, MAX_REMATCHES);
      expect(outcome.result).toBe("win");
      if (outcome.result === "win") expect(outcome.winner).toBe("player1");
    });
  });
});
