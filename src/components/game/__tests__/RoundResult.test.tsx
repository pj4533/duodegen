import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoundResult from "../RoundResult";
import { RoundResult as RoundResultType, HandRank } from "@/engine/types";

function makeResult(overrides: Partial<RoundResultType> = {}): RoundResultType {
  return {
    playerHand: [
      { number: 9, color: "red" },
      { number: 9, color: "yellow" },
    ],
    aiHand: [
      { number: 1, color: "yellow" },
      { number: 2, color: "yellow" },
    ],
    playerHandResult: { rank: HandRank.Pair9, name: "9 Pair", special: null },
    aiHandResult: { rank: HandRank.Ali, name: "Ali", special: null },
    winner: "player",
    potWon: 10,
    wasRematch: false,
    specialResolution: null,
    ...overrides,
  };
}

describe("RoundResult", () => {
  it("shows Victory for player win", () => {
    render(
      <RoundResult
        result={makeResult()}
        onContinue={vi.fn()}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Victory!")).toBeInTheDocument();
  });

  it("shows Defeat for AI win", () => {
    render(
      <RoundResult
        result={makeResult({ winner: "ai" })}
        onContinue={vi.fn()}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Defeat")).toBeInTheDocument();
  });

  it("shows Draw for draw", () => {
    render(
      <RoundResult
        result={makeResult({ winner: "draw" })}
        onContinue={vi.fn()}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Draw")).toBeInTheDocument();
  });

  it("shows special resolution message", () => {
    render(
      <RoundResult
        result={makeResult({ specialResolution: "Judge beats all Pairs 9 and below!" })}
        onContinue={vi.fn()}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Judge beats all Pairs 9 and below!")).toBeInTheDocument();
  });

  it("calls onContinue when Next Round is clicked", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(
      <RoundResult
        result={makeResult()}
        onContinue={onContinue}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    await user.click(screen.getByText("Next Round"));
    expect(onContinue).toHaveBeenCalled();
  });

  it("shows Game Over when player loses and game is over", async () => {
    const user = userEvent.setup();
    const onNewGame = vi.fn();
    render(
      <RoundResult
        result={makeResult({ winner: "ai" })}
        onContinue={vi.fn()}
        gameOver={true}
        onNewGame={onNewGame}
      />
    );
    expect(screen.getByText("Game Over")).toBeInTheDocument();
    expect(screen.queryByText("Opponent is out of silver!")).not.toBeInTheDocument();
    await user.click(screen.getByText("New Game"));
    expect(onNewGame).toHaveBeenCalled();
  });

  it("shows victory message when player wins and game is over", () => {
    render(
      <RoundResult
        result={makeResult({ winner: "player", potWon: 30 })}
        onContinue={vi.fn()}
        gameOver={true}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Victory!")).toBeInTheDocument();
    expect(screen.getByText("Opponent is out of silver!")).toBeInTheDocument();
    expect(screen.getByText("New Game")).toBeInTheDocument();
    expect(screen.queryByText("Game Over")).not.toBeInTheDocument();
  });

  it("shows hand names", () => {
    render(
      <RoundResult
        result={makeResult()}
        onContinue={vi.fn()}
        gameOver={false}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("9 Pair")).toBeInTheDocument();
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });
});
