export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: { extend: {
    colors: { brand: "#2457d6", canvas: "#f6f8fb", ink: "#17212f", muted: "#667085", line: "#e7ebf0" },
    boxShadow: { panel: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.04)" }
  }},
  plugins: []
};