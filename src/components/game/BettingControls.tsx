"use client";

import type { BetAction, BetState } from "@/engine/types";
import { getAvailableActions, getBetAmounts } from "@/engine/betting";
import Button from "@/components/ui/Button";

interface BettingControlsProps {
  betState: BetState;
  onAction: (action: BetAction) => void;
  disabled?: boolean;
}

const ACTION_LABELS: Record<BetAction, string> = {
  check: "Check",
  call: "Call",
  halfRaise: "Half-Pot",
  doubleRaise: "Raise",
  allIn: "All-in",
  fold: "Fold",
};

export default function BettingControls({
  betState,
  onAction,
  disabled = false,
}: BettingControlsProps) {
  const available = getAvailableActions(betState, "player");
  const amounts = getBetAmounts(betState, "player");

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm" role="group" aria-label="Betting actions">
      {(["allIn", "halfRaise", "doubleRaise", "call", "fold", "check"] as BetAction[]).map(
        (action) => {
          const isAvailable = available.includes(action);
          const amount = amounts[action];
          const label = amount > 0
            ? `${amount} ${ACTION_LABELS[action]}`
            : ACTION_LABELS[action];
          return (
            <Button
              key={action}
              variant={action === "fold" ? "danger" : action === "allIn" ? "primary" : "secondary"}
              size="sm"
              disabled={disabled || !isAvailable}
              onClick={() => onAction(action)}
              aria-label={amount > 0
                ? `${ACTION_LABELS[action]} for ${amount} silver`
                : ACTION_LABELS[action]}
            >
              {label}
            </Button>
          );
        }
      )}
    </div>
  );
}
