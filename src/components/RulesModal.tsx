"use client";

import Modal from "@/components/ui/Modal";
import { getRankingsGuide, getSpecialsGuide } from "@/engine/hand-names";
import { useSettings } from "@/hooks/useSettings";

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ open, onClose }: RulesModalProps) {
  const { handNameStyle } = useSettings();
  const RANKINGS = getRankingsGuide(handNameStyle);
  const SPECIALS = getSpecialsGuide(handNameStyle);

  return (
    <Modal open={open} onClose={onClose} title="Rules of Duo">
      <div className="space-y-6">
        {/* Overview */}
        <section className="space-y-2">
          <h3 className="font-heading text-base text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Overview
          </h3>
          <div className="space-y-2 text-sm text-parchment-dark leading-relaxed">
            <p>
              Duo is a card game played with <strong className="text-parchment-light">20 numbered sticks</strong> (1-10, each in Red and Yellow).
              Based on the Korean game <em>Seotda</em>, it is played at the Hernand Inn in Crimson Desert.
            </p>
            <p>
              Each player is dealt <strong className="text-parchment-light">2 sticks</strong>. You can see one of your opponent&apos;s sticks.
              After a round of betting, the highest-ranked hand wins the pot.
            </p>
          </div>
        </section>

        {/* Betting */}
        <section className="space-y-2">
          <h3 className="font-heading text-base text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Betting
          </h3>
          <div className="space-y-2 text-sm text-parchment-dark leading-relaxed">
            <p>Buy-in: <strong className="text-parchment-light">15 Silver</strong> at the Hernand Inn.</p>
            <p>Each hand begins with a <strong className="text-parchment-light">1 Silver ante</strong> from each player.</p>
            <p>You have <strong className="text-parchment-light">10 seconds</strong> to act. Time out = auto Call.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { action: "Check", desc: "Pass without betting." },
              { action: "Call", desc: "Match the current bet." },
              { action: "Half-Pot", desc: "Raise by half the pot." },
              { action: "Raise", desc: "Double the previous raise." },
              { action: "All-in", desc: "Bet all remaining silver." },
              { action: "Fold", desc: "Forfeit the round." },
            ].map((b) => (
              <div
                key={b.action}
                className="bg-crimson-900/30 rounded p-2 border border-crimson-800/20"
              >
                <span className="font-heading text-parchment-light">{b.action}</span>
                <span className="text-parchment-dark/70 text-xs block">{b.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hand Rankings */}
        <section className="space-y-2">
          <h3 className="font-heading text-base text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Hand Rankings
          </h3>
          <p className="text-xs text-parchment-dark/60">Best to worst, top to bottom.</p>
          <div className="space-y-1">
            {RANKINGS.map((r, i) => (
              <div
                key={r.name}
                className="flex items-baseline gap-3 py-1 text-sm border-b border-crimson-900/20 last:border-0"
              >
                <span className="text-gold-dark/60 text-xs font-heading w-6 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="font-heading text-parchment-light min-w-[90px]">
                  {r.name}
                </span>
                <span className="text-parchment-dark/70 text-xs">{r.cards}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Special Hands */}
        <section className="space-y-2">
          <h3 className="font-heading text-base text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Special Hands
          </h3>
          <div className="space-y-2">
            {SPECIALS.map((s) => (
              <div
                key={s.name}
                className="bg-crimson-900/30 rounded-lg p-3 border border-gold-dark/15 space-y-1"
              >
                <span className="font-heading text-gold-light">{s.name}</span>
                <p className="text-xs text-parchment-dark/70">Cards: {s.cards}</p>
                <p className="text-sm text-parchment-light">{s.effect}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rematch */}
        <section className="space-y-2">
          <h3 className="font-heading text-base text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Rematch Rules
          </h3>
          <div className="text-sm text-parchment-dark leading-relaxed space-y-1">
            <p>When a Warden or High Warden triggers a rematch:</p>
            <ul className="list-disc list-inside space-y-1 text-parchment-dark/80">
              <li>The pot carries over</li>
              <li>All sticks are reshuffled and re-dealt</li>
              <li>Maximum 3 rematches per round</li>
              <li>If capped, hands compare by fallback values</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
}
