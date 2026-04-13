import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BettingControls from "../BettingControls";
import { createInitialBetState } from "@/engine/betting";

describe("BettingControls", () => {
  it("renders all six action buttons", () => {
    const onAction = vi.fn();
    render(
      <BettingControls
        betState={createInitialBetState(15, 15)}
        onAction={onAction}
      />
    );
    expect(screen.getByRole("button", { name: /Check/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Call/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Half-Pot/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Raise/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /All-in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fold/i })).toBeInTheDocument();
  });

  it("disables unavailable actions", () => {
    const onAction = vi.fn();
    const betState = createInitialBetState(15, 15);
    render(<BettingControls betState={betState} onAction={onAction} />);

    // Call should be disabled (no bet to call)
    expect(screen.getByRole("button", { name: /Call/i })).toBeDisabled();
    // Fold should be disabled (no bet to fold against)
    expect(screen.getByRole("button", { name: /Fold/i })).toBeDisabled();
    // Check should be enabled
    expect(screen.getByRole("button", { name: /Check/i })).not.toBeDisabled();
  });

  it("calls onAction when a button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <BettingControls
        betState={createInitialBetState(15, 15)}
        onAction={onAction}
      />
    );

    await user.click(screen.getByRole("button", { name: /Check/i }));
    expect(onAction).toHaveBeenCalledWith("check");
  });

  it("disables all buttons when disabled prop is true", () => {
    const onAction = vi.fn();
    render(
      <BettingControls
        betState={createInitialBetState(15, 15)}
        onAction={onAction}
        disabled
      />
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("shows silver amounts on buttons when non-zero", () => {
    const onAction = vi.fn();
    const betState = createInitialBetState(15, 15);
    betState.pot = 6;
    betState.currentBet = 3;
    betState.aiBetThisRound = 3;
    betState.lastRaise = 3;
    render(<BettingControls betState={betState} onAction={onAction} />);

    // All-in shows full silver
    expect(screen.getByRole("button", { name: /All-in for 15 silver/i })).toHaveTextContent("15 All-in");
    // Half-Pot: toCall(3) + floor(6/2)=3 = 6
    expect(screen.getByRole("button", { name: /Half-Pot for 6 silver/i })).toHaveTextContent("6 Half-Pot");
    // Raise: toCall(3) + 3*2=6 = 9
    expect(screen.getByRole("button", { name: /Raise for 9 silver/i })).toHaveTextContent("9 Raise");
    // Call: toCall = 3
    expect(screen.getByRole("button", { name: /Call for 3 silver/i })).toHaveTextContent("3 Call");
  });
});
