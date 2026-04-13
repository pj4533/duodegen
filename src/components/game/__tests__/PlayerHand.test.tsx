import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerHand from "../PlayerHand";
import { HandRank } from "@/engine/types";
import { SettingsProvider } from "@/hooks/useSettings";

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("PlayerHand", () => {
  it("renders two sticks when hand is provided", () => {
    renderWithSettings(
      <PlayerHand
        hand={[
          { number: 5, color: "red" },
          { number: 7, color: "yellow" },
        ]}
      />
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders empty placeholders when no hand", () => {
    renderWithSettings(<PlayerHand hand={null} />);
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
  });

  it("shows hand result when showResult is true", () => {
    renderWithSettings(
      <PlayerHand
        hand={[
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ]}
        handResult={{ rank: HandRank.Ali, name: "One-Two", special: null }}
        showResult={true}
      />
    );
    expect(screen.getByText("One-Two")).toBeInTheDocument();
  });

  it("shows 'Your Hand' label", () => {
    renderWithSettings(<PlayerHand hand={null} />);
    expect(screen.getByText("Your Hand")).toBeInTheDocument();
  });
});
