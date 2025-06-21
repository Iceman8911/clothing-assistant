import { defineConfig } from "@solidjs/start/config";
import { analyzer } from "vite-bundle-analyzer";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        scope: "/",
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*"],
          // Explicitly add the root path to ensure index.html is precached
          additionalManifestEntries: [
            // { url: "/", revision: null },
            { url: "index.html", revision: "REV_INDEX_HTML_TO_CHANGE" },
          ],
        },
        manifest: {
          name: "Clothing Assistant",
          short_name: "Clothing Assistant",
          description:
            "A simple app to help manage your stock in your clothing/apparel-related business.",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
          ],
          display: "standalone",
        },
      }),
      analyzer({ analyzerMode: "static" }),
      visualizer({ template: "flamegraph" }),
    ],
  },
  server: {
    preset: "cloudflare_pages",
    prerender: {
      crawlLinks: true,
    },
    cloudflare: {
      nodeCompat: true,
      wrangler: {
        // node_compat: true,
        compatibility_date: "2025-05-23",
        compatibility_flags: [
          // "nodejs_compat",
          // "no_handle_cross_request_promise_resolution",
        ],
        name: "clothing-assistant",
        vars: {
          NODE_VERSION: 22,
        },
        // minify: false,
      },
      deployConfig: true,
      pages: {
        // routes: { exclude: ["/_server/*"], include: ["/*"] },
        // defaultRoutes: false,
      },
    },
    compressPublicAssets: { gzip: true, brotli: true },
    compatibilityDate: { cloudflare: "latest", default: "latest" },
    routeRules: {
      "index.html": {
        headers: {
          "cache-control": "public, max-age=0, must-revalidate",
        },
      },
      "_build/sw.js": {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "public, max-age=0, must-revalidate",
          "service-worker-allowed": "/",
        },
      },
      "_build/manifest.webmanifest": {
        headers: {
          "content-type": "application/manifest+json",
        },
      },
    },
  },
  ssr: false,
});
