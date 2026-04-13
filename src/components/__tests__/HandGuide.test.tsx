import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HandGuide from "../HandGuide";

describe("HandGuide", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <HandGuide open={false} onClose={vi.fn()} />
    );
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("shows hand rankings when open", () => {
    render(<HandGuide open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Hand Rankings")).toBeInTheDocument();
    expect(screen.getByText("Prime Pair")).toBeInTheDocument();
    expect(screen.getByText("Mang Tong")).toBeInTheDocument();
  });

  it("shows special hands section", () => {
    render(<HandGuide open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Special Hands")).toBeInTheDocument();
    expect(screen.getByText("Judge")).toBeInTheDocument();
    expect(screen.getByText("Executor")).toBeInTheDocument();
    expect(screen.getByText("Warden")).toBeInTheDocument();
    expect(screen.getByText("High Warden")).toBeInTheDocument();
  });
});
