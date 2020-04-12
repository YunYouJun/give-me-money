<template>
  <el-carousel
    ref="beg"
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
      <!-- <h3>{{ $store.state.decision }}</h3> -->
      <img width="100%" :src="item.path" :alt="item.label" />
    </el-carousel-item>
  </el-carousel>
</template>

<script>
export default {
  name: "DisplayImage",
  data() {
    return {
      album: {
        wow: {
          path: require("../assets/img/0.png"),
          label: "好吗？"
        },
        thank: {
          path: require("../assets/img/1.png"),
          label: "那个……谢谢啦……"
        },
        hum: {
          path: require("../assets/img/2.png"),
          label: "哼！"
        }
      }
    };
  },
  methods: {
    setActiveItem(index) {
      this.$refs["beg"].setActiveItem(index);
    }
  },
  watch: {
    "$store.state.decision"() {
      switch (this.$store.state.decision) {
        case "wow":
          this.setActiveItem("wow");
          break;
        case "ok":
          this.setActiveItem("thank");
          break;
        case "no":
          this.setActiveItem("hum");
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style>
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
