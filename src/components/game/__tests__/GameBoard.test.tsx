import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "../GameBoard";

describe("GameBoard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Start Game button initially", () => {
    render(<GameBoard />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("renders Hand Guide button", () => {
    render(<GameBoard />);
    expect(screen.getByText("Hand Guide")).toBeInTheDocument();
  });

  it("shows dealing state after clicking Start Game", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<GameBoard />);

    await user.click(screen.getByText("Start Game"));
    // Should show dealing or betting state
    const hasDealing = screen.queryByText("Dealing sticks...");
    const hasBetting = screen.queryByText("Check");
    const hasThinking = screen.queryByText("Opponent is thinking...");
    expect(hasDealing || hasBetting || hasThinking).toBeTruthy();
  });

  it("opens hand guide modal", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<GameBoard />);

    await user.click(screen.getByText("Hand Guide"));
    expect(screen.getByText("Hand Rankings")).toBeInTheDocument();
  });

  it("shows silver amounts", () => {
    render(<GameBoard />);
    // Both players start with 15 silver
    const fifteens = screen.getAllByText("15");
    expect(fifteens.length).toBeGreaterThanOrEqual(2);
  });
});
