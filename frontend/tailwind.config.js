import frappeUIPreset, { content as frappeUIContent } from "frappe-ui/tailwind";

export default {
  presets: [frappeUIPreset],
  // This Vue app is embedded inside ERPNext Desk. Keep Tailwind's global
  // preflight reset disabled so Frappe UI styles do not reset Desk elements
  // outside #pick-pack-vue-root.
  corePlugins: {
    preflight: false,
  },
  content: [
    ...frappeUIContent,
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2457d6",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.04)",
      },
    },
  },
};
