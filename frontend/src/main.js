import { createApp } from "vue";
import App from "./App.vue";

// Import Frappe UI's design system stylesheet as an explicit JS dependency.
// Vite then records it on the JS entry in the production manifest.
import "frappe-ui/style.css";
import "./style.css";

function mountPickPack(target) {
  if (!target) {
    throw new Error("Pick & Pack mount target was not found.");
  }

  if (target.__pickPackApp) {
    return target.__pickPackApp;
  }

  const app = createApp(App);
  app.mount(target);
  target.__pickPackApp = app;
  return app;
}

window.PickPack = window.PickPack || {};
window.PickPack.mount = mountPickPack;

const mountTarget = document.getElementById("pick-pack-vue-root");
if (mountTarget) {
  mountPickPack(mountTarget);
}
