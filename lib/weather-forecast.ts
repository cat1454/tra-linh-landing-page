export const TRA_LINH_LATITUDE = 15.035753;
export const TRA_LINH_LONGITUDE = 108.019359;
export const TRA_LINH_TIMEZONE = "Asia/Ho_Chi_Minh";

export type WeatherIconName =
  | "clear"
  | "partly-cloudy"
  | "fog"
  | "rain"
  | "storm";

export interface WeatherDescription {
  label: string;
  icon: WeatherIconName;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
}

export interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
}

export interface WeatherForecast {
  updatedAt: string;
  current: CurrentWeather;
  days: WeatherForecastDay[];
}

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: unknown;
    weather_code?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
    precipitation_probability_max?: unknown;
  };
};

export function describeWeatherCode(code: number): WeatherDescription {
  if (code === 0) return { label: "Trời quang", icon: "clear" };
  if (code === 1) return { label: "Ít mây", icon: "partly-cloudy" };
  if (code === 2) return { label: "Có mây", icon: "partly-cloudy" };
  if (code === 3) return { label: "Nhiều mây", icon: "partly-cloudy" };
  if (code === 45 || code === 48) return { label: "Có sương mù", icon: "fog" };
  if ([51, 53, 55, 56, 57, 61].includes(code)) return { label: "Mưa nhẹ", icon: "rain" };
  if ([63, 66].includes(code)) return { label: "Mưa vừa", icon: "rain" };
  if ([65, 67, 80, 81].includes(code)) return { label: "Mưa to", icon: "rain" };
  if (code === 82) return { label: "Mưa rào mạnh", icon: "rain" };
  if ([95, 96, 99].includes(code)) return { label: "Dông", icon: "storm" };
  return { label: "Thời tiết thay đổi", icon: "partly-cloudy" };
}

export function buildWeatherForecastUrl(forecastDays = 7): string {
  const days = Math.min(16, Math.max(1, Math.trunc(forecastDays)));
  const params = new URLSearchParams({
    latitude: String(TRA_LINH_LATITUDE),
    longitude: String(TRA_LINH_LONGITUDE),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: TRA_LINH_TIMEZONE,
    forecast_days: String(days),
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function currentFromResponse(data: OpenMeteoResponse): CurrentWeather {
  const current = data.current;
  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.apparent_temperature !== "number" ||
    typeof current.relative_humidity_2m !== "number" ||
    typeof current.weather_code !== "number" ||
    typeof current.wind_speed_10m !== "number"
  ) {
    throw new Error("Invalid weather response: current conditions are incomplete");
  }
  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
  };
}

export function parseCurrentWeather(data: unknown): CurrentWeather {
  return currentFromResponse(data as OpenMeteoResponse);
}

export function parseWeatherForecast(data: unknown): WeatherForecast {
  const response = data as OpenMeteoResponse;
  const daily = response.daily;
  const dates = daily?.time;
  const codes = daily?.weather_code;
  const maximums = daily?.temperature_2m_max;
  const minimums = daily?.temperature_2m_min;
  const precipitation = daily?.precipitation_probability_max;

  if (
    !response.current?.time ||
    !Array.isArray(dates) ||
    !Array.isArray(codes) ||
    !Array.isArray(maximums) ||
    !Array.isArray(minimums) ||
    !Array.isArray(precipitation) ||
    dates.length < 1 ||
    ![codes, maximums, minimums, precipitation].every((items) => items.length === dates.length)
  ) {
    throw new Error("Invalid weather response: daily forecast is incomplete");
  }

  const days = dates.map((date, index) => {
    const values = [codes[index], maximums[index], minimums[index], precipitation[index]];
    if (typeof date !== "string" || values.some((value) => typeof value !== "number")) {
      throw new Error("Invalid weather response: daily forecast contains invalid values");
    }
    return {
      date,
      weatherCode: codes[index] as number,
      temperatureMax: maximums[index] as number,
      temperatureMin: minimums[index] as number,
      precipitationProbability: precipitation[index] as number,
    };
  });

  return {
    updatedAt: response.current.time,
    current: currentFromResponse(response),
    days,
  };
}
