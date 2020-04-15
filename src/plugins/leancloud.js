// leancloud
const appId = process.env.appId;
const appKey = process.env.appKey;
import AV from "leancloud-storage";
AV.init({ appId, appKey });

export default {
  install(Vue, options) {
    Vue.prototype.$AV = AV;
  },
};
