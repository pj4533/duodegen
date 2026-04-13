"use client";

import { useState } from "react";
import { StrategyAdvice, GamePhase, ActionAdvice } from "@/engine/types";

interface StrategyAdvisorProps {
  advice: StrategyAdvice;
  phase: GamePhase;
}

const ACTION_STYLES: Record<
  ActionAdvice,
  { bg: string; text: string; label: string }
> = {
  raise: {
    bg: "bg-gold-dark",
    text: "text-parchment-light",
    label: "RAISE",
  },
  allIn: {
    bg: "bg-gold",
    text: "text-crimson-950",
    label: "ALL IN",
  },
  call: {
    bg: "bg-crimson-800",
    text: "text-parchment-light",
    label: "CALL",
  },
  check: {
    bg: "bg-crimson-900",
    text: "text-parchment",
    label: "CHECK",
  },
  fold: {
    bg: "bg-crimson-950",
    text: "text-crimson-300",
    label: "FOLD",
  },
};

const CONFIDENCE_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: "High confidence", color: "text-gold-light" },
  moderate: { text: "Moderate", color: "text-parchment-dark" },
  low: { text: "Low confidence", color: "text-crimson-400" },
};

function isActionPhase(phase: GamePhase): boolean {
  return phase === "playerBet" || phase === "aiBet";
}

function isShowdownPhase(phase: GamePhase): boolean {
  return phase === "showdown" || phase === "roundEnd";
}

export default function StrategyAdvisor({
  advice,
  phase,
}: StrategyAdvisorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const actionStyle = ACTION_STYLES[advice.recommendedAction];
  const confidence = CONFIDENCE_LABELS[advice.confidence];
  const showdown = isShowdownPhase(phase);

  return (
    <>
      {/* Desktop: side panel */}
      <div className="hidden md:block w-72 shrink-0">
        <div className="sticky top-4 border border-gold-dark/20 rounded-lg bg-crimson-950/90 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between px-3 py-2 border-b border-gold-dark/10"
          >
            <span className="text-xs font-heading text-gold-dark tracking-wider uppercase">
              Strategy Advisor
            </span>
            <span className="text-parchment-dark/40 text-xs">
              {collapsed ? "+" : "\u2212"}
            </span>
          </button>

          {!collapsed && (
            <div className="p-3 space-y-3">
              {/* Action Badge */}
              {!showdown && (
                <div className="flex items-center gap-2">
                  <span
                    className={`${actionStyle.bg} ${actionStyle.text} px-3 py-1 rounded text-sm font-heading font-bold tracking-wider`}
                  >
                    {actionStyle.label}
                  </span>
                  <span className={`text-xs ${confidence.color}`}>
                    {confidence.text}
                  </span>
                </div>
              )}

              {/* Headline */}
              <p className="text-sm text-parchment-light font-heading leading-snug">
                {advice.headline}
              </p>

              {/* Reasons */}
              {advice.reasons.length > 0 && (
                <ul className="space-y-1">
                  {advice.reasons.map((reason, i) => (
                    <li
                      key={i}
                      className="text-xs text-parchment-dark/80 flex gap-1.5"
                    >
                      <span className="text-gold-dark/60 shrink-0">&bull;</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              )}

              {/* Opponent Threat */}
              <div className="border-t border-gold-dark/10 pt-2">
                <p className="text-xs text-parchment-dark/60">
                  {advice.opponentThreat}
                </p>
              </div>

              {/* Pot Odds */}
              {advice.potOdds && isActionPhase(phase) && (
                <div className="text-xs">
                  <span className="text-parchment-dark/60">Pot odds: </span>
                  <span
                    className={
                      advice.potOdds.favorable
                        ? "text-gold-light"
                        : "text-crimson-400"
                    }
                  >
                    need {advice.potOdds.needed}% equity
                    {advice.potOdds.favorable ? " (favorable)" : " (unfavorable)"}
                  </span>
                </div>
              )}

              {/* Bluff Note */}
              {advice.bluffViable && advice.bluffReason && isActionPhase(phase) && (
                <div className="border border-gold-dark/20 rounded px-2 py-1.5 bg-crimson-900/50">
                  <p className="text-xs text-gold-light font-heading">
                    Bluff viable
                  </p>
                  <p className="text-xs text-parchment-dark/70 mt-0.5">
                    {advice.bluffReason}
                  </p>
                </div>
              )}

              {/* Hand Strength Bar */}
              {!showdown && (
                <div>
                  <div className="flex justify-between text-xs text-parchment-dark/50 mb-1">
                    <span>Hand strength</span>
                    <span>Top {100 - advice.handPercentile}%</span>
                  </div>
                  <div className="h-1.5 bg-crimson-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${advice.handPercentile}%`,
                        backgroundColor:
                          advice.handPercentile >= 70
                            ? "var(--color-gold-light)"
                            : advice.handPercentile >= 40
                              ? "var(--color-gold-dark)"
                              : "var(--color-crimson-500)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: bottom bar */}
      <MobileBar
        advice={advice}
        phase={phase}
        actionStyle={actionStyle}
        confidence={confidence}
      />
    </>
  );
}

function MobileBar({
  advice,
  phase,
  actionStyle,
  confidence,
}: {
  advice: StrategyAdvice;
  phase: GamePhase;
  actionStyle: { bg: string; text: string; label: string };
  confidence: { text: string; color: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const showdown = isShowdownPhase(phase);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Collapsed bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-crimson-950/95 backdrop-blur-sm border-t border-gold-dark/20"
      >
        {!showdown && (
          <span
            className={`${actionStyle.bg} ${actionStyle.text} px-2 py-0.5 rounded text-xs font-heading font-bold tracking-wider`}
          >
            {actionStyle.label}
          </span>
        )}
        <span className="text-xs text-parchment-light truncate flex-1 text-left font-heading">
          {advice.headline}
        </span>
        <span className="text-parchment-dark/40 text-xs">
          {expanded ? "\u25BC" : "\u25B2"}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="bg-crimson-950/95 backdrop-blur-sm border-t border-gold-dark/10 px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
          {!showdown && (
            <p className={`text-xs ${confidence.color}`}>{confidence.text}</p>
          )}
          <ul className="space-y-1">
            {advice.reasons.map((reason, i) => (
              <li key={i} className="text-xs text-parchment-dark/80 flex gap-1.5">
                <span className="text-gold-dark/60 shrink-0">&bull;</span>
                {reason}
              </li>
            ))}
          </ul>
          <p className="text-xs text-parchment-dark/60">{advice.opponentThreat}</p>
          {advice.potOdds && isActionPhase(phase) && (
            <p className="text-xs text-parchment-dark/60">
              Pot odds: need {advice.potOdds.needed}% equity
              {advice.potOdds.favorable ? " (favorable)" : " (unfavorable)"}
            </p>
          )}
          {advice.bluffViable && advice.bluffReason && isActionPhase(phase) && (
            <p className="text-xs text-gold-light">
              Bluff: {advice.bluffReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
