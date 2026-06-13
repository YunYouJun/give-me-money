<script setup lang="ts">
import type { AppLocale } from '~/utils/locale'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLanguageAsync } from '~/modules/i18n'
import { useAppStore } from '~/stores/app'
import { normalizeLocale, persistLocale } from '~/utils/locale'

const languageOptions: Array<{
  value: AppLocale
  label: string
  shortLabel: string
}> = [
  { value: 'zh-CN', label: '中文', shortLabel: '中' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'ja', label: '日本語', shortLabel: '日' },
]

const { t, locale } = useI18n()
const app = useAppStore()
const rootRef = useTemplateRef<HTMLElement>('root')
const isOpen = shallowRef(false)
const menuId = 'language-menu'

const currentLocale = computed(() => normalizeLocale(locale.value))
const currentOption = computed(() => {
  return languageOptions.find(option => option.value === currentLocale.value) ?? languageOptions[0]
})

function closeMenu() {
  isOpen.value = false
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

async function selectLocale(value: AppLocale) {
  if (currentLocale.value !== value)
    await loadLanguageAsync(value)

  await app.setLocale(value)
  persistLocale(value)
  closeMenu()
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!rootRef.value?.contains(event.target as Node))
    closeMenu()
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div ref="root" class="lang-select">
    <button
      type="button"
      class="lang-select-trigger"
      :aria-label="`${t('button.toggle_langs')}: ${currentOption.label}`"
      :title="t('button.toggle_langs')"
      aria-haspopup="menu"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="menuId"
      @click="toggleMenu"
    >
      <i-mdi-translate aria-hidden="true" />
      <span class="lang-select-current">{{ currentOption.shortLabel }}</span>
      <i-ri-arrow-down-s-line
        class="lang-select-caret"
        :class="{ 'is-open': isOpen }"
        aria-hidden="true"
      />
    </button>

    <div
      v-show="isOpen"
      :id="menuId"
      class="lang-select-menu"
      role="menu"
      :aria-label="t('button.toggle_langs')"
    >
      <button
        v-for="option in languageOptions"
        :key="option.value"
        type="button"
        class="lang-select-option"
        :class="{ 'is-active': option.value === currentLocale }"
        role="menuitemradio"
        :aria-checked="option.value === currentLocale ? 'true' : 'false'"
        @click="selectLocale(option.value)"
      >
        <span>{{ option.label }}</span>
        <i-ri-check-line v-if="option.value === currentLocale" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lang-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.75rem;
  height: 100%;
}

.lang-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  padding: 0;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  transition:
    color 0.18s ease,
    background 0.18s ease;

  &:hover,
  &:focus-visible {
    color: #0f6f78;
    background: rgba(15, 111, 120, 0.08);
    outline: none;
  }
}

.lang-select-current {
  min-width: 1.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}

.lang-select-caret {
  font-size: 1rem;
  transition: transform 0.18s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.lang-select-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  right: 0;
  display: grid;
  gap: 0.25rem;
  min-width: 9rem;
  padding: 0.35rem;
  text-align: left;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 32px rgba(44, 62, 80, 0.12);
}

.lang-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.25rem;
  padding: 0 0.65rem;
  color: #2c3e50;
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  background: transparent;

  &:hover,
  &:focus-visible,
  &.is-active {
    color: #0f6f78;
    background: rgba(15, 111, 120, 0.08);
    outline: none;
  }

  &.is-active {
    font-weight: 700;
  }
}
</style>
