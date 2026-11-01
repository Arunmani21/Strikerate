import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strikerate.app',
  appName: 'Strikerate',
  webDir: 'dist',
  android: {
    // The webview page is https://localhost, so plain-HTTP calls to the LAN
    // dev API are blocked as mixed content. Dev-only: remove once the
    // backend is served over HTTPS (alongside usesCleartextTraffic).
    allowMixedContent: true,
  },
};

export default config;
