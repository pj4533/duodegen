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
    expect(screen.getByText("Check")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Half Raise")).toBeInTheDocument();
    expect(screen.getByText("Double Raise")).toBeInTheDocument();
    expect(screen.getByText("All In")).toBeInTheDocument();
    expect(screen.getByText("Fold")).toBeInTheDocument();
  });

  it("disables unavailable actions", () => {
    const onAction = vi.fn();
    const betState = createInitialBetState(15, 15);
    render(<BettingControls betState={betState} onAction={onAction} />);

    // Call should be disabled (no bet to call)
    expect(screen.getByText("Call")).toBeDisabled();
    // Fold should be disabled (no bet to fold against)
    expect(screen.getByText("Fold")).toBeDisabled();
    // Check should be enabled
    expect(screen.getByText("Check")).not.toBeDisabled();
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

    await user.click(screen.getByText("Check"));
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
});
