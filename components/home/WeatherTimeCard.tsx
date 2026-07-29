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

const TRA_LINH_LATITUDE = 15.035753;
const TRA_LINH_LONGITUDE = 108.019359;
const TRA_LINH_TIMEZONE = "Asia/Ho_Chi_Minh";
const WEATHER_REFRESH_INTERVAL = 15 * 60 * 1_000;

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${TRA_LINH_LATITUDE}` +
  `&longitude=${TRA_LINH_LONGITUDE}` +
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
  `&timezone=${encodeURIComponent(TRA_LINH_TIMEZONE)}` +
  "&forecast_days=1";

type WeatherIconName =
  | "clear"
  | "partly-cloudy"
  | "fog"
  | "rain"
  | "storm";

type WeatherDescription = {
  label: string;
  icon: WeatherIconName;
};

type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

const weatherIcons: Record<WeatherIconName, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  fog: CloudFog,
  rain: CloudRain,
  storm: CloudLightning,
};

export function describeWeatherCode(code: number): WeatherDescription {
  if (code === 0) return { label: "Trời quang", icon: "clear" };
  if (code === 1) return { label: "Ít mây", icon: "partly-cloudy" };
  if (code === 2) return { label: "Có mây", icon: "partly-cloudy" };
  if (code === 3) return { label: "Nhiều mây", icon: "partly-cloudy" };
  if (code === 45 || code === 48) {
    return { label: "Có sương mù", icon: "fog" };
  }
  if ([51, 53, 55, 56, 57, 61].includes(code)) {
    return { label: "Mưa nhẹ", icon: "rain" };
  }
  if ([63, 66].includes(code)) {
    return { label: "Mưa vừa", icon: "rain" };
  }
  if ([65, 67, 80, 81].includes(code)) {
    return { label: "Mưa to", icon: "rain" };
  }
  if (code === 82) return { label: "Mưa rào mạnh", icon: "rain" };
  if ([95, 96, 99].includes(code)) return { label: "Dông", icon: "storm" };
  return { label: "Thời tiết thay đổi", icon: "partly-cloudy" };
}

function parseWeatherResponse(data: OpenMeteoResponse): CurrentWeather {
  const current = data.current;
  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.apparent_temperature !== "number" ||
    typeof current.relative_humidity_2m !== "number" ||
    typeof current.weather_code !== "number" ||
    typeof current.wind_speed_10m !== "number"
  ) {
    throw new Error("Invalid weather response");
  }

  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
  };
}

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
        const data = (await response.json()) as OpenMeteoResponse;
        setWeather(parseWeatherResponse(data));
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
          <p className="mt-1 text-[0.68rem] capitalize text-[#EEF1E9]/58">
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
              <p className="mt-3 flex flex-col gap-1.5 text-xs text-[#EEF1E9]/58">
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

      <p className="mt-5 border-t border-white/15 pt-4 text-[0.66rem] text-[#EEF1E9]/48">
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
