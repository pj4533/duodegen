"use client";

import { TIMER_DURATION_SECONDS } from "@/lib/constants";

interface TimerProps {
  secondsLeft: number;
  active: boolean;
}

export default function Timer({ secondsLeft, active }: TimerProps) {
  if (!active) return null;

  const percent = (secondsLeft / TIMER_DURATION_SECONDS) * 100;
  const isLow = secondsLeft <= 3;

  return (
    <div className="w-full max-w-xs" role="timer" aria-label={`${secondsLeft} seconds remaining`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-heading text-parchment-dark/60 tracking-wider">
          TIME
        </span>
        <span
          className={`text-sm font-heading font-bold tabular-nums ${
            isLow ? "text-crimson-400" : "text-gold-light"
          }`}
        >
          {secondsLeft}s
        </span>
      </div>
      <div className="h-1.5 bg-crimson-900/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 linear ${
            isLow ? "bg-crimson-500" : "bg-gold"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
