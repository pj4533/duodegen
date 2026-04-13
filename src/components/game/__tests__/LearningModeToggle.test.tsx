import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LearningModeToggle from "../LearningModeToggle";

describe("LearningModeToggle", () => {
  it("renders with off state", () => {
    render(<LearningModeToggle enabled={false} onToggle={() => {}} />);
    expect(screen.getByLabelText("Learning mode off")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
  });

  it("renders with on state", () => {
    render(<LearningModeToggle enabled={true} onToggle={() => {}} />);
    expect(screen.getByLabelText("Learning mode on")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<LearningModeToggle enabled={false} onToggle={onToggle} />);

    await user.click(screen.getByText("Learn"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
