---
title: 关于
---

## 说明

因为之前 API 次数被人恶意刷完了，所以重置了数据，现在改成邮箱验证才可以提交。

密码大家随便填，开心就好。

<img class="avatar" src="/img/mea.jpg" />

想要打钱，不如考虑捐给 [联合国儿童基金会](https://www.unicef.cn/)，谢谢！

[真想给我打钱](https://sponsors.yunyoujun.cn)，也不是不行，哼！

<div id="vcomments"></div>

<script setup lang="ts">
import { onMounted } from "vue";
import { nextTick } from "vue";
onMounted(async () => {
  await nextTick()
  new window.Valine({
    el: "#vcomments",
    appId: import.meta.env.VITE_APP_ID,
    appKey: import.meta.env.VITE_APP_KEY,
    avatar: "",
    placeholder: "欧尼酱，可以……给我……你的……评论吗？",
  });
});
</script>
