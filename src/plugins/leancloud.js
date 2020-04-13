// leancloud
// const appId = "FAfX0KW7tIrVPwKjeiCay2IQ-gzGzoHsz";
const appId = "gtngXzAiqhogt9aEm9nNlzNg-MdYXbMMI";
// const appKey = "MbP9J5vK56e1J7RKmiX9DYlq";
const appKey = "vJHSVyoaMQEdFLd8Lqknoyw5";
import AV from "leancloud-storage";
// serverURL: "https://fafx0kw7.api.lncld.net"
AV.init({ appId, appKey });

export default {
  install(Vue, options) {
    Vue.prototype.$AV = AV;
  }
};
