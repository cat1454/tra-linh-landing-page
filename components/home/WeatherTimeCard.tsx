"use client";

import {
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  TRA_LINH_TIMEZONE,
  buildWeatherForecastUrl,
  describeWeatherCode,
  parseCurrentWeather,
  type CurrentWeather,
  type WeatherIconName,
} from "@/lib/weather-forecast";

const WEATHER_REFRESH_INTERVAL = 15 * 60 * 1_000;
const WEATHER_URL = buildWeatherForecastUrl(1);

const weatherIcons: Record<WeatherIconName, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  fog: CloudFog,
  rain: CloudRain,
  storm: CloudLightning,
};

export { describeWeatherCode } from "@/lib/weather-forecast";

function formatTraLinhTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TRA_LINH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatTraLinhDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TRA_LINH_TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function WeatherTimeCard() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    const initialClock = window.setTimeout(updateClock, 0);
    const clock = window.setInterval(updateClock, 60_000);
    return () => {
      window.clearTimeout(initialClock);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch(WEATHER_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Weather request failed");
        const data: unknown = await response.json();
        setWeather(parseCurrentWeather(data));
        setWeatherUnavailable(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setWeatherUnavailable(true);
        }
      }
    }

    void loadWeather();
    const refresh = window.setInterval(
      () => void loadWeather(),
      WEATHER_REFRESH_INTERVAL,
    );

    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, []);

  const description = useMemo(
    () => (weather ? describeWeatherCode(weather.weatherCode) : null),
    [weather],
  );
  const WeatherIcon = description ? weatherIcons[description.icon] : CloudSun;

  return (
    <section
      aria-label="Thời gian và thời tiết tại Trà Linh"
      className="w-full overflow-hidden rounded-[24px] border border-white/15 bg-[#1B352A]/78 p-5 text-[#F1F1E8] shadow-2xl backdrop-blur-xl sm:p-6 lg:max-w-none"
    >
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#D5A84E]">
            <Clock3 aria-hidden="true" size={13} strokeWidth={1.8} />
            Giờ Trà Linh
          </p>
          <time
            className="mt-2 block font-serif text-4xl tabular-nums leading-none"
            dateTime={now?.toISOString()}
          >
            {now ? formatTraLinhTime(now) : "--:--"}
          </time>
          <p className="mt-1 text-[0.68rem] capitalize text-[#D7E0D2]">
            {now ? formatTraLinhDate(now) : "Múi giờ Việt Nam"}
          </p>
        </div>

        <div
          className="h-14 w-px shrink-0 bg-white/12"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1" aria-live="polite">
          {weather ? (
            <>
              <div className="flex items-center gap-3">
                <WeatherIcon
                  aria-hidden="true"
                  className="shrink-0 text-[#9AC45C]"
                  size={31}
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {Math.round(weather.temperature)}°C
                  </p>
                  <p className="truncate text-xs text-[#EEF1E9]/72">
                    {description?.label}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex flex-col gap-1.5 text-xs text-[#D7E0D2]">
                <span className="inline-flex items-center gap-1">
                  <Droplets aria-hidden="true" size={11} />
                  Độ ẩm {Math.round(weather.humidity)}%
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wind aria-hidden="true" size={11} />
                  {Math.round(weather.windSpeed)} km/h
                </span>
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <WeatherIcon
                aria-hidden="true"
                className="shrink-0 text-[#9AC45C]"
                size={31}
                strokeWidth={1.5}
              />
              <p className="text-xs leading-5 text-[#EEF1E9]/65">
                {weatherUnavailable
                  ? "Chưa có dữ liệu thời tiết"
                  : "Đang cập nhật thời tiết…"}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 border-t border-white/15 pt-4 text-[0.66rem] text-[#D7E0D2]">
        Dữ liệu dự báo tại trung tâm xã ·{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-[#EEF1E9]/70"
        >
          Open-Meteo
        </a>
      </p>
    </section>
  );
}

export default WeatherTimeCard;
