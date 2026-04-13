import { ActionLogEntry, BetAction } from "@/engine/types";

interface ActionFeedProps {
  entries: ActionLogEntry[];
}

const ACTION_LABELS: Record<BetAction, string> = {
  check: "Checked",
  call: "Called",
  halfRaise: "Raised Half-Pot",
  doubleRaise: "Raised",
  allIn: "All-in!",
  fold: "Folded",
};

const ACTION_COLORS: Record<BetAction, string> = {
  check: "text-parchment-dark",
  call: "text-parchment-light",
  halfRaise: "text-gold-dark",
  doubleRaise: "text-gold-light",
  allIn: "text-gold-light",
  fold: "text-crimson-400",
};

export default function ActionFeed({ entries }: ActionFeedProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {entries.map((entry, i) => {
        const isPlayer = entry.actor === "player";
        const label = ACTION_LABELS[entry.action];
        const color = ACTION_COLORS[entry.action];
        const isLatest = i === entries.length - 1;

        return (
          <div
            key={i}
            className={`
              flex items-center justify-center gap-2 w-full text-center transition-opacity
              ${isLatest ? "opacity-100" : "opacity-40"}
            `}
          >
            <span className={`text-xs font-heading tracking-wider ${isPlayer ? "text-parchment-dark/70" : "text-crimson-300/70"}`}>
              {isPlayer ? "You" : "Opponent"}
            </span>
            <span className={`text-sm font-heading font-bold tracking-wide ${color}`}>
              {label}
            </span>
            {entry.amount > 0 && (
              <span className="text-xs text-parchment-dark/50">
                +{entry.amount} silver
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
