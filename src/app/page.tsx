import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center relative z-10 px-4">
      {/* Radial glow behind title */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-crimson-800/20 rounded-full blur-3xl pointer-events-none" />

      <main className="flex flex-col items-center gap-8 text-center relative">
        <div className="space-y-2">
          <h1 className="font-heading text-7xl sm:text-8xl font-bold tracking-wider text-gold-light drop-shadow-lg">
            DUODEGEN
          </h1>
          <p className="font-heading text-lg sm:text-xl text-parchment-dark tracking-widest uppercase">
            A Crimson Desert Card Game
          </p>
        </div>

        <p className="max-w-md text-parchment-dark/80 text-sm sm:text-base leading-relaxed">
          Master the art of numbered sticks. Learn hand rankings, practice
          betting strategy, and defeat your opponents at the Hernand Inn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/play"
            className="px-8 py-3 bg-crimson-700 hover:bg-crimson-600 text-parchment-light font-heading text-lg tracking-wide rounded border border-gold-dark/50 hover:border-gold/70 transition-all duration-200 shadow-lg hover:shadow-crimson-700/30"
          >
            Play Duo
          </Link>
          <Link
            href="/rules"
            className="px-8 py-3 bg-crimson-950 hover:bg-crimson-900 text-parchment-dark hover:text-parchment-light font-heading text-lg tracking-wide rounded border border-gold-dark/30 hover:border-gold-dark/60 transition-all duration-200"
          >
            Rules
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="mt-8 flex items-center gap-3 text-gold-dark/40">
          <div className="w-16 h-px bg-gold-dark/30" />
          <span className="font-heading text-xs tracking-widest">
            SEOTDA
          </span>
          <div className="w-16 h-px bg-gold-dark/30" />
        </div>
      </main>
    </div>
  );
}
