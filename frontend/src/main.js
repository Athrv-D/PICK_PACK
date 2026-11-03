import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

const mountTarget = document.getElementById("pick-pack-vue-root");

if (mountTarget) {
  mountTarget.__pickPackApp?.unmount();
  const app = createApp(App);
  app.mount(mountTarget);
  mountTarget.__pickPackApp = app;
}
