import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TravelGuideSection } from "@/components/home/TravelGuideSection";
import { JourneyTripPlanner } from "@/components/detail/JourneyTripPlanner";
import { Footer } from "@/components/layout/Footer";
import { SaveShareActions } from "@/components/ui/SaveShareActions";
import { fallbackGuides, fallbackJourneys } from "@/lib/content/fallback-content";
import { searchSiteContent } from "@/lib/search-index";
import { FACEBOOK_PAGE_URL } from "@/lib/site-links";
import {
  buildWeatherForecastUrl,
  parseWeatherForecast,
} from "@/lib/weather-forecast";

const forecastResponse = {
  current: {
    time: "2026-08-10T10:00",
    temperature_2m: 19,
    apparent_temperature: 19,
    relative_humidity_2m: 80,
    weather_code: 2,
    wind_speed_10m: 6,
  },
  daily: {
    time: Array.from({ length: 7 }, (_, index) => `2026-08-${10 + index}`),
    weather_code: [2, 3, 61, 63, 0, 45, 80],
    temperature_2m_max: [22, 21, 20, 20, 23, 19, 18],
    temperature_2m_min: [15, 15, 14, 14, 16, 13, 13],
    precipitation_probability_max: [20, 30, 70, 80, 10, 40, 85],
  },
};

describe("10,000-user feedback roadmap capabilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("builds and parses a complete seven-day Open-Meteo forecast", () => {
    const url = buildWeatherForecastUrl(7);
    expect(url).toContain("forecast_days=7");
    expect(url).toContain("daily=weather_code");

    const forecast = parseWeatherForecast(forecastResponse);
    expect(forecast.days).toHaveLength(7);
    expect(forecast.days[0]).toMatchObject({
      date: "2026-08-10",
      temperatureMax: 22,
      temperatureMin: 15,
    });
    expect(forecast.updatedAt).toBe("2026-08-10T10:00");
  });

  it("rejects incomplete forecast payloads instead of displaying invented values", () => {
    expect(() => parseWeatherForecast({ daily: { time: [] } })).toThrow(
      /invalid weather response/i,
    );
  });

  it("links the guide CTA to the internal forecast page", () => {
    render(<TravelGuideSection guides={fallbackGuides} />);
    expect(screen.getByRole("link", { name: /theo dõi thời tiết/i })).toHaveAttribute(
      "href",
      "/thoi-tiet",
    );
  });

  it("shows the three official contact channels without collecting personal data", () => {
    render(<Footer facebookUrl={FACEBOOK_PAGE_URL} />);
    expect(screen.getByRole("link", { name: /fanpage/i })).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com"),
    );
    expect(screen.getByRole("link", { name: /gọi 037\.667\.1456/i })).toHaveAttribute(
      "href",
      "tel:0376671456",
    );
    expect(screen.getByRole("link", { name: /gửi email tralinh\.namtramy@danang\.gov\.vn/i })).toHaveAttribute(
      "href",
      "mailto:tralinh.namtramy@danang.gov.vn",
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders verified trip facts and a printable itinerary", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<JourneyTripPlanner journey={fallbackJourneys[0]} />);

    expect(screen.getByText("Thông tin chuyến đi")).toBeVisible();
    expect(screen.getByText(fallbackJourneys[0].difficultyLabel)).toBeVisible();
    expect(screen.getByText(fallbackJourneys[0].bestSeasonLabel)).toBeVisible();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
    fireEvent.click(screen.getByRole("button", { name: /in hoặc lưu pdf/i }));
    expect(print).toHaveBeenCalledOnce();
  });

  it("saves a detail locally and falls back to copying its share URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <SaveShareActions
        item={{ id: "journey:test", title: "Hành trình thử", url: "/hanh-trinh/test" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /lưu hành trình/i }));
    expect(window.localStorage.getItem("tra-linh:saved-items")).toContain("journey:test");
    fireEvent.click(screen.getByRole("button", { name: /chia sẻ/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/hanh-trinh/test"));
    expect(await screen.findByText(/đã sao chép liên kết/i)).toBeVisible();
  });

  it("finds static public content with accent-insensitive search", () => {
    const results = searchSiteContent("thoi tiet");
    expect(results.some((result) => result.href === "/thoi-tiet")).toBe(true);
  });
});
