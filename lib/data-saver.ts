export const DATA_SAVER_STORAGE_KEY = "tra-linh:data-saver";
export const DATA_SAVER_EVENT = "tra-linh:data-saver-change";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function isManualDataSaverEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DATA_SAVER_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function isDataSaverEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return isManualDataSaverEnabled()
    || Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

export function setManualDataSaverEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.setItem(DATA_SAVER_STORAGE_KEY, "true");
    else window.localStorage.removeItem(DATA_SAVER_STORAGE_KEY);
  } catch {
    // The visual preference still applies for this session through the event.
  }
  window.dispatchEvent(new Event(DATA_SAVER_EVENT));
}
