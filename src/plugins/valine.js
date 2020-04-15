function initValine() {
  window.AV = this.$AV;
  const Valine = require("valine");
  new Valine({
    el: "#vcomments",
    appId: process.env.appId,
    appKey: process.env.appKey,
    avatar: "",
    placeholder: "欧尼酱，可以……给我……你的……评论吗？",
  });
}
export { initValine };
