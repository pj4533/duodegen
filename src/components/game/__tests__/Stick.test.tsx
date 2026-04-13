import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stick, { StickBack } from "../Stick";

describe("Stick", () => {
  it("renders with accessible label for the number and color", () => {
    render(<Stick stick={{ number: 7, color: "red" }} />);
    expect(screen.getByRole("img", { name: /red 7/i })).toBeInTheDocument();
  });

  it("renders red stick with correct label", () => {
    render(<Stick stick={{ number: 3, color: "red" }} />);
    expect(screen.getByRole("img", { name: /red 3/i })).toBeInTheDocument();
  });

  it("renders yellow stick with correct label", () => {
    render(<Stick stick={{ number: 5, color: "yellow" }} />);
    expect(screen.getByRole("img", { name: /yellow 5/i })).toBeInTheDocument();
  });

  it("renders StickBack when not revealed", () => {
    render(<Stick stick={{ number: 5, color: "red" }} revealed={false} />);
    expect(screen.queryByRole("img", { name: /red 5/i })).not.toBeInTheDocument();
  });

  it("renders number 10 (two crossed groups)", () => {
    render(<Stick stick={{ number: 10, color: "red" }} />);
    expect(screen.getByRole("img", { name: /red 10/i })).toBeInTheDocument();
  });

  it("renders numbers 6-9 (crossed group + remainder)", () => {
    render(<Stick stick={{ number: 6, color: "yellow" }} />);
    expect(screen.getByRole("img", { name: /yellow 6/i })).toBeInTheDocument();
  });

  it("renders highlighted state", () => {
    render(<Stick stick={{ number: 3, color: "red" }} highlighted={true} />);
    expect(screen.getByRole("img", { name: /red 3/i })).toBeInTheDocument();
  });

  it("renders small size", () => {
    render(<Stick stick={{ number: 5, color: "yellow" }} size="sm" />);
    expect(screen.getByRole("img", { name: /yellow 5/i })).toBeInTheDocument();
  });
});

describe("StickBack", () => {
  it("renders without crashing", () => {
    const { container } = render(<StickBack />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders small size", () => {
    const { container } = render(<StickBack size="sm" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
