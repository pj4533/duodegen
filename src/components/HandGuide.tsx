"use client";

import Modal from "@/components/ui/Modal";
import { getRankingsGuide, getSpecialsGuide } from "@/engine/hand-names";
import { useSettings } from "@/hooks/useSettings";

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
  const { handNameStyle } = useSettings();
  const rankings = getRankingsGuide(handNameStyle);
  const specials = getSpecialsGuide(handNameStyle);

  return (
    <Modal open={open} onClose={onClose} title="Hand Rankings">
      <div className="space-y-4">
        {/* Standard Rankings */}
        <div className="space-y-1">
          <h3 className="text-xs font-heading text-gold-dark tracking-wider uppercase mb-2">
            Rankings (Best to Worst)
          </h3>
          {rankings.map((r) => (
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
          {specials.map((s) => (
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
