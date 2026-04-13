import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerHand from "../PlayerHand";
import { HandRank } from "@/engine/types";

describe("PlayerHand", () => {
  it("renders two sticks when hand is provided", () => {
    render(
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
    render(<PlayerHand hand={null} />);
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
  });

  it("shows hand result when showResult is true", () => {
    render(
      <PlayerHand
        hand={[
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ]}
        handResult={{ rank: HandRank.Ali, name: "Ali", special: null }}
        showResult={true}
      />
    );
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });

  it("shows 'Your Hand' label", () => {
    render(<PlayerHand hand={null} />);
    expect(screen.getByText("Your Hand")).toBeInTheDocument();
  });
});
