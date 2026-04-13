import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OpponentHand from "../OpponentHand";
import { HandRank } from "@/engine/types";
import { SettingsProvider } from "@/hooks/useSettings";

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("OpponentHand", () => {
  it("shows one card and hides the other", () => {
    renderWithSettings(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={0}
      />
    );
    expect(screen.getByRole("img", { name: /red 3/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /yellow 9/i })).not.toBeInTheDocument();
  });

  it("reveals second card when revealedIndex is 1", () => {
    renderWithSettings(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={1}
      />
    );
    expect(screen.queryByRole("img", { name: /red 3/i })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /yellow 9/i })).toBeInTheDocument();
  });

  it("shows all cards when showAll is true", () => {
    renderWithSettings(
      <OpponentHand
        hand={[
          { number: 3, color: "red" },
          { number: 9, color: "yellow" },
        ]}
        revealedIndex={0}
        showAll={true}
      />
    );
    expect(screen.getByRole("img", { name: /red 3/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /yellow 9/i })).toBeInTheDocument();
  });

  it("shows face-down sticks when no hand", () => {
    const { container } = renderWithSettings(
      <OpponentHand hand={null} revealedIndex={0} />
    );
    expect(container.querySelectorAll("div")).toBeTruthy();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows hand result when showResult is true", () => {
    renderWithSettings(
      <OpponentHand
        hand={[
          { number: 1, color: "red" },
          { number: 2, color: "yellow" },
        ]}
        revealedIndex={0}
        showAll={true}
        handResult={{ rank: HandRank.Ali, name: "One-Two", special: null }}
        showResult={true}
      />
    );
    expect(screen.getByText("One-Two")).toBeInTheDocument();
  });
});
