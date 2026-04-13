import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayPage from "../play/page";
import { SettingsProvider } from "@/hooks/useSettings";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("Play page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the DUODEGEN header link", () => {
    renderWithSettings(<PlayPage />);
    expect(screen.getByText("DUODEGEN")).toBeInTheDocument();
  });

  it("renders the Rules link", () => {
    renderWithSettings(<PlayPage />);
    expect(screen.getByText("Rules")).toBeInTheDocument();
  });

  it("renders the game board with Start Game", () => {
    renderWithSettings(<PlayPage />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });
});
