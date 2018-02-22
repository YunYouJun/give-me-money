<template>
  <el-carousel ref="beg" :autoplay="false" indicator-position="none" arrow="never" set>
    <el-carousel-item v-for="(item, name) in album" :key="name" :name="name" :label="item.label">
      <!-- <h3>{{ item }}</h3> -->
      <img width="100%" :src="item.path" :alt="item.label"/>
    </el-carousel-item>
  </el-carousel>
</template>

<style>
@media    screen and (min-device-width:481px)  {
  .el-carousel__container {
    min-height: 100%;
    padding: 0 auto;
  }
}
@media    screen and (max-device-width:480px)  {
  .el-carousel__container {
    width: 100%;
    height: 200px;
  }
}
</style>

<script>
import bus from '../eventBus'

export default {
  name: 'DisplayImage',
  data () {
    return {
      album: {
        wow: {
          path: require('../assets/img/0.png'),
          label: '好吗？'
        },
        thank: {
          path: require('../assets/img/1.png'),
          label: '那个……谢谢啦……'
        },
        hum: {
          path: require('../assets/img/2.png'),
          label: '哼！'
        }
      },
    }
  },
  methods: {
    setActiveItem (index) {
      this.$refs['beg'].setActiveItem(index)
    }
  },
  created () {
    let self = this
    bus.$on('ok', function () {
      console.log('ok~~~')
      self.setActiveItem('thank')
    })

    bus.$on('no', function () {
      console.log('no!!!')
      self.setActiveItem('hum')
    })
  }
}
</script>