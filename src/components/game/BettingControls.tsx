"use client";

import type { BetAction, BetState } from "@/engine/types";
import { getAvailableActions } from "@/engine/betting";
import Button from "@/components/ui/Button";

interface BettingControlsProps {
  betState: BetState;
  onAction: (action: BetAction) => void;
  disabled?: boolean;
}

const ACTION_LABELS: Record<BetAction, string> = {
  check: "Check",
  call: "Call",
  halfRaise: "Half Raise",
  doubleRaise: "Double Raise",
  allIn: "All In",
  fold: "Fold",
};

export default function BettingControls({
  betState,
  onAction,
  disabled = false,
}: BettingControlsProps) {
  const available = getAvailableActions(betState, "player");

  return (
    <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Betting actions">
      {(["check", "call", "halfRaise", "doubleRaise", "allIn", "fold"] as BetAction[]).map(
        (action) => {
          const isAvailable = available.includes(action);
          return (
            <Button
              key={action}
              variant={action === "fold" ? "danger" : action === "allIn" ? "primary" : "secondary"}
              size="sm"
              disabled={disabled || !isAvailable}
              onClick={() => onAction(action)}
              aria-label={ACTION_LABELS[action]}
            >
              {ACTION_LABELS[action]}
            </Button>
          );
        }
      )}
    </div>
  );
}
