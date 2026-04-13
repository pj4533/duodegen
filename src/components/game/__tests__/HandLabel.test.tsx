import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HandLabel from "../HandLabel";
import { HandRank } from "@/engine/types";

describe("HandLabel", () => {
  it("displays the hand name", () => {
    render(
      <HandLabel
        result={{ rank: HandRank.Ali, name: "Ali", special: null }}
      />
    );
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });

  it("displays special hand with standard name", () => {
    render(
      <HandLabel
        result={{ rank: HandRank.MangTong, name: "Mang Tong", special: "judge" }}
      />
    );
    expect(screen.getByText("Judge (Mang Tong)")).toBeInTheDocument();
  });

  it("applies winner styling when isWinner", () => {
    const { container } = render(
      <HandLabel
        result={{ rank: HandRank.Ali, name: "Ali", special: null }}
        isWinner={true}
      />
    );
    expect(container.firstChild).toHaveClass("bg-gold-dark/30");
  });
});
