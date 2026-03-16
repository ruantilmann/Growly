import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.growly.app",
  appName: "Growly",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
