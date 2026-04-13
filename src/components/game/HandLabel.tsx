"use client";

import type { HandResult } from "@/engine/types";
import { getDisplayName } from "@/engine/hand-names";
import { useSettings } from "@/hooks/useSettings";

interface HandLabelProps {
  result: HandResult;
  isWinner?: boolean;
}

export default function HandLabel({ result, isWinner = false }: HandLabelProps) {
  const { handNameStyle } = useSettings();

  return (
    <div
      className={`
        px-3 py-1 rounded text-sm font-heading tracking-wide
        ${isWinner
          ? "bg-gold-dark/30 text-gold-light border border-gold/40"
          : "bg-crimson-900/50 text-parchment-dark border border-crimson-800/40"
        }
      `}
    >
      {getDisplayName(result.rank, result.special, handNameStyle)}
    </div>
  );
}
