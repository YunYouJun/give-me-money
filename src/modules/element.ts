import { UserModule } from "~/types";

import ElementPlus from "element-plus";
import "element-theme-ink";

export const install: UserModule = ({ app }) => {
  app.use(ElementPlus);
};
