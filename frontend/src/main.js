import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

window.PickPack = {
  mount(element) {
    if (!element) return;
    element.__pickPackApp?.unmount();
    const app = createApp(App);
    app.mount(element);
    element.__pickPackApp = app;
  }
};