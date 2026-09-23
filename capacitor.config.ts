/// <reference types="@capacitor/status-bar" />

import type {CapacitorConfig} from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "subly",
  plugins: {
    StatusBar: {
      backgroundColor: "#f6f8fb",
      overlaysWebView: false,
      style: "LIGHT"
    }
  },
  webDir: "dist"
};

export default config;
