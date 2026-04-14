"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { Stick as StickType } from "@/engine/types";

// --- SVG Constants ---

// Organic stick outline: domed top, wider at bottom, hand-carved wooden tablet
const STICK_OUTLINE =
  "M 12,118 Q 8,108 10,80 Q 12,45 18,24 Q 26,6 50,3 Q 74,6 82,24 Q 88,45 90,80 Q 92,108 88,118 Q 50,123 12,118 Z";

// Gold region for yellow sticks: upper ~62% with irregular diagonal dividing line
const GOLD_REGION =
  "M 0,0 L 100,0 L 100,68 Q 82,72 62,74 Q 42,71 22,76 Q 10,78 0,80 Z";

// --- Seeded PRNG (mulberry32) ---
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Tally Mark Generator ---

interface TallyLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
}

interface TallyGroup {
  lines: TallyLine[];
  diagonal?: TallyLine;
}

function generateVerticalLines(
  count: number,
  centerX: number,
  topY: number,
  lineHeight: number,
  spacing: number,
  rng: () => number
): TallyLine[] {
  const totalWidth = (count - 1) * spacing;
  const startX = centerX - totalWidth / 2;

  return Array.from({ length: count }, (_, i) => {
    const x = startX + i * spacing;
    const jitterX = (rng() - 0.5) * 3;
    const jitterTopX = (rng() - 0.5) * 2.5;
    const jitterY1 = (rng() - 0.5) * 3;
    const jitterY2 = (rng() - 0.5) * 3;
    return {
      x1: x + jitterTopX,
      y1: topY + jitterY1,
      x2: x + jitterX,
      y2: topY + lineHeight + jitterY2,
      strokeWidth: 3.2 + rng() * 1.4,
    };
  });
}

function generateCrossedFive(
  centerX: number,
  topY: number,
  lineHeight: number,
  spacing: number,
  rng: () => number
): TallyGroup {
  const lines = generateVerticalLines(4, centerX, topY, lineHeight, spacing, rng);

  // Diagonal crossing line from bottom-left to top-right of the group
  const leftX = lines[0].x2 - 3;
  const rightX = lines[3].x1 + 3;
  const diagonal: TallyLine = {
    x1: leftX + (rng() - 0.5) * 2,
    y1: topY + lineHeight * 0.75 + (rng() - 0.5) * 3,
    x2: rightX + (rng() - 0.5) * 2,
    y2: topY + lineHeight * 0.15 + (rng() - 0.5) * 3,
    strokeWidth: 3.0 + rng() * 1.2,
  };

  return { lines, diagonal };
}

function generateTallyMarks(
  number: number,
  stickColor: string
): { lines: TallyLine[]; diagonals: TallyLine[] } {
  const seed = number * 17 + (stickColor === "red" ? 0 : 31) + 42;
  const rng = mulberry32(seed);

  const centerX = 50;
  const spacing = 12;
  const allLines: TallyLine[] = [];
  const allDiagonals: TallyLine[] = [];

  if (number <= 4) {
    // Single row of verticals, centered in the stick
    const lineHeight = 34 + rng() * 5;
    const topY = 43 - lineHeight / 2;
    allLines.push(...generateVerticalLines(number, centerX, topY, lineHeight, spacing, rng));
  } else if (number === 5) {
    // Crossed group of 5, centered
    const lineHeight = 34 + rng() * 5;
    const topY = 43 - lineHeight / 2;
    const group = generateCrossedFive(centerX, topY, lineHeight, spacing, rng);
    allLines.push(...group.lines);
    if (group.diagonal) allDiagonals.push(group.diagonal);
  } else if (number <= 10) {
    // Upper crossed-5 group + lower remainder
    const upperLineHeight = 28 + rng() * 4;
    const upperTopY = 18;
    const upperGroup = generateCrossedFive(centerX, upperTopY, upperLineHeight, spacing, rng);
    allLines.push(...upperGroup.lines);
    if (upperGroup.diagonal) allDiagonals.push(upperGroup.diagonal);

    const remainder = number - 5;
    const lowerLineHeight = 28 + rng() * 4;
    const lowerTopY = 58;

    if (remainder === 5) {
      // 10 = two crossed-5 groups
      const lowerGroup = generateCrossedFive(centerX, lowerTopY, lowerLineHeight, spacing, rng);
      allLines.push(...lowerGroup.lines);
      if (lowerGroup.diagonal) allDiagonals.push(lowerGroup.diagonal);
    } else {
      allLines.push(
        ...generateVerticalLines(remainder, centerX, lowerTopY, lowerLineHeight, spacing, rng)
      );
    }
  }

  return { lines: allLines, diagonals: allDiagonals };
}

// --- Components ---

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
  const clipId = useId();
  const isRed = stick.color === "red";
  const dimensions =
    size === "md"
      ? "w-[clamp(2.5rem,7.5vh,5rem)] h-[clamp(4rem,13vh,9rem)]"
      : "w-12 h-20";
  const label = `${stick.color === "red" ? "Red" : "Yellow"} ${stick.number}`;

  if (!revealed) {
    return <StickBack size={size} />;
  }

  const { lines, diagonals } = generateTallyMarks(stick.number, stick.color);

  return (
    <motion.div
      className={`
        ${dimensions} relative select-none cursor-default
        ${highlighted ? "drop-shadow-[0_0_8px_rgba(212,168,75,0.5)]" : ""}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        viewBox="0 0 100 125"
        className="w-full h-full"
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        <defs>
          <clipPath id={`stick-${clipId}`}>
            <path d={STICK_OUTLINE} />
          </clipPath>
        </defs>

        {/* Stick body clipped to organic shape */}
        <g clipPath={`url(#stick-${clipId})`}>
          {isRed ? (
            /* Red stick: solid vivid crimson */
            <rect width="100" height="125" fill="#c62828" />
          ) : (
            /* Yellow stick: crimson base + gold upper region */
            <>
              <rect width="100" height="125" fill="#c62828" />
              <path d={GOLD_REGION} fill="#a8862a" />
            </>
          )}

          {/* Subtle grain texture */}
          <line x1="25" y1="12" x2="27" y2="115" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          <line x1="42" y1="8" x2="43" y2="118" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" />
          <line x1="58" y1="6" x2="57" y2="117" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          <line x1="73" y1="10" x2="74" y2="116" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" />

          {/* Inner shadow for depth */}
          <path
            d={STICK_OUTLINE}
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="4"
          />
        </g>

        {/* Tally marks */}
        <g clipPath={`url(#stick-${clipId})`}>
          {lines.map((line, i) => (
            <line
              key={`l-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(245,218,185,0.95)"
              strokeWidth={line.strokeWidth}
              strokeLinecap="round"
            />
          ))}
          {diagonals.map((line, i) => (
            <line
              key={`d-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(245,218,185,0.9)"
              strokeWidth={line.strokeWidth}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Outer edge stroke */}
        <path
          d={STICK_OUTLINE}
          fill="none"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="1.5"
        />

        {/* Highlight glow when winner */}
        {highlighted && (
          <path
            d={STICK_OUTLINE}
            fill="none"
            stroke="rgba(212,168,75,0.6)"
            strokeWidth="3"
          />
        )}
      </svg>
    </motion.div>
  );
}

export function StickBack({ size = "md" }: { size?: "sm" | "md" }) {
  const clipId = useId();
  const dimensions =
    size === "md"
      ? "w-[clamp(2.5rem,7.5vh,5rem)] h-[clamp(4rem,13vh,9rem)]"
      : "w-12 h-20";

  return (
    <div className={`${dimensions} relative select-none`}>
      <svg viewBox="0 0 100 125" className="w-full h-full">
        <defs>
          <clipPath id={`back-${clipId}`}>
            <path d={STICK_OUTLINE} />
          </clipPath>
        </defs>

        {/* Dark wood body */}
        <g clipPath={`url(#back-${clipId})`}>
          <rect width="100" height="125" fill="#3d2415" />

          {/* Subtle grain */}
          <line x1="30" y1="8" x2="32" y2="118" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
          <line x1="50" y1="6" x2="49" y2="116" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <line x1="68" y1="10" x2="70" y2="115" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />

          {/* Inner shadow */}
          <path d={STICK_OUTLINE} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="4" />

          {/* Centered diamond ornament */}
          <path
            d="M 50,50 L 56,62 L 50,74 L 44,62 Z"
            fill="rgba(122,74,22,0.25)"
            stroke="rgba(122,74,22,0.15)"
            strokeWidth="1"
          />
        </g>

        {/* Outer edge */}
        <path d={STICK_OUTLINE} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
