# Duodegen

A practice website for the Duo card game from [Crimson Desert](https://store.steampowered.com/app/3321460/Crimson_Desert/) by Pearl Abyss. Duo is based on the traditional Korean card game [Seotda](https://en.wikipedia.org/wiki/Seotda), played with numbered sticks instead of Hwatu flower cards.

Play against an AI opponent, learn the hand rankings, and sharpen your betting strategy before heading to the Hernand Inn.

## Features

- Full Duo card game with AI opponent
- **Learning Mode** - Real-time strategy advisor with hand strength analysis, pot odds, bluff detection, and opponent card reads (also disables timer)
- **Action Feed** - Clear log of all betting actions each round
- **Hand Name Styles** - Switch between Crimson Desert names and traditional Seotda names
- **Hand Guide** - In-game reference for all rankings and special hands
- **Settings** - Configurable learning mode and hand name preferences (persisted)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Run tests with coverage (80% threshold) |
| `npm run test:watch` | Run tests in watch mode |

## Game Rules

### Deck

20 numbered sticks: 1-10, each in **Red** and **Yellow**.

### Gameplay

1. Buy in with **15 Silver** (Hernand Inn)
2. Each player posts a **1 Silver ante** at the start of each hand
3. Each player is dealt 2 sticks
4. You can see one of your opponent's sticks
5. Single betting round: Check, Call, Half Raise, Double Raise, All In, or Fold
6. 10-second timer per decision (auto-Call on expiry)
7. Highest hand wins the pot (minimum pot is 2 Silver from antes)
8. Winner gets first turn next round

### Hand Rankings (Best to Worst)

Crimson Desert names shown. Traditional Seotda names available in Settings.

| Rank | Hand | Cards |
|------|------|-------|
| 1 | Prime Pair | Red 3 + Red 8 |
| 2 | Superior Pair | Red 1 + Red 8, or Red 1 + Red 3 |
| 3 | Ten Pair | 10 + 10 |
| 4-12 | Pair | 9-9 down to 1-1 |
| 13 | One-Two | 1 + 2 |
| 14 | One-Four | 1 + 4 |
| 15 | One-Nine | 1 + 9 |
| 16 | One-Ten | 1 + 10 |
| 17 | Four-Ten | 4 + 10 |
| 18 | Four-Six | 4 + 6 |
| 19 | Perfect Nine | Sum ends in 9 |
| 20-26 | 8-2 Points | Sum ends in 8 down to 2 |
| 27 | 1 Point | Sum ends in 1 |
| 28 | Zero | Sum ends in 0 |

### Special Hands

| Hand | Cards | Ability |
|------|-------|---------|
| Judge | 3 + 7 | Beats 9-Pair or lower; becomes Zero vs Ten Pair+ |
| Executor | Red 4 + Red 7 | Beats Superior Pair; becomes 1 Point otherwise |
| Warden | 4 + 9 | Rematch if opponent has One-Two or lower |
| High Warden | Red 4 + Red 9 | Rematch if opponent has 9-Pair or lower |

## Project Structure

```
src/
  engine/          # Game logic (no UI dependencies)
    types.ts       # Stick, HandRank, BetState, GameState, ActionLogEntry
    deck.ts        # Create, shuffle, deal
    hand-evaluator.ts  # Evaluate hands, resolve showdowns
    hand-names.ts  # Crimson Desert & Traditional Seotda name sets
    betting.ts     # Available actions, apply bets
    game-state.ts  # Reducer-based state machine
    ai.ts          # AI opponent strategy
    strategy.ts    # Learning mode strategy advisor engine
  components/
    game/          # Game UI (Stick, BettingControls, Timer, ActionFeed, etc.)
    ui/            # Shared primitives (Button, Modal)
    HandGuide.tsx  # In-game hand rankings reference
    SettingsModal.tsx  # Settings for learning mode & hand names
    GitHubCorner.tsx   # GitHub repo link
  hooks/
    useGameState.ts  # Central game hook (useReducer + side effects)
    useTimer.ts      # 10-second countdown
    useLearningMode.ts # Strategy advisor derivation
    useSettings.tsx  # App-wide settings context (localStorage-persisted)
  app/
    layout.tsx     # Root layout (SettingsProvider, GitHubCorner)
    page.tsx       # Landing page
    play/page.tsx  # Game screen
    rules/page.tsx # Full rules reference
```

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Framer Motion** for card animations
- **Vitest** + **Testing Library** with v8 coverage (80% threshold)
- **GitHub Actions** CI (lint, type-check, test, build)
