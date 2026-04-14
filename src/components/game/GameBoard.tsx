"use client";

import { useTimer } from "@/hooks/useTimer";
import { evaluateHand } from "@/engine/hand-evaluator";
import { GameState, BetAction } from "@/engine/types";
import PlayerHand from "./PlayerHand";
import OpponentHand from "./OpponentHand";
import BettingControls from "./BettingControls";
import Timer from "./Timer";
import PotDisplay from "./PotDisplay";
import RoundResult from "./RoundResult";
import Button from "@/components/ui/Button";
import ActionFeed from "./ActionFeed";

interface GameBoardProps {
  state: GameState;
  startRound: () => void;
  playerBet: (action: BetAction) => void;
  handleTimerExpired: () => void;
  newGame: () => void;
  learningEnabled: boolean;
  debugMode?: boolean;
}

export default function GameBoard({
  state,
  startRound,
  playerBet,
  handleTimerExpired,
  newGame,
  learningEnabled,
  debugMode = false,
}: GameBoardProps) {
  const { secondsLeft } = useTimer(
    state.phase === "playerBet",
    handleTimerExpired,
    debugMode
  );

  const isShowdown = state.phase === "showdown" || state.phase === "roundEnd";
  const playerResult =
    state.playerHand ? evaluateHand(state.playerHand) : null;
  const aiResult =
    state.aiHand && isShowdown ? evaluateHand(state.aiHand) : null;
  const isPlayerWinner = state.lastResult?.winner === "player";
  const isAiWinner = state.lastResult?.winner === "ai";

  return (
    <div className={`flex flex-col items-center gap-2 sm:gap-3 xl:gap-4 w-full relative z-10 ${learningEnabled ? "pb-16 md:pb-0" : ""}`}>
      {/* Round indicator */}
      {state.roundNumber > 0 && (
        <div className="text-sm font-heading text-parchment-dark/60">
          Round {state.roundNumber}
        </div>
      )}

      {/* Opponent */}
      <OpponentHand
        hand={state.aiHand}
        revealedIndex={state.revealedAiCardIndex}
        showAll={isShowdown}
        handResult={aiResult}
        showResult={isShowdown && !!state.lastResult}
        isWinner={isAiWinner}
      />

      {/* Pot & Silver */}
      <PotDisplay
        pot={state.bet.pot}
        playerSilver={state.bet.playerSilver}
        aiSilver={state.bet.aiSilver}
      />

      {/* Action Feed */}
      <ActionFeed entries={state.actionLog} />

      {/* Game status messages */}
      {state.phase === "aiBet" && (
        <p className="text-sm text-parchment-dark/60 font-heading animate-pulse">
          Opponent is thinking...
        </p>
      )}
      {state.phase === "dealing" && (
        <p className="text-sm text-parchment-dark/60 font-heading animate-pulse">
          Dealing sticks...
        </p>
      )}
      {state.rematchCount > 0 && state.phase !== "roundEnd" && (
        <p className="text-xs text-gold font-heading tracking-wider">
          Rematch #{state.rematchCount}
        </p>
      )}

      {/* Timer */}
      {!debugMode && (
        <Timer secondsLeft={secondsLeft} active={state.phase === "playerBet"} />
      )}

      {/* Player Hand */}
      <PlayerHand
        hand={state.playerHand}
        handResult={playerResult}
        showResult={!!playerResult}
        isWinner={isPlayerWinner}
      />

      {/* Betting Controls */}
      {state.phase === "playerBet" && (
        <BettingControls
          betState={state.bet}
          onAction={playerBet}
        />
      )}

      {/* Start / New Game */}
      {state.phase === "idle" && (
        <div className="flex flex-col items-center gap-3">
          <Button onClick={startRound} variant="primary">
            {state.roundNumber === 0 ? "Start Game" : "Next Round"}
          </Button>
          {state.roundNumber > 0 && (
            <Button onClick={newGame} variant="secondary" size="sm">
              New Game
            </Button>
          )}
        </div>
      )}

      {state.phase === "roundEnd" && !state.gameOver && !state.lastResult && (
        <Button onClick={startRound}>Next Round</Button>
      )}

      {/* Round Result Overlay */}
      {state.phase === "roundEnd" && state.lastResult && (
        <RoundResult
          result={state.lastResult}
          onContinue={startRound}
          gameOver={state.gameOver}
          onNewGame={newGame}
        />
      )}

    </div>
  );
}
