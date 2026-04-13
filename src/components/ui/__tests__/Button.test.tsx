import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it("applies variant styles", () => {
    const { container: c1 } = render(<Button variant="danger">Danger</Button>);
    expect(c1.firstChild).toHaveClass("bg-crimson-900");

    const { container: c2 } = render(<Button variant="secondary">Secondary</Button>);
    expect(c2.firstChild).toHaveClass("bg-crimson-950");
  });

  it("applies size styles", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass("px-3");
  });
});
