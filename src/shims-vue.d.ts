declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  VITE_APP_ID?: string;
  VITE_APP_KEY?: string;
  VITE_SERVER_URL?: string;
}

interface Window {
  AV: any;
  valine: any;
}

declare module "valine";
