import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StrategyAdvisor from "../StrategyAdvisor";
import { StrategyAdvice } from "@/engine/types";

function baseAdvice(overrides?: Partial<StrategyAdvice>): StrategyAdvice {
  return {
    recommendedAction: "raise",
    confidence: "high",
    headline: "RAISE \u2014 Ali is a strong hand",
    reasons: ["Wins against 80% of possible hands", "Top-tier hand"],
    handStrength: "strong",
    handPercentile: 75,
    opponentThreat: "Shows 5 - weakest start (15% chance of good hand)",
    blockerNote: null,
    potOdds: null,
    bluffViable: false,
    bluffReason: null,
    ...overrides,
  };
}

describe("StrategyAdvisor", () => {
  it("renders the headline", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);
    // Headline appears in both desktop panel and mobile bar
    const headlines = screen.getAllByText("RAISE \u2014 Ali is a strong hand");
    expect(headlines.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the action badge for playerBet phase", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);
    // Desktop panel
    expect(screen.getAllByText("RAISE").length).toBeGreaterThanOrEqual(1);
  });

  it("renders reasons", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);
    expect(screen.getByText("Wins against 80% of possible hands")).toBeInTheDocument();
  });

  it("renders opponent threat", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);
    expect(
      screen.getByText("Shows 5 - weakest start (15% chance of good hand)")
    ).toBeInTheDocument();
  });

  it("shows pot odds when available in action phase", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ potOdds: { needed: 33, favorable: true } })}
        phase="playerBet"
      />
    );
    expect(screen.getByText(/need 33% equity/)).toBeInTheDocument();
  });

  it("hides pot odds in showdown phase", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ potOdds: { needed: 33, favorable: true } })}
        phase="roundEnd"
      />
    );
    expect(screen.queryByText(/need 33% equity/)).not.toBeInTheDocument();
  });

  it("shows bluff note when bluff is viable", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({
          bluffViable: true,
          bluffReason: "Your visible 1 threatens Ali",
        })}
        phase="playerBet"
      />
    );
    expect(screen.getByText("Bluff viable")).toBeInTheDocument();
    expect(screen.getByText("Your visible 1 threatens Ali")).toBeInTheDocument();
  });

  it("does not show action badge in showdown phase", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({
          recommendedAction: "check",
          headline: "WIN \u2014 Ali beat 1 Point",
        })}
        phase="roundEnd"
      />
    );
    // Should not show the action badge
    const badges = screen.queryAllByText("CHECK");
    // Badge should not appear in desktop panel (mobile bar may still show it)
    expect(badges.length).toBe(0);
  });

  it("renders FOLD action with correct styling", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ recommendedAction: "fold" })}
        phase="playerBet"
      />
    );
    expect(screen.getAllByText("FOLD").length).toBeGreaterThanOrEqual(1);
  });

  it("renders CALL action", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ recommendedAction: "call" })}
        phase="playerBet"
      />
    );
    expect(screen.getAllByText("CALL").length).toBeGreaterThanOrEqual(1);
  });

  it("renders CHECK action", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ recommendedAction: "check" })}
        phase="playerBet"
      />
    );
    expect(screen.getAllByText("CHECK").length).toBeGreaterThanOrEqual(1);
  });

  it("renders ALL IN action", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ recommendedAction: "allIn" })}
        phase="playerBet"
      />
    );
    expect(screen.getAllByText("ALL IN").length).toBeGreaterThanOrEqual(1);
  });

  it("shows hand strength bar outside showdown", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);
    expect(screen.getByText("Hand strength")).toBeInTheDocument();
  });

  it("hides hand strength bar in showdown", () => {
    render(<StrategyAdvisor advice={baseAdvice()} phase="roundEnd" />);
    expect(screen.queryByText("Hand strength")).not.toBeInTheDocument();
  });

  it("can collapse and expand the desktop panel", async () => {
    const user = userEvent.setup();
    render(<StrategyAdvisor advice={baseAdvice()} phase="playerBet" />);

    // Initially headline visible in desktop panel (2 total: desktop + mobile)
    const initialHeadlines = screen.getAllByText("RAISE \u2014 Ali is a strong hand");
    expect(initialHeadlines.length).toBe(2);

    // Click collapse button (the minus sign)
    await user.click(screen.getByText("\u2212"));

    // Only mobile headline should remain
    const collapsedHeadlines = screen.getAllByText("RAISE \u2014 Ali is a strong hand");
    expect(collapsedHeadlines.length).toBe(1);

    // Click expand
    await user.click(screen.getByText("+"));

    // Both headlines visible again
    const expandedHeadlines = screen.getAllByText("RAISE \u2014 Ali is a strong hand");
    expect(expandedHeadlines.length).toBe(2);
  });

  it("renders confidence levels", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ confidence: "moderate" })}
        phase="playerBet"
      />
    );
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  it("renders low confidence", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ confidence: "low" })}
        phase="playerBet"
      />
    );
    expect(screen.getByText("Low confidence")).toBeInTheDocument();
  });

  it("shows unfavorable pot odds styling", () => {
    render(
      <StrategyAdvisor
        advice={baseAdvice({ potOdds: { needed: 71, favorable: false } })}
        phase="playerBet"
      />
    );
    expect(screen.getByText(/unfavorable/)).toBeInTheDocument();
  });
});
