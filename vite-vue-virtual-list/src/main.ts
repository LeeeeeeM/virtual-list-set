import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import init from "./pkg";

init().then(() => {
  createApp(App).mount("#app");
});
