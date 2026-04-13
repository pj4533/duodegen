"use client";

import type { Stick as StickType, HandResult } from "@/engine/types";
import Stick from "./Stick";
import HandLabel from "./HandLabel";

interface PlayerHandProps {
  hand: [StickType, StickType] | null;
  handResult?: HandResult | null;
  showResult?: boolean;
  isWinner?: boolean;
}

export default function PlayerHand({
  hand,
  handResult,
  showResult = false,
  isWinner = false,
}: PlayerHandProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        {hand ? (
          <>
            <Stick stick={hand[0]} highlighted={isWinner} />
            <Stick stick={hand[1]} highlighted={isWinner} />
          </>
        ) : (
          <>
            <div className="w-16 h-28 sm:w-20 sm:h-36" />
            <div className="w-16 h-28 sm:w-20 sm:h-36" />
          </>
        )}
      </div>
      {showResult && handResult && <HandLabel result={handResult} isWinner={isWinner} />}
      <span className="text-xs text-parchment-dark/60 font-heading tracking-wider uppercase">
        Your Hand
      </span>
    </div>
  );
}
