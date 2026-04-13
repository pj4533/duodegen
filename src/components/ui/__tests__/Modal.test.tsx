import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../Modal";

describe("Modal", () => {
  it("renders nothing when not open", () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("renders content when open", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Test content</p>
      </Modal>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    );
    await user.click(screen.getByText("\u00D7"));
    expect(onClose).toHaveBeenCalled();
  });
});
