import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

function mountPickPack(target) {
  if (!target) {
    throw new Error("Pick & Pack mount target was not found.");
  }

  // Avoid mounting twice when the page loader and entry script both initialize.
  if (target.__pickPackApp) {
    return target.__pickPackApp;
  }

  const app = createApp(App);
  app.mount(target);
  target.__pickPackApp = app;
  return app;
}

// Expose a mount function so Frappe can mount the app again after Desk navigation.
window.PickPack = window.PickPack || {};
window.PickPack.mount = mountPickPack;

// Also support opening the Vite entry directly in a browser during development.
const mountTarget = document.getElementById("pick-pack-vue-root");
if (mountTarget) {
  mountPickPack(mountTarget);
}
