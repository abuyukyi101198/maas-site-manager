import useDebouncedValue from "./useDebouncedValue";

import { renderHook } from "@/test-utils";

describe("useDebouncedValue", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns debounced value", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: {
        value: "value",
      },
    });

    expect(result.current).toBe("value");

    await rerender({ value: "new-value" });
    await vi.advanceTimersToNextTimer();

    expect(result.current).toBe("new-value");
  });

  it("accepts custom delay", async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: {
        value: "value",
        delay: 5,
      },
    });

    expect(result.current).toBe("value");

    await rerender({ value: "new-value", delay: 5 });
    await vi.advanceTimersByTime(5);

    expect(result.current).toBe("new-value");
  });
});
