/// <reference types="@capacitor/status-bar" />
/// <reference types="@capacitor/local-notifications" />

import type {CapacitorConfig} from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "subly",
  plugins: {
    StatusBar: {
      backgroundColor: "#f6f8fb",
      overlaysWebView: false,
      style: "LIGHT"
    },
    LocalNotifications: {
      presentationOptions: ["badge", "sound", "banner", "list"]
    }
  },
  webDir: "dist"
};

export default config;
