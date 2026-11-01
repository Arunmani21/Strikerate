import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // The native Android build ships assets in the APK; a service worker there
    // would be an unupdatable precache layer with no update channel.
    ...(mode === "android"
      ? []
      : [
          VitePWA({
            registerType: "autoUpdate",
            manifest: {
              name: "Strikerate",
              short_name: "Strikerate",
              description: "Cricket scoring and performance analysis",
              theme_color: "#070B14",
              background_color: "#0148A4",
              display: "standalone",
              orientation: "portrait",
              start_url: "/",
              icons: [
                { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
                { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
                {
                  src: "pwa-maskable-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
              navigateFallback: "/index.html",
            },
          }),
        ]),
  ],
}));
