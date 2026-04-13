import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("renders the DUODEGEN title", () => {
    render(<Home />);
    expect(screen.getByText("DUODEGEN")).toBeInTheDocument();
  });

  it("renders Play and Rules links", () => {
    render(<Home />);
    expect(screen.getByText("Play Duo")).toBeInTheDocument();
    expect(screen.getByText("Rules")).toBeInTheDocument();
  });

  it("shows the Crimson Desert subtitle", () => {
    render(<Home />);
    expect(screen.getByText("A Crimson Desert Card Game")).toBeInTheDocument();
  });
});
