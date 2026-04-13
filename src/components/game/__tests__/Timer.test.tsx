import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Timer from "../Timer";

describe("Timer", () => {
  it("renders nothing when not active", () => {
    const { container } = render(<Timer secondsLeft={10} active={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows seconds remaining when active", () => {
    render(<Timer secondsLeft={7} active={true} />);
    expect(screen.getByText("7s")).toBeInTheDocument();
  });

  it("has timer role with aria label", () => {
    render(<Timer secondsLeft={5} active={true} />);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveAttribute("aria-label", "5 seconds remaining");
  });

  it("shows low time warning at 3 seconds or less", () => {
    const { rerender } = render(<Timer secondsLeft={4} active={true} />);
    // At 4 seconds, should show gold color (not low)
    expect(screen.getByText("4s")).not.toHaveClass("text-crimson-400");

    rerender(<Timer secondsLeft={3} active={true} />);
    // At 3 seconds, should show crimson color (low)
    expect(screen.getByText("3s")).toHaveClass("text-crimson-400");
  });
});
