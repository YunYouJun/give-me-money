<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <el-container>
    <el-header>
      <navbar />
    </el-header>

    <el-main>
      <div>
        <p class="text-4xl">
          <carbon-warning class="inline-block" />
        </p>
      </div>
      <router-view />
      <div>
        <button class="btn m-3 text-sm mt-8" @click="router.back()">
          {{ t("button.back") }}
        </button>
      </div>
    </el-main>

    <el-footer>
      <base-footer />
    </el-footer>
  </el-container>
</template>
