<template>
  <div
    class="lang-select"
    :title="t('button.toggle_langs')"
    style=""
    @click="toggleLocales"
  >
    <i-mdi-translate />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t, availableLocales, locale } = useI18n();

locale.value = localStorage.getItem("lang") || "zh-CN";

const toggleLocales = () => {
  const locales = availableLocales;
  const currentLang =
    locales[(locales.indexOf(locale.value) + 1) % locales.length];
  locale.value = currentLang;
  localStorage.setItem("lang", currentLang);
};
</script>

<style lang="scss">
.lang-select {
  width: 4rem;
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  font-size: large;
  cursor: pointer;
}
</style>
