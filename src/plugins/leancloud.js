import AV from "leancloud-storage";
// leancloud
const config = {
  appId: process.env.appId,
  appKey: process.env.appKey,
};

if (process.env.serverURL) {
  config.serverURL = process.env.serverURL;
}

AV.init(config);

export default {
  install(Vue, options) {
    Vue.prototype.$AV = AV;
  },
};
