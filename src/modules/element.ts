import { UserModule } from "~/types";

import ElementPlus from "element-plus";
import "element-theme-ink";
// import "element-plus/lib/theme-chalk/index.css";

export const install: UserModule = ({ app }) => {
  app.use(ElementPlus);
};
