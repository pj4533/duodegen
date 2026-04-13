"use client";

interface PotDisplayProps {
  pot: number;
  playerSilver: number;
  aiSilver: number;
}

export default function PotDisplay({
  pot,
  playerSilver,
  aiSilver,
}: PotDisplayProps) {
  return (
    <div className="flex items-center gap-6 text-center">
      <SilverAmount label="You" amount={playerSilver} testId="player-silver" />
      <div className="flex flex-col items-center">
        <span className="text-xs font-heading text-parchment-dark/50 tracking-wider uppercase">
          Pot
        </span>
        <span className="text-2xl font-heading font-bold text-gold-light tabular-nums" data-testid="pot-amount">
          {pot}
        </span>
        <span className="text-[10px] text-parchment-dark/40">silver</span>
      </div>
      <SilverAmount label="Opponent" amount={aiSilver} testId="opponent-silver" />
    </div>
  );
}

function SilverAmount({ label, amount, testId }: { label: string; amount: number; testId?: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-[10px] font-heading text-parchment-dark/50 tracking-wider uppercase">
        {label}
      </span>
      <span className="text-lg font-heading text-parchment-light tabular-nums" data-testid={testId}>
        {amount}
      </span>
      <span className="text-[10px] text-parchment-dark/40">silver</span>
    </div>
  );
}
