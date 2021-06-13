<template>
  <el-carousel
    ref="carousel"
    :autoplay="false"
    indicator-position="none"
    arrow="never"
  >
    <el-carousel-item
      v-for="(item, name) in album"
      :key="name"
      :name="name"
      :label="item.label"
    >
      <img style="width: 100%" :src="item.path" :alt="item.label" />
    </el-carousel-item>
  </el-carousel>
</template>

<script setup lang="ts">
import { ElCarousel } from "element-plus";
import { watch, ref } from "vue";
import { useStore } from "vuex";

const carousel = ref<typeof ElCarousel | null>(null);
const album = {
  wow: {
    path: "/img/0.jpg",
    label: "好吗？",
  },
  thank: {
    path: "/img/1.jpg",
    label: "那个……谢谢啦……",
  },
  hum: {
    path: "/img/2.jpg",
    label: "哼！",
  },
};

const store = useStore();

/**
 * 设置轮播索引
 */
function setActiveItem(index: string) {
  carousel.value?.setActiveItem(index);
}

watch(
  () => store.state.decision,
  (val: string) => {
    switch (val) {
      case "wow":
        setActiveItem("wow");
        break;
      case "ok":
        setActiveItem("thank");
        break;
      case "no":
        setActiveItem("hum");
        break;
      default:
        break;
    }
  },
);
</script>

<style lang="scss">
.el-carousel__container {
  height: 400px !important;
}
@media screen and (max-device-width: 768px) {
  .el-carousel__container {
    height: 350px !important;
  }
}

@media screen and (max-device-width: 480px) {
  .el-carousel__container {
    height: 190px !important;
  }
}
</style>
