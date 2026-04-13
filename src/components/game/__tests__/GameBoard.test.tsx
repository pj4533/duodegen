import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "../GameBoard";
import { createInitialGameState } from "@/engine/game-state";
import { GameState, BetAction } from "@/engine/types";

function defaultProps(overrides?: Partial<GameState>) {
  const state = { ...createInitialGameState(), ...overrides };
  return {
    state,
    startRound: vi.fn(),
    playerBet: vi.fn() as (action: BetAction) => void,
    handleTimerExpired: vi.fn(),
    newGame: vi.fn(),
    learningEnabled: false,
    onToggleLearning: vi.fn(),
  };
}

describe("GameBoard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Start Game button initially", () => {
    render(<GameBoard {...defaultProps()} />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("renders Hand Guide button", () => {
    render(<GameBoard {...defaultProps()} />);
    expect(screen.getByText("Hand Guide")).toBeInTheDocument();
  });

  it("renders Learn toggle", () => {
    render(<GameBoard {...defaultProps()} />);
    expect(screen.getByLabelText("Learning mode off")).toBeInTheDocument();
  });

  it("shows dealing state when phase is dealing", () => {
    render(<GameBoard {...defaultProps({ phase: "dealing" })} />);
    expect(screen.getByText("Dealing sticks...")).toBeInTheDocument();
  });

  it("opens hand guide modal", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<GameBoard {...defaultProps()} />);

    await user.click(screen.getByText("Hand Guide"));
    expect(screen.getByText("Hand Rankings")).toBeInTheDocument();
  });

  it("shows silver amounts", () => {
    render(<GameBoard {...defaultProps()} />);
    // Both players start with 15 silver
    const fifteens = screen.getAllByText("15");
    expect(fifteens.length).toBeGreaterThanOrEqual(2);
  });

  it("calls startRound when Start Game is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const props = defaultProps();
    render(<GameBoard {...props} />);

    await user.click(screen.getByText("Start Game"));
    expect(props.startRound).toHaveBeenCalled();
  });

  it("calls onToggleLearning when Learn is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const props = defaultProps();
    render(<GameBoard {...props} />);

    await user.click(screen.getByLabelText("Learning mode off"));
    expect(props.onToggleLearning).toHaveBeenCalled();
  });
});
