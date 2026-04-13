import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PotDisplay from "../PotDisplay";

describe("PotDisplay", () => {
  it("displays pot amount", () => {
    render(<PotDisplay pot={10} playerSilver={15} aiSilver={15} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("displays player silver", () => {
    render(<PotDisplay pot={0} playerSilver={12} aiSilver={15} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("displays AI silver", () => {
    render(<PotDisplay pot={0} playerSilver={15} aiSilver={8} />);
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("shows labels", () => {
    render(<PotDisplay pot={0} playerSilver={15} aiSilver={15} />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Opponent")).toBeInTheDocument();
    expect(screen.getByText("Pot")).toBeInTheDocument();
  });
});
