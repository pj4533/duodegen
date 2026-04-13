"use client";

import type { Stick as StickType, HandResult } from "@/engine/types";
import Stick, { StickBack } from "./Stick";
import HandLabel from "./HandLabel";

interface OpponentHandProps {
  hand: [StickType, StickType] | null;
  revealedIndex: 0 | 1;
  showAll?: boolean;
  handResult?: HandResult | null;
  showResult?: boolean;
  isWinner?: boolean;
}

export default function OpponentHand({
  hand,
  revealedIndex,
  showAll = false,
  handResult,
  showResult = false,
  isWinner = false,
}: OpponentHandProps) {
  const revealedStick = hand && !showAll ? hand[revealedIndex] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-parchment-dark/60 font-heading tracking-wider uppercase">
        Opponent
      </span>
      {showResult && handResult && <HandLabel result={handResult} isWinner={isWinner} />}
      {!showResult && revealedStick && (
        <span className="text-xs text-parchment-dark/50 font-heading tracking-wide">
          Showing {revealedStick.number}
        </span>
      )}
      <div className="flex gap-3">
        {hand ? (
          <>
            {showAll || revealedIndex === 0 ? (
              <Stick stick={hand[0]} highlighted={isWinner} />
            ) : (
              <StickBack />
            )}
            {showAll || revealedIndex === 1 ? (
              <Stick stick={hand[1]} highlighted={isWinner} />
            ) : (
              <StickBack />
            )}
          </>
        ) : (
          <>
            <StickBack />
            <StickBack />
          </>
        )}
      </div>
    </div>
  );
}
