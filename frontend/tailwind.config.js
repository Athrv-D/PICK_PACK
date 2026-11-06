import frappeUIPreset, { content as frappeUIContent } from "frappe-ui/tailwind";

export default {
  presets: [frappeUIPreset],
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
