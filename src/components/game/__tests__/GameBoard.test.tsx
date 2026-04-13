import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "../GameBoard";
import { createInitialGameState } from "@/engine/game-state";
import { GameState, BetAction } from "@/engine/types";
import { SettingsProvider } from "@/hooks/useSettings";

function defaultProps(overrides?: Partial<GameState>) {
  const state = { ...createInitialGameState(), ...overrides };
  return {
    state,
    startRound: vi.fn(),
    playerBet: vi.fn() as (action: BetAction) => void,
    handleTimerExpired: vi.fn(),
    newGame: vi.fn(),
    learningEnabled: false,
    onOpenSettings: vi.fn(),
  };
}

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("GameBoard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Start Game button initially", () => {
    renderWithSettings(<GameBoard {...defaultProps()} />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("renders Hand Guide button", () => {
    renderWithSettings(<GameBoard {...defaultProps()} />);
    expect(screen.getByText("Hand Guide")).toBeInTheDocument();
  });

  it("renders Settings button", () => {
    renderWithSettings(<GameBoard {...defaultProps()} />);
    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
  });

  it("shows dealing state when phase is dealing", () => {
    renderWithSettings(<GameBoard {...defaultProps({ phase: "dealing" })} />);
    expect(screen.getByText("Dealing sticks...")).toBeInTheDocument();
  });

  it("opens hand guide modal", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithSettings(<GameBoard {...defaultProps()} />);

    await user.click(screen.getByText("Hand Guide"));
    expect(screen.getByText("Hand Rankings")).toBeInTheDocument();
  });

  it("shows silver amounts", () => {
    renderWithSettings(<GameBoard {...defaultProps()} />);
    const fifteens = screen.getAllByText("15");
    expect(fifteens.length).toBeGreaterThanOrEqual(2);
  });

  it("calls startRound when Start Game is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const props = defaultProps();
    renderWithSettings(<GameBoard {...props} />);

    await user.click(screen.getByText("Start Game"));
    expect(props.startRound).toHaveBeenCalled();
  });

  it("calls onOpenSettings when Settings is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const props = defaultProps();
    renderWithSettings(<GameBoard {...props} />);

    await user.click(screen.getByLabelText("Settings"));
    expect(props.onOpenSettings).toHaveBeenCalled();
  });

  it("hides timer in debug mode", () => {
    renderWithSettings(
      <GameBoard
        {...defaultProps({
          phase: "playerBet",
          playerHand: [{ number: 1, color: "red" }, { number: 2, color: "yellow" }],
          aiHand: [{ number: 5, color: "yellow" }, { number: 6, color: "yellow" }],
        })}
        debugMode={true}
      />
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
