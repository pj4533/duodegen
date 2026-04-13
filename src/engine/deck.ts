import { Stick, StickColor } from "./types";

export function createDeck(): Stick[] {
  const deck: Stick[] = [];
  const colors: StickColor[] = ["red", "yellow"];
  for (let num = 1; num <= 10; num++) {
    for (const color of colors) {
      deck.push({ number: num, color });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Stick[]): Stick[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealHands(deck: Stick[]): {
  playerHand: [Stick, Stick];
  aiHand: [Stick, Stick];
  remainingDeck: Stick[];
} {
  const remaining = [...deck];
  const playerHand: [Stick, Stick] = [remaining.shift()!, remaining.shift()!];
  const aiHand: [Stick, Stick] = [remaining.shift()!, remaining.shift()!];
  return { playerHand, aiHand, remainingDeck: remaining };
}
