declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const component: ComponentOptions;
  export default component;
}

// with vite-plugin-md, markdowns can be treat as Vue components
declare module "*.md" {
  import type { ComponentOptions } from "vue";
  const component: ComponentOptions;
  export default component;
}

interface ImportMetaEnv {
  VITE_APP_ID?: string;
  VITE_APP_KEY?: string;
  VITE_SERVER_URL?: string;
}

declare interface Window {
  AV: any;
  Valine: any;
  localStorage: any;
}
