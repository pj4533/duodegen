import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayPage from "../play/page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("Play page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the DUODEGEN header link", () => {
    render(<PlayPage />);
    expect(screen.getByText("DUODEGEN")).toBeInTheDocument();
  });

  it("renders the Rules link", () => {
    render(<PlayPage />);
    expect(screen.getByText("Rules")).toBeInTheDocument();
  });

  it("renders the game board with Start Game", () => {
    render(<PlayPage />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });
});
