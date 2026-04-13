"use client";

import Modal from "@/components/ui/Modal";
import { useSettings } from "@/hooks/useSettings";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { learningMode, handNameStyle, updateSettings } = useSettings();

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Learning Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="learning-mode"
              className="font-heading text-parchment-light tracking-wide"
            >
              Learning Mode
            </label>
            <button
              id="learning-mode"
              role="switch"
              aria-checked={learningMode}
              onClick={() => updateSettings({ learningMode: !learningMode })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${learningMode ? "bg-gold-dark" : "bg-crimson-800"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 rounded-full transition-transform
                  ${learningMode ? "translate-x-6 bg-gold-light" : "translate-x-1 bg-parchment-dark/50"}
                `}
              />
            </button>
          </div>
          <p className="text-xs text-parchment-dark/70 leading-relaxed">
            Shows a strategy advisor panel with real-time tips on when to raise, call, fold, or bluff.
            Also <strong className="text-parchment-dark">disables the 10-second timer</strong> so
            you can take your time studying each hand.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gold-dark/20" />

        {/* Hand Name Style */}
        <div className="space-y-3">
          <span className="font-heading text-parchment-light tracking-wide block">
            Hand Names
          </span>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="handNameStyle"
                value="crimsonDesert"
                checked={handNameStyle === "crimsonDesert"}
                onChange={() => updateSettings({ handNameStyle: "crimsonDesert" })}
                className="mt-1 accent-gold-dark"
              />
              <div>
                <span className="text-sm text-parchment-light font-heading group-hover:text-gold-light transition-colors">
                  Crimson Desert
                </span>
                <p className="text-xs text-parchment-dark/60">
                  Prime Pair, Judge, Executor, Mang Tong...
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="handNameStyle"
                value="traditional"
                checked={handNameStyle === "traditional"}
                onChange={() => updateSettings({ handNameStyle: "traditional" })}
                className="mt-1 accent-gold-dark"
              />
              <div>
                <span className="text-sm text-parchment-light font-heading group-hover:text-gold-light transition-colors">
                  Traditional Seotda
                </span>
                <p className="text-xs text-parchment-dark/60">
                  38 Bright Pair, Pair Catcher, Secret Inspector, Mang-tong...
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
