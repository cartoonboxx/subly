import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";

type ResolvedTheme = "light" | "dark";

const statusBarByTheme: Record<
  ResolvedTheme,
  {
    backgroundColor: string;
    style: Style;
  }
> = {
  dark: {
    backgroundColor: "#0b1120",
    style: Style.Dark
  },
  light: {
    backgroundColor: "#f6f8fb",
    style: Style.Light
  }
};

export const syncStatusBar = async (theme: ResolvedTheme) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const statusBar = statusBarByTheme[theme];

  try {
    await StatusBar.setOverlaysWebView({overlay: false});
    await StatusBar.setBackgroundColor({color: statusBar.backgroundColor});
    await StatusBar.setStyle({style: statusBar.style});
  } catch {
    // Some Android versions enforce edge-to-edge; CSS safe-area handles those.
  }
};
