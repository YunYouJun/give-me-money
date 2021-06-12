import { UserModule } from "~/types";
import AV from "leancloud-storage";
// leancloud

interface LeancloudConfig {
  appId: string;
  appKey: string;
  serverURL?: string;
}

const config: LeancloudConfig = {
  appId: import.meta.env.VITE_APP_ID || "",
  appKey: import.meta.env.VITE_APP_KEY || "",
};

if (import.meta.env.VITE_SERVER_URL) {
  config.serverURL = import.meta.env.VITE_SERVER_URL;
}

AV.init(config);

export const install: UserModule = ({ app }) => {
  app.config.globalProperties.$AV = AV;
};
