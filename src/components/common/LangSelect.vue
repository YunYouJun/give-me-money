<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { isClient } from '~/utils/isClient'

const { t, availableLocales, locale } = useI18n()

function toggleLocales() {
  const locales = availableLocales
  const currentLang
    = locales[(locales.indexOf(locale.value) + 1) % locales.length]
  locale.value = currentLang
  // eslint-disable-next-line no-unused-expressions
  isClient ? localStorage.setItem('lang', currentLang) : ''
}
</script>

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
