import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stick, { StickBack } from "../Stick";

describe("Stick", () => {
  it("renders the number", () => {
    render(<Stick stick={{ number: 7, color: "red" }} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows R label for red sticks", () => {
    render(<Stick stick={{ number: 3, color: "red" }} />);
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("shows Y label for yellow sticks", () => {
    render(<Stick stick={{ number: 5, color: "yellow" }} />);
    expect(screen.getByText("Y")).toBeInTheDocument();
  });

  it("renders StickBack when not revealed", () => {
    render(<Stick stick={{ number: 5, color: "red" }} revealed={false} />);
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });
});

describe("StickBack", () => {
  it("renders without crashing", () => {
    const { container } = render(<StickBack />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
