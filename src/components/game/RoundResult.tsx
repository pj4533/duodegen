"use client";

import type { RoundResult as RoundResultType } from "@/engine/types";
import Button from "@/components/ui/Button";

interface RoundResultProps {
  result: RoundResultType;
  onContinue: () => void;
  gameOver: boolean;
  onNewGame: () => void;
}

export default function RoundResult({
  result,
  onContinue,
  gameOver,
  onNewGame,
}: RoundResultProps) {
  const isWin = result.winner === "player";
  const isDraw = result.winner === "draw";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-crimson-950 border border-gold-dark/40 rounded-lg p-6 sm:p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <h2
          className={`font-heading text-3xl font-bold tracking-wider ${
            isWin
              ? "text-gold-light"
              : isDraw
                ? "text-parchment"
                : "text-crimson-400"
          }`}
        >
          {isWin ? "Victory!" : isDraw ? "Draw" : "Defeat"}
        </h2>

        {result.specialResolution && (
          <p className="text-gold font-heading text-sm tracking-wide">
            {result.specialResolution}
          </p>
        )}

        <div className="space-y-1 text-sm text-parchment-dark">
          <p>
            Your hand:{" "}
            <span className="text-parchment-light font-heading">
              {result.playerHandResult.name}
            </span>
          </p>
          <p>
            Opponent:{" "}
            <span className="text-parchment-light font-heading">
              {result.aiHandResult.name}
            </span>
          </p>
          {!isDraw && (
            <p className="mt-2 text-gold-light font-heading">
              {isWin ? "+" : "-"}{result.potWon} silver
            </p>
          )}
        </div>

        {gameOver ? (
          <div className="space-y-2">
            <p className="text-crimson-300 font-heading text-sm">Game Over</p>
            <Button onClick={onNewGame}>New Game</Button>
          </div>
        ) : (
          <Button onClick={onContinue}>
            {result.wasRematch ? "Continue" : "Next Round"}
          </Button>
        )}
      </div>
    </div>
  );
}
