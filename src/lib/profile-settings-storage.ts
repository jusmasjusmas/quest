const SETTINGS_KEY = "whim-profile-settings-v1";
const CUSTOM_WHIMS_KEY = "whim-custom-whims-v1";

export type ProfileNotificationSettings = {
  /** Nudge to open Whims / check the day’s prompt */
  dailyWhimReminder: boolean;
  /** Optional ping later if you joined but haven’t reflected */
  reflectionReminder: boolean;
};

const defaultNotifications: ProfileNotificationSettings = {
  dailyWhimReminder: true,
  reflectionReminder: true,
};

export function loadNotificationSettings(): ProfileNotificationSettings {
  if (typeof window === "undefined") return defaultNotifications;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultNotifications;
    const p = JSON.parse(raw) as Partial<ProfileNotificationSettings>;
    return {
      dailyWhimReminder:
        typeof p.dailyWhimReminder === "boolean"
          ? p.dailyWhimReminder
          : defaultNotifications.dailyWhimReminder,
      reflectionReminder:
        typeof p.reflectionReminder === "boolean"
          ? p.reflectionReminder
          : defaultNotifications.reflectionReminder,
    };
  } catch {
    return defaultNotifications;
  }
}

export function saveNotificationSettings(s: ProfileNotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadCustomWhims(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_WHIMS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveCustomWhims(lines: string[]): void {
  try {
    const cleaned = lines
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
    localStorage.setItem(CUSTOM_WHIMS_KEY, JSON.stringify(cleaned));
  } catch {
    /* ignore */
  }
}
