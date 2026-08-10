"use client";

import { CloudRain, CloudSun, Droplets, RefreshCw, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  buildWeatherForecastUrl,
  describeWeatherCode,
  parseWeatherForecast,
  type WeatherForecast,
} from "@/lib/weather-forecast";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function WeatherForecastPanel() {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const loadForecast = useCallback(async () => {
    setStatus("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(buildWeatherForecastUrl(7), {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Weather request failed");
      setForecast(parseWeatherForecast(await response.json()));
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadForecast(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadForecast]);

  if (status === "loading" && !forecast) {
    return (
      <div role="status" className="rounded-3xl border border-[#10251A]/10 bg-white p-8 text-[#405347]">
        Đang tải dự báo 7 ngày…
      </div>
    );
  }

  if (status === "error" && !forecast) {
    return (
      <div role="alert" className="rounded-3xl border border-[#8B4A38]/25 bg-white p-8">
        <p className="font-semibold text-[#6F392C]">Chưa thể tải dữ liệu thời tiết.</p>
        <p className="mt-2 text-sm leading-6 text-[#405347]">Hãy thử lại hoặc xác nhận điều kiện với đầu mối địa phương trước khi khởi hành.</p>
        <button type="button" onClick={() => void loadForecast()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#29452C] px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]">
          <RefreshCw aria-hidden="true" className="size-4" /> Thử lại
        </button>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <section aria-labelledby="seven-day-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5E7F3B]">Trung tâm xã Trà Linh</p>
          <h2 id="seven-day-heading" className="mt-2 font-serif text-3xl text-[#10251A]">Dự báo 7 ngày</h2>
        </div>
        <button type="button" onClick={() => void loadForecast()} disabled={status === "loading"} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/25 px-4 text-sm font-semibold text-[#29452C] disabled:opacity-60">
          <RefreshCw aria-hidden="true" className={`size-4 ${status === "loading" ? "animate-spin" : ""}`} /> Cập nhật
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {forecast.days.map((day) => {
          const description = describeWeatherCode(day.weatherCode);
          const Icon = description.icon === "clear" ? Sun : description.icon === "rain" || description.icon === "storm" ? CloudRain : CloudSun;
          return (
            <article key={day.date} className="rounded-2xl border border-[#10251A]/10 bg-white p-5 shadow-sm">
              <time dateTime={day.date} className="text-sm font-semibold capitalize text-[#405347]">
                {dateFormatter.format(new Date(`${day.date}T12:00:00+07:00`))}
              </time>
              <Icon aria-hidden="true" className="mt-5 size-8 text-[#5E7F3B]" />
              <p className="mt-3 text-sm font-medium text-[#10251A]">{description.label}</p>
              <p className="mt-3 text-lg font-semibold tabular-nums text-[#10251A]">{Math.round(day.temperatureMax)}° <span className="text-sm font-normal text-[#536258]">/ {Math.round(day.temperatureMin)}°</span></p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#536258]"><Droplets aria-hidden="true" className="size-3.5" /> Mưa {Math.round(day.precipitationProbability)}%</p>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-sm leading-6 text-[#405347]">
        Cập nhật lúc <time dateTime={forecast.updatedAt}>{forecast.updatedAt.replace("T", " ")}</time> · Dữ liệu Open-Meteo chỉ mang tính tham khảo; thời tiết vùng cao có thể thay đổi nhanh.
      </p>
    </section>
  );
}
