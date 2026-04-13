@AGENTS.md

# Duo

Practice website for the Duo card game from Crimson Desert (based on Korean Seotda).

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run type-check` - TypeScript check
- `npm test` - Run tests with coverage (must pass 80% in all categories)
- `npm run test:watch` - Tests in watch mode

## Architecture

All game logic lives in `src/engine/` with zero UI dependencies. Every engine function is pure and testable.

- **`src/engine/types.ts`** - All types. `HandRank` is a numeric enum so comparison is `rank1 > rank2`. Special hands (Judge, Executor, Warden, High Warden) are tracked separately via `SpecialHand` type.
- **`src/engine/hand-evaluator.ts`** - Most critical file. `evaluateHand()` returns standard rank + special ability flags. `resolveShowdown()` handles the full priority chain: Prime Pair immunity > Executor vs Superior Pair > Judge vs Pairs > Warden rematches > standard ranking.
- **`src/engine/game-state.ts`** - Reducer-based state machine. Phases: idle -> dealing -> playerBet <-> aiBet -> showdown -> roundEnd. Fold short-circuits to roundEnd.
- **`src/engine/betting.ts`** - 6 actions: Check, Call, Half Raise (50% pot), Double Raise (2x last raise), All In, Fold. `BetState` tracks `playerActed`/`aiActed` flags for determining when betting is complete.
- **`src/engine/ai.ts`** - Weighted random strategy. Categorizes hands into strong/medium/weak and adjusts action weights. Considers visible player card.

UI state is managed via `useReducer` in `src/hooks/useGameState.ts`. No external state libraries.

## Key Rules to Preserve

- Currency is **Silver**, not coins. Buy-in is **15 Silver** (Hernand Inn).
- Timer auto-**Calls** on expiry (not fold).
- Warden evaluates to **3 Points** as fallback. Judge evaluates to **Zero** as fallback. Executor evaluates to **1 Point** as fallback.
- Rematches carry the pot over, cap at 3.
- Winner gets the First Turn marker for the next round.

## Testing

Tests are colocated in `__tests__/` directories next to the code they test. Coverage thresholds are enforced at 80% for statements, branches, functions, and lines in `vitest.config.ts`.

## Style

Crimson Desert dark fantasy theme. Colors defined as CSS custom properties in `src/app/globals.css` via Tailwind `@theme inline`. Heading font: Georgia/serif. Body font: system-ui/sans-serif.
