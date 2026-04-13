import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OpponentHand from "../OpponentHand";
import { HandRank } from "@/engine/types";

describe("OpponentHand", () => {
  it("shows one card and hides the other", () => {
    render(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={0}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("9")).not.toBeInTheDocument();
  });

  it("reveals second card when revealedIndex is 1", () => {
    render(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={1}
      />
    );
    expect(screen.queryByText("3")).not.toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("shows all cards when showAll is true", () => {
    render(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={0}
        showAll={true}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("shows face-down sticks when no hand", () => {
    const { container } = render(
      <OpponentHand hand={null} revealedIndex={0} />
    );
    expect(container.querySelectorAll("div")).toBeTruthy();
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
  });

  it("shows hand result when showResult is true", () => {
    render(
      <OpponentHand
        hand={[
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ]}
        revealedIndex={0}
        showAll={true}
        handResult={{ rank: HandRank.Ali, name: "Ali", special: null }}
        showResult={true}
      />
    );
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });
});
