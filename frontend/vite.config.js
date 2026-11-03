import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: here("../pick_pack_experiment/public/dist/"),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: here("./src/main.js"),
      name: "PickPack",
      formats: ["iife"],
      fileName: () => "pick-pack.js",
      cssFileName: "pick-pack"
    },
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});