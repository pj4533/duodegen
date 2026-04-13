"use client";

import { motion } from "framer-motion";
import type { Stick as StickType } from "@/engine/types";

interface StickProps {
  stick: StickType;
  revealed?: boolean;
  highlighted?: boolean;
  size?: "sm" | "md";
}

export default function Stick({
  stick,
  revealed = true,
  highlighted = false,
  size = "md",
}: StickProps) {
  const isRed = stick.color === "red";
  const dimensions = size === "md" ? "w-16 h-28 sm:w-20 sm:h-36" : "w-12 h-20";
  const fontSize = size === "md" ? "text-2xl sm:text-3xl" : "text-lg";

  if (!revealed) {
    return <StickBack size={size} />;
  }

  return (
    <motion.div
      className={`
        ${dimensions} rounded-lg relative flex items-center justify-center
        border-2 select-none cursor-default
        ${isRed
          ? "bg-gradient-to-b from-wood-dark to-[#4a2219] border-crimson-700/60"
          : "bg-gradient-to-b from-wood-light to-[#a8894a] border-gold-dark/60"
        }
        ${highlighted ? "ring-2 ring-gold-light shadow-lg shadow-gold/30" : "shadow-md"}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Wood grain texture */}
      <div className="absolute inset-0 rounded-lg opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />

      {/* Color stripe */}
      <div
        className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-r ${
          isRed ? "bg-crimson-500" : "bg-gold-light"
        }`}
      />

      {/* Number */}
      <span
        className={`
          font-heading font-bold ${fontSize} relative z-10
          ${isRed ? "text-parchment-light" : "text-crimson-950"}
        `}
      >
        {stick.number}
      </span>

      {/* Color label */}
      <span
        className={`
          absolute bottom-1.5 text-[9px] font-body uppercase tracking-wider
          ${isRed ? "text-crimson-300/70" : "text-gold-dark/70"}
        `}
      >
        {stick.color === "red" ? "R" : "Y"}
      </span>
    </motion.div>
  );
}

export function StickBack({ size = "md" }: { size?: "sm" | "md" }) {
  const dimensions = size === "md" ? "w-16 h-28 sm:w-20 sm:h-36" : "w-12 h-20";

  return (
    <div
      className={`
        ${dimensions} rounded-lg relative flex items-center justify-center
        bg-gradient-to-b from-[#3d2415] to-[#2a1a0e] border-2 border-gold-dark/30
        shadow-md select-none
      `}
    >
      {/* Ornamental pattern */}
      <div className="absolute inset-2 rounded border border-gold-dark/20 flex items-center justify-center">
        <div className="font-heading text-gold-dark/30 text-lg">&#x2726;</div>
      </div>
    </div>
  );
}
