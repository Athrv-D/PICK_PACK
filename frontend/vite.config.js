import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === "serve" ? "/" : "/assets/pick_pack_experiment/dist/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://mysite.localhost:8000",
        changeOrigin: true,
      },
      "/assets": {
        target: "http://mysite.localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: here("../pick_pack_experiment/public/dist/"),
    emptyOutDir: true,
    manifest: true,
    cssCodeSplit: false,
    assetsDir: "assets",
    rollupOptions: {
      input: here("./index.html"),
    },
  },
}));
