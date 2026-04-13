import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayPage from "../play/page";

describe("Play page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the DUO header link", () => {
    render(<PlayPage />);
    expect(screen.getByText("DUO")).toBeInTheDocument();
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
