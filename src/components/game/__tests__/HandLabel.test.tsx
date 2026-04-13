import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HandLabel from "../HandLabel";
import { HandRank } from "@/engine/types";
import { SettingsProvider } from "@/hooks/useSettings";

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("HandLabel", () => {
  it("displays the hand name", () => {
    renderWithSettings(
      <HandLabel
        result={{ rank: HandRank.Ali, name: "Ali", special: null }}
      />
    );
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });

  it("displays special hand with standard name", () => {
    renderWithSettings(
      <HandLabel
        result={{ rank: HandRank.MangTong, name: "Mang Tong", special: "judge" }}
      />
    );
    expect(screen.getByText("Judge (Mang Tong)")).toBeInTheDocument();
  });

  it("applies winner styling when isWinner", () => {
    const { container } = renderWithSettings(
      <HandLabel
        result={{ rank: HandRank.Ali, name: "Ali", special: null }}
        isWinner={true}
      />
    );
    expect(container.querySelector("[class*='bg-gold-dark']")).toBeTruthy();
  });
});
