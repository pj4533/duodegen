import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "../SettingsModal";
import { SettingsProvider } from "@/hooks/useSettings";

function renderWithSettings(ui: React.ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe("SettingsModal", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithSettings(
      <SettingsModal open={false} onClose={vi.fn()} />
    );
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("shows settings when open", () => {
    renderWithSettings(<SettingsModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Learning Mode")).toBeInTheDocument();
    expect(screen.getByText("Hand Names")).toBeInTheDocument();
  });

  it("shows learning mode description", () => {
    renderWithSettings(<SettingsModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/disables the 10-second timer/)).toBeInTheDocument();
  });

  it("shows both name style options", () => {
    renderWithSettings(<SettingsModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Crimson Desert")).toBeInTheDocument();
    expect(screen.getByText("Traditional Seotda")).toBeInTheDocument();
  });

  it("toggles learning mode", async () => {
    const user = userEvent.setup();
    renderWithSettings(<SettingsModal open={true} onClose={vi.fn()} />);

    const toggle = screen.getByRole("switch", { hidden: true });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("switches to traditional names", async () => {
    const user = userEvent.setup();
    renderWithSettings(<SettingsModal open={true} onClose={vi.fn()} />);

    const traditionalRadio = screen.getByDisplayValue("traditional") as HTMLInputElement;
    await user.click(traditionalRadio);
    expect(traditionalRadio.checked).toBe(true);
  });
});
