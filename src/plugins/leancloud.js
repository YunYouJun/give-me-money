import AV from "leancloud-storage";
// leancloud
AV.init({ appId: process.env.appId, appKey: process.env.appKey });

export default {
  install(Vue, options) {
    Vue.prototype.$AV = AV;
  },
};
