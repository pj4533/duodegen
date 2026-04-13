import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "../useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at TIMER_DURATION_SECONDS when active", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(true, onExpire));
    expect(result.current.secondsLeft).toBe(10);
  });

  it("counts down over time", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(true, onExpire));

    act(() => {
      vi.advanceTimersByTime(1200); // interval fires at 200ms intervals
    });
    expect(result.current.secondsLeft).toBe(9);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(8);
  });

  it("calls onExpire when timer reaches 0", () => {
    const onExpire = vi.fn();
    renderHook(() => useTimer(true, onExpire));

    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("returns TIMER_DURATION_SECONDS when inactive", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(false, onExpire));
    expect(result.current.secondsLeft).toBe(10);
  });

  it("does not call onExpire when inactive", () => {
    const onExpire = vi.fn();
    renderHook(() => useTimer(false, onExpire));

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("resets when active changes to false", () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(
      ({ active }) => useTimer(active, onExpire),
      { initialProps: { active: true } }
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBeLessThanOrEqual(8);

    rerender({ active: false });
    expect(result.current.secondsLeft).toBe(10);
  });
});
