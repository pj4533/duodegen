import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RulesPage from "../rules/page";

describe("Rules page", () => {
  it("renders the title", () => {
    render(<RulesPage />);
    expect(screen.getByText("Rules of Duo")).toBeInTheDocument();
  });

  it("shows hand ranking section", () => {
    render(<RulesPage />);
    expect(screen.getByText("Hand Rankings")).toBeInTheDocument();
    expect(screen.getByText("Prime Pair")).toBeInTheDocument();
    expect(screen.getByText("Mang Tong")).toBeInTheDocument();
  });

  it("shows special hands section", () => {
    render(<RulesPage />);
    expect(screen.getByText("Special Hands")).toBeInTheDocument();
    expect(screen.getByText("Judge")).toBeInTheDocument();
    expect(screen.getByText("Executor")).toBeInTheDocument();
  });

  it("shows betting actions", () => {
    render(<RulesPage />);
    expect(screen.getByText("Check")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Fold")).toBeInTheDocument();
  });

  it("shows rematch rules", () => {
    render(<RulesPage />);
    expect(screen.getByText("Rematch Rules")).toBeInTheDocument();
  });
});
