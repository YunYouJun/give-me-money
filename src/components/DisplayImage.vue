<template>
  <el-row>
    <el-col
      :xs="{ span: 24, offset: 0 }"
      :sm="{ span: 16, offset: 4 }"
      :md="{ span: 16, offset: 4 }"
      :lg="{ span: 12, offset: 6 }"
      :xl="{ span: 8, offset: 8 }"
    >
      <img
        ref="loliImg"
        class="loli-img"
        :src="album.wow.path"
        :alt="album.wow.label"
      />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useStore } from 'vuex'

const loliImg = ref<HTMLImageElement | null>()
const album = {
  wow: {
    path: '/img/0.jpg',
    label: '好吗？',
  },
  thank: {
    path: '/img/1.jpg',
    label: '那个……谢谢啦……',
  },
  hum: {
    path: '/img/2.jpg',
    label: '哼！',
  },
}

const store = useStore()

/**
 * 设置轮播索引
 */
function setActiveItem(index: 'wow' | 'thank' | 'hum') {
  if (loliImg.value)
    loliImg.value.src = album[index].path
}

watch(
  () => store.state.decision,
  (val: string) => {
    switch (val) {
      case 'wow':
        setActiveItem('wow')
        break
      case 'ok':
        setActiveItem('thank')
        break
      case 'no':
        setActiveItem('hum')
        break
      default:
        break
    }
  },
)
</script>

<style lang="scss">
.loli-img {
  width: 100%;
  max-height: 400px;
  transition: 0.4s;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }
}
</style>
