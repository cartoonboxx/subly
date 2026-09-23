import {defineStore} from "pinia";

export type AppCurrency = "RUB" | "USD" | "EUR";
export type AppTheme = "system" | "light" | "dark";

type AppSettings = {
  currency: AppCurrency;
  defaultReminderDays: number;
  theme: AppTheme;
};

const SETTINGS_STORAGE_KEY = "subly.settings";

const DEFAULT_SETTINGS: AppSettings = {
  currency: "RUB",
  defaultReminderDays: 3,
  theme: "system"
};

const currencySymbols: Record<AppCurrency, string> = {
  EUR: "€",
  RUB: "₽",
  USD: "$"
};

const normalizeSettings = (settings: Partial<AppSettings>): AppSettings => {
  const currencyValue = settings.currency;
  const themeValue = settings.theme;
  const currency = ["RUB", "USD", "EUR"].includes(currencyValue ?? "")
    ? (currencyValue as AppCurrency)
    : DEFAULT_SETTINGS.currency;
  const theme = ["system", "light", "dark"].includes(themeValue ?? "")
    ? (themeValue as AppTheme)
    : DEFAULT_SETTINGS.theme;
  const defaultReminderDays = Number(settings.defaultReminderDays);

  return {
    currency,
    defaultReminderDays:
      Number.isFinite(defaultReminderDays) && defaultReminderDays >= 0
        ? Math.round(defaultReminderDays)
        : DEFAULT_SETTINGS.defaultReminderDays,
    theme
  };
};

export const settingsStore = defineStore("settings", {
  state: (): AppSettings => ({
    ...DEFAULT_SETTINGS
  }),
  getters: {
    currencySymbol(state) {
      return currencySymbols[state.currency];
    }
  },
  actions: {
    loadSettings() {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (!storedSettings) {
        this.applyTheme();
        return;
      }

      try {
        const settings = JSON.parse(storedSettings) as Partial<AppSettings>;
        const normalizedSettings = normalizeSettings(settings);

        this.currency = normalizedSettings.currency;
        this.defaultReminderDays = normalizedSettings.defaultReminderDays;
        this.theme = normalizedSettings.theme;
      } catch {
        this.saveSettings();
      }

      this.applyTheme();
    },
    saveSettings() {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          currency: this.currency,
          defaultReminderDays: this.defaultReminderDays,
          theme: this.theme
        })
      );
      this.applyTheme();
    },
    updateCurrency(currency: AppCurrency) {
      this.currency = currency;
      this.saveSettings();
    },
    updateDefaultReminderDays(reminderDays: number) {
      this.defaultReminderDays = Math.max(0, Math.round(reminderDays || 0));
      this.saveSettings();
    },
    updateTheme(theme: AppTheme) {
      this.theme = theme;
      this.saveSettings();
    },
    applyTheme() {
      const prefersDark =
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const resolvedTheme =
        this.theme === "system" ? (prefersDark ? "dark" : "light") : this.theme;

      document.documentElement.dataset.theme = resolvedTheme;
    },
    formatCurrency(value: number) {
      const roundedValue = Math.round(value).toLocaleString("ru-RU");

      return this.currency === "USD"
        ? `${this.currencySymbol}${roundedValue}`
        : `${roundedValue} ${this.currencySymbol}`;
    }
  }
});
