import Link from "next/link";

const RANKINGS = [
  { rank: 1, name: "Prime Pair", cards: "Red 3 + Red 8", desc: "Unbeatable. Both sticks must be Red." },
  { rank: 2, name: "Superior Pair", cards: "Red 1 + Red 8 or Red 1 + Red 3", desc: "Both sticks must be Red." },
  { rank: 3, name: "Ten Pair", cards: "10 + 10 (any color)", desc: "Highest regular pair." },
  { rank: "4-12", name: "Pairs", cards: "Same number (9-9 down to 1-1)", desc: "Higher number wins." },
  { rank: 13, name: "Ali", cards: "1 + 2", desc: "Best named hand." },
  { rank: 14, name: "Dok Sa", cards: "1 + 4", desc: "" },
  { rank: 15, name: "Gu Bing", cards: "1 + 9", desc: "" },
  { rank: 16, name: "Jang Bing", cards: "1 + 10", desc: "" },
  { rank: 17, name: "Jang Sa", cards: "4 + 10", desc: "" },
  { rank: 18, name: "Sel Ryuk", cards: "4 + 6", desc: "Lowest named hand." },
  { rank: 19, name: "9 Points", cards: "Sum ends in 9", desc: "Best point hand." },
  { rank: "20-26", name: "8-2 Points", cards: "Sum ends in 8 down to 2", desc: "" },
  { rank: 27, name: "1 Point", cards: "Sum ends in 1", desc: "" },
  { rank: 28, name: "Mang Tong", cards: "Sum ends in 0", desc: "Worst possible hand." },
];

const SPECIALS = [
  {
    name: "Judge",
    cards: "3 + 7 (any color)",
    ability: "Beats any hand that is 9-Pair or lower.",
    fallback: "Becomes Zero (Mang Tong) if opponent has Ten Pair or higher.",
    korean: "땡잡이",
  },
  {
    name: "Executor",
    cards: "Red 4 + Red 7",
    ability: "Beats Superior Pair only.",
    fallback: "Becomes 1 Point if opponent doesn't have Superior Pair.",
    korean: "암행어사",
  },
  {
    name: "Warden",
    cards: "4 + 9 (any color)",
    ability: "Triggers a rematch if opponent has Ali or lower.",
    fallback: "Evaluates as 3 Points if no rematch triggers.",
    korean: "구사",
  },
  {
    name: "High Warden",
    cards: "Red 4 + Red 9",
    ability: "Triggers a rematch if opponent has 9-Pair or lower.",
    fallback: "Evaluates as 3 Points if no rematch triggers.",
    korean: "멍텅구리 구사",
  },
];

export default function RulesPage() {
  return (
    <div className="flex flex-1 flex-col relative z-10">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gold-dark/10">
        <Link
          href="/"
          className="font-heading text-lg text-gold-dark hover:text-gold-light transition-colors tracking-wider"
        >
          DUO
        </Link>
        <Link
          href="/play"
          className="text-xs font-heading text-parchment-dark/60 hover:text-parchment-light transition-colors tracking-wider uppercase"
        >
          Play
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full space-y-8">
        <h1 className="font-heading text-4xl text-gold-light tracking-wider text-center">
          Rules of Duo
        </h1>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Overview
          </h2>
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

        {/* Buy-in & Betting */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Betting
          </h2>
          <div className="space-y-2 text-sm text-parchment-dark leading-relaxed">
            <p>Buy-in: <strong className="text-parchment-light">15 Silver</strong> at the Hernand Inn.</p>
            <p>Each hand begins with a <strong className="text-parchment-light">1 Silver ante</strong> from each player, seeding the pot with 2 Silver.</p>
            <p>You have <strong className="text-parchment-light">10 seconds</strong> to choose an action. If time runs out, you automatically Call.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { action: "Check", desc: "Pass without betting. Only if no one has raised." },
              { action: "Call", desc: "Match the current bet." },
              { action: "Half Raise", desc: "Raise by half the current pot." },
              { action: "Double Raise", desc: "Raise by double the previous raise." },
              { action: "All In", desc: "Bet all your remaining silver." },
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
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Hand Rankings
          </h2>
          <p className="text-xs text-parchment-dark/60">Best to worst, top to bottom.</p>
          <div className="space-y-1">
            {RANKINGS.map((r) => (
              <div
                key={r.name}
                className="flex items-baseline gap-3 py-1 text-sm border-b border-crimson-900/20 last:border-0"
              >
                <span className="text-gold-dark/60 text-xs font-heading w-8 text-right shrink-0">
                  {r.rank}
                </span>
                <span className="font-heading text-parchment-light min-w-[100px]">
                  {r.name}
                </span>
                <span className="text-parchment-dark/70 text-xs">{r.cards}</span>
                {r.desc && (
                  <span className="text-parchment-dark/50 text-xs ml-auto hidden sm:inline">
                    {r.desc}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Special Hands */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Special Hands
          </h2>
          <p className="text-xs text-parchment-dark/60">
            These hands have conditional abilities that override normal rankings.
          </p>
          <div className="space-y-3">
            {SPECIALS.map((s) => (
              <div
                key={s.name}
                className="bg-crimson-900/30 rounded-lg p-3 border border-gold-dark/15 space-y-1"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-gold-light">{s.name}</span>
                  <span className="text-xs text-parchment-dark/50 font-heading">
                    {s.korean}
                  </span>
                </div>
                <p className="text-xs text-parchment-dark/70">Cards: {s.cards}</p>
                <p className="text-sm text-parchment-light">{s.ability}</p>
                <p className="text-xs text-crimson-300/70">{s.fallback}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rematch */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-gold tracking-wide border-b border-gold-dark/20 pb-1">
            Rematch Rules
          </h2>
          <div className="text-sm text-parchment-dark leading-relaxed space-y-1">
            <p>When a Warden or High Warden triggers a rematch:</p>
            <ul className="list-disc list-inside space-y-1 text-parchment-dark/80">
              <li>The pot carries over (no additional cost)</li>
              <li>All sticks are reshuffled and re-dealt</li>
              <li>Maximum 3 rematches per round</li>
              <li>If the cap is reached, hands are compared by fallback values</li>
            </ul>
          </div>
        </section>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href="/play"
            className="font-heading text-gold-dark hover:text-gold-light transition-colors tracking-wider"
          >
            Play Duo &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
