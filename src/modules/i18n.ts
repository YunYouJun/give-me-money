import { UserModule } from "~/types";
import { createI18n } from "vue-i18n";

import enLocale from "element-plus/lib/locale/lang/en";
import zhLocale from "element-plus/lib/locale/lang/zh-cn";
import ElementLocale from "element-plus/lib/locale";
import { isClient } from "~/utils/isClient";

// import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
const messages = Object.fromEntries(
  Object.entries(import.meta.globEager("../../locales/*.y(a)?ml")).map(
    ([key, value]) => {
      const yaml = key.endsWith(".yaml");
      const lang = key.slice(14, yaml ? -5 : -4);
      return [
        lang,
        {
          el: lang === "zh-CN" ? zhLocale.el : enLocale.el,
          ...value.default,
        },
      ];
    }
  )
);

export const install: UserModule = ({ app }) => {
  const i18n = createI18n({
    legacy: false,
    locale: isClient ? localStorage.getItem("lang") || "zh-CN" : "zh-CN",
    fallbackLocale: zhLocale.name,
    messages,
  });

  ElementLocale.i18n(i18n.global.t);
  app.use(i18n);
};
