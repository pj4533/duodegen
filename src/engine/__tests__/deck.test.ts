import { describe, it, expect } from "vitest";
import { createDeck, shuffleDeck, dealHands } from "../deck";

describe("createDeck", () => {
  it("creates a deck of 20 sticks", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(20);
  });

  it("contains numbers 1-10 in both red and yellow", () => {
    const deck = createDeck();
    for (let num = 1; num <= 10; num++) {
      const red = deck.find((s) => s.number === num && s.color === "red");
      const yellow = deck.find((s) => s.number === num && s.color === "yellow");
      expect(red).toBeDefined();
      expect(yellow).toBeDefined();
    }
  });

  it("has exactly 10 red and 10 yellow sticks", () => {
    const deck = createDeck();
    const reds = deck.filter((s) => s.color === "red");
    const yellows = deck.filter((s) => s.color === "yellow");
    expect(reds).toHaveLength(10);
    expect(yellows).toHaveLength(10);
  });
});

describe("shuffleDeck", () => {
  it("returns a deck with the same 20 sticks", () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(20);
    for (const stick of deck) {
      expect(shuffled).toContainEqual(stick);
    }
  });

  it("does not mutate the original deck", () => {
    const deck = createDeck();
    const original = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(original);
  });
});

describe("dealHands", () => {
  it("deals two hands of 2 sticks each", () => {
    const deck = createDeck();
    const { playerHand, aiHand } = dealHands(deck);
    expect(playerHand).toHaveLength(2);
    expect(aiHand).toHaveLength(2);
  });

  it("returns 16 remaining cards", () => {
    const deck = createDeck();
    const { remainingDeck } = dealHands(deck);
    expect(remainingDeck).toHaveLength(16);
  });

  it("deals unique sticks (no duplicates between hands and remaining)", () => {
    const deck = createDeck();
    const { playerHand, aiHand, remainingDeck } = dealHands(deck);
    const all = [...playerHand, ...aiHand, ...remainingDeck];
    expect(all).toHaveLength(20);
    const unique = new Set(all.map((s) => `${s.number}-${s.color}`));
    expect(unique.size).toBe(20);
  });
});
