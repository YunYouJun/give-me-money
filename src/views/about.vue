<template>
  <div>
    <h1>说明</h1>
    <p class="explain" v-html="explain"></p>
    <p class="explain">
      <img class="avatar" src="../assets/img/mea.jpg" />
      <br />
      实在想打钱，不如捐给
      <a href="https://www.unicef.cn/" target="_blank">联合国儿童基金会</a>
      或者给咱来点
      <a href="https://github.com/YunYouJun/give-me-money" target="_blank">
        Star </a
      >，谢谢！
    </p>
    <div id="vcomments"></div>
  </div>
</template>
<script>
import Valine from "valine";
export default {
  data() {
    return {
      explain:
        "因为之前 API 次数被人恶意刷完了，所以重置了数据，现在改成邮箱验证才可以提交。<br/>密码大家随便填，开心就好。"
    };
  },
  mounted() {
    window.AV = this.$AV;
    const Valine = require("valine");
    new Valine({
      el: "#vcomments",
      appId: "gtngXzAiqhogt9aEm9nNlzNg-MdYXbMMI",
      appKey: "vJHSVyoaMQEdFLd8Lqknoyw5",
      avatar: "",
      placeholder: "欧尼酱，可以……给我……你的……评论吗？"
    });
  }
};
</script>

<style scoped>
.explain {
  font-size: 1.2rem;
  padding: 1rem;
}
#vcomments {
  margin: 0 5rem;
}
@media screen and (max-device-width: 768px) {
  #vcomments {
    margin: 0;
  }
}
.avatar {
  background: #fcfcfc;
  border-radius: 50%;
  width: 96px;
  height: 96px;
  object-position: center top;
  object-fit: cover;
  padding: 0.2rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.12);
  transition: 0.4s;
}
.avatar:hover {
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.12);
}
</style>
