// leancloud
const appId = "FAfX0KW7tIrVPwKjeiCay2IQ-gzGzoHsz";
const appKey = "MbP9J5vK56e1J7RKmiX9DYlq";
import AV from "leancloud-storage";
AV.init({ appId, appKey, serverURL: "https://fafx0kw7.api.lncld.net" });

export default {
  install(Vue, options) {
    Vue.prototype.$AV = AV;
  }
};
