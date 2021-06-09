<template>
  <h3>{{ t("message.header") }}</h3>
  <el-row>
    <el-col
      :xs="{ span: 24, offset: 0 }"
      :sm="{ span: 16, offset: 4 }"
      :md="{ span: 16, offset: 4 }"
      :lg="{ span: 12, offset: 6 }"
      :xl="{ span: 8, offset: 8 }"
    >
      <display-image></display-image>
    </el-col>
  </el-row>

  <info-input></info-input>

  <audio id="love-you" autoplay>
    <source src="/audio/love.mp3" type="audio/mpeg" />
  </audio>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
