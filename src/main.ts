import { ViteSSG } from "vite-ssg";
import generatedRoutes from "virtual:generated-pages";
import { setupLayouts } from "layouts-generated";

import App from "./App.vue";
// import "virtual:windi-devtools";
import "./styles/main.scss";

// app.config.productionTip = false;

const routes = setupLayouts(generatedRoutes);

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(App, { routes }, ctx => {
  // install all modules under `modules/`
  Object.values(import.meta.globEager("./modules/*.ts")).map(i =>
    i.install?.(ctx),
  );
});
