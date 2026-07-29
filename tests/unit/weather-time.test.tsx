import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  WeatherTimeCard,
  describeWeatherCode,
} from "@/components/home/WeatherTimeCard";

const weatherResponse = {
  current: {
    time: "2026-07-29T10:30",
    temperature_2m: 21.4,
    apparent_temperature: 22.1,
    relative_humidity_2m: 84,
    weather_code: 2,
    wind_speed_10m: 7.2,
  },
  current_units: {
    temperature_2m: "°C",
    wind_speed_10m: "km/h",
  },
};

describe("WeatherTimeCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T03:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows Trà Linh local time and live weather data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => weatherResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WeatherTimeCard />);
    act(() => vi.advanceTimersByTime(0));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("10:30")).toBeVisible();
    expect(screen.getByText("21°C")).toBeVisible();
    expect(screen.getByText("Có mây")).toBeVisible();
    expect(screen.getByText(/độ ẩm 84%/i)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("latitude=15.035753"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("keeps the clock useful when weather data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<WeatherTimeCard />);
    act(() => vi.advanceTimersByTime(0));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("10:30")).toBeVisible();
    expect(screen.getByText("Chưa có dữ liệu thời tiết")).toBeVisible();
  });

  it("updates the displayed clock every minute", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => weatherResponse }),
    );

    render(<WeatherTimeCard />);
    act(() => vi.advanceTimersByTime(0));
    await act(async () => Promise.resolve());
    expect(screen.getByText("10:30")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText("10:31")).toBeVisible();
  });
});

describe("describeWeatherCode", () => {
  it.each([
    [0, "Trời quang"],
    [2, "Có mây"],
    [45, "Có sương mù"],
    [63, "Mưa vừa"],
    [82, "Mưa rào mạnh"],
    [95, "Dông"],
  ])("maps WMO code %i to %s", (code, description) => {
    expect(describeWeatherCode(code).label).toBe(description);
  });

  it("falls back safely for an unknown WMO code", () => {
    expect(describeWeatherCode(999).label).toBe("Thời tiết thay đổi");
  });
});
