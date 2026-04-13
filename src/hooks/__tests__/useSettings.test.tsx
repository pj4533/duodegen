import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SettingsProvider, useSettings } from "../useSettings";

function wrapper({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe("useSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with default settings", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.learningMode).toBe(false);
    expect(result.current.handNameStyle).toBe("crimsonDesert");
  });

  it("updates learning mode", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ learningMode: true });
    });
    expect(result.current.learningMode).toBe(true);
    expect(JSON.parse(localStorage.getItem("duodegen-settings")!).learningMode).toBe(true);
  });

  it("updates hand name style", () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ handNameStyle: "traditional" });
    });
    expect(result.current.handNameStyle).toBe("traditional");
  });

  it("hydrates from localStorage", () => {
    localStorage.setItem(
      "duodegen-settings",
      JSON.stringify({ learningMode: true, handNameStyle: "traditional" })
    );
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.learningMode).toBe(true);
    expect(result.current.handNameStyle).toBe("traditional");
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("duodegen-settings", "not-json");
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.learningMode).toBe(false);
    expect(result.current.handNameStyle).toBe("crimsonDesert");
  });
});
