"use client";

import Modal from "@/components/ui/Modal";

const RANKINGS = [
  { name: "Prime Pair", cards: "Red 3 + Red 8", tier: "special" },
  { name: "Superior Pair", cards: "Red 1 + Red 8 or Red 1 + Red 3", tier: "special" },
  { name: "Ten Pair", cards: "10 + 10", tier: "pair" },
  { name: "9 Pair", cards: "9 + 9", tier: "pair" },
  { name: "8 Pair", cards: "8 + 8", tier: "pair" },
  { name: "7 Pair", cards: "7 + 7", tier: "pair" },
  { name: "6 Pair", cards: "6 + 6", tier: "pair" },
  { name: "5 Pair", cards: "5 + 5", tier: "pair" },
  { name: "4 Pair", cards: "4 + 4", tier: "pair" },
  { name: "3 Pair", cards: "3 + 3", tier: "pair" },
  { name: "2 Pair", cards: "2 + 2", tier: "pair" },
  { name: "1 Pair", cards: "1 + 1", tier: "pair" },
  { name: "Ali", cards: "1 + 2", tier: "named" },
  { name: "Dok Sa", cards: "1 + 4", tier: "named" },
  { name: "Gu Bing", cards: "1 + 9", tier: "named" },
  { name: "Jang Bing", cards: "1 + 10", tier: "named" },
  { name: "Jang Sa", cards: "4 + 10", tier: "named" },
  { name: "Sel Ryuk", cards: "4 + 6", tier: "named" },
  { name: "9 Points", cards: "Sum ends in 9", tier: "points" },
  { name: "8-1 Points", cards: "Sum ends in 8-1", tier: "points" },
  { name: "Mang Tong", cards: "Sum ends in 0", tier: "points" },
];

const SPECIALS = [
  {
    name: "Judge",
    cards: "3 + 7",
    effect: "Beats 9-Pair or lower. Becomes Zero vs Ten Pair+.",
  },
  {
    name: "Executor",
    cards: "Red 4 + Red 7",
    effect: "Beats Superior Pair only. Becomes 1 Point otherwise.",
  },
  {
    name: "Warden",
    cards: "4 + 9",
    effect: "Rematch if opponent has Ali or lower.",
  },
  {
    name: "High Warden",
    cards: "Red 4 + Red 9",
    effect: "Rematch if opponent has 9-Pair or lower.",
  },
];

const tierColors: Record<string, string> = {
  special: "text-gold-light",
  pair: "text-parchment-light",
  named: "text-crimson-300",
  points: "text-parchment-dark",
};

interface HandGuideProps {
  open: boolean;
  onClose: () => void;
}

export default function HandGuide({ open, onClose }: HandGuideProps) {
  return (
    <Modal open={open} onClose={onClose} title="Hand Rankings">
      <div className="space-y-4">
        {/* Standard Rankings */}
        <div className="space-y-1">
          <h3 className="text-xs font-heading text-gold-dark tracking-wider uppercase mb-2">
            Rankings (Best to Worst)
          </h3>
          {RANKINGS.map((r) => (
            <div
              key={r.name}
              className="flex justify-between items-center py-0.5 text-sm"
            >
              <span className={`font-heading ${tierColors[r.tier]}`}>
                {r.name}
              </span>
              <span className="text-parchment-dark/60 text-xs">{r.cards}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gold-dark/20" />

        {/* Special Hands */}
        <div className="space-y-2">
          <h3 className="text-xs font-heading text-gold-dark tracking-wider uppercase">
            Special Hands
          </h3>
          {SPECIALS.map((s) => (
            <div key={s.name} className="text-sm space-y-0.5">
              <div className="flex justify-between">
                <span className="font-heading text-gold-light">{s.name}</span>
                <span className="text-parchment-dark/60 text-xs">
                  {s.cards}
                </span>
              </div>
              <p className="text-parchment-dark/70 text-xs">{s.effect}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
