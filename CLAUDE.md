@AGENTS.md

# Duodegen

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

- **`src/engine/types.ts`** - All types. `HandRank` is a numeric enum so comparison is `rank1 > rank2`. Special hands (Judge, Executor, Warden, High Warden) are tracked separately via `SpecialHand` type. `ActionLogEntry` tracks betting actions for the action feed.
- **`src/engine/hand-evaluator.ts`** - Most critical file. `evaluateHand()` returns standard rank + special ability flags. `resolveShowdown()` handles the full priority chain: Prime Pair immunity > Executor vs Superior Pair > Judge vs Pairs > Warden rematches > standard ranking.
- **`src/engine/hand-names.ts`** - Two complete hand name sets: Crimson Desert (default: One-Two, Judge, Zero) and Traditional Seotda (Ali, Pair Catcher, Mang-tong). Provides `getDisplayName()`, `getRankingsGuide()`, `getSpecialsGuide()`. All UI display points read names through this module.
- **`src/engine/game-state.ts`** - Reducer-based state machine. Phases: idle -> dealing -> playerBet <-> aiBet -> showdown -> roundEnd. Fold short-circuits to roundEnd. Tracks `actionLog` for the betting action feed.
- **`src/engine/betting.ts`** - 6 actions: Check, Call, Half Raise (50% pot), Double Raise (2x last raise), All In, Fold. `BetState` tracks `playerActed`/`aiActed` flags for determining when betting is complete.
- **`src/engine/ai.ts`** - Weighted random strategy. Categorizes hands into strong/medium/weak and adjusts action weights. Considers visible player card.
- **`src/engine/strategy.ts`** - Strategy advisor engine for Learning Mode. Pure functions: `generateAdvice()`, `classifyHandStrength()`, `analyzeOpponentVisible()`, `calculateWinProbability()`, `assessBluffViability()`. Accepts `HandNameStyle` parameter. Based on researched Seotda strategy.

UI state is managed via `useReducer` in `src/hooks/useGameState.ts`. No external state libraries.

- **`src/hooks/useSettings.tsx`** - React context for app-wide settings (learning mode, hand name style). Persisted to localStorage. `SettingsProvider` wraps the app in `layout.tsx`.
- **`src/hooks/useLearningMode.ts`** - Derives strategy advice from game state when learning mode is enabled. Accepts name style parameter.

## Hand Names

The game supports two naming conventions, switchable in Settings:

**Crimson Desert** (default - matches in-game names):
- Pairs: Prime Pair, Superior Pair, Ten Pair, 9 Pair...
- Named: One-Two, One-Four, One-Nine, One-Ten, Four-Ten, Four-Six
- Points: Perfect Nine, 8 Points... Zero
- Special: Judge, Executor, Warden, High Warden

**Traditional Seotda** (romanized Korean names):
- Pairs: 38 Bright Pair, Bright Pair, 10 Ttaeng, 9 Ttaeng...
- Named: Ali, Dok-sa, Gu-bing, Jang-bing, Jang-sa, Se-ryuk
- Points: Gap-o, 8 Kkeut... Mang-tong
- Special: Pair Catcher, Secret Inspector, Gu-sa, Animal Gu-sa

Internal enum names (Ali, DokSa, GuBing, etc.) are kept as identifiers regardless of display style.

## Key Rules to Preserve

- Currency is **Silver**, not coins. Buy-in is **15 Silver** (Hernand Inn).
- Timer auto-**Calls** on expiry (not fold).
- Warden evaluates to **3 Points** as fallback. Judge evaluates to **Zero** as fallback. Executor evaluates to **1 Point** as fallback.
- Rematches carry the pot over, cap at 3.
- Winner gets the First Turn marker for the next round.

## Debug / No-Timer Mode

Add `?debug` to the play URL (e.g. `http://localhost:3000/play?debug`) to disable the 10-second betting timer. Learning Mode in Settings also disables the timer. This is useful for:
- Playwright/automated testing (no timer pressure)
- Manual debugging of game flow
- Taking time to study the strategy advisor

The timer UI is hidden and auto-call on expiry is suppressed. Requires `<Suspense>` wrapping in PlayPage because `useSearchParams` is used.

## Testing

Tests are colocated in `__tests__/` directories next to the code they test. Coverage thresholds are enforced at 80% for statements, branches, functions, and lines in `vitest.config.ts`.

## Style

Crimson Desert dark fantasy theme. Colors defined as CSS custom properties in `src/app/globals.css` via Tailwind `@theme inline`. Heading font: Georgia/serif. Body font: system-ui/sans-serif.
