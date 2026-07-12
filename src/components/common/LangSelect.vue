<script setup lang="ts">
import type { AppLocale } from '~/utils/locale'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'reka-ui'
import { computed } from 'vue'
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

const currentLocale = computed(() => normalizeLocale(locale.value))
const currentOption = computed(() => {
  return languageOptions.find(option => option.value === currentLocale.value) ?? languageOptions[0]
})

function isAppLocale(value: unknown): value is AppLocale {
  return value === 'zh-CN' || value === 'en' || value === 'ja'
}

async function selectLocale(value: AppLocale) {
  if (currentLocale.value !== value)
    await loadLanguageAsync(value)

  await app.setLocale(value)
  persistLocale(value)
}

function handleLocaleChange(value: unknown) {
  if (isAppLocale(value))
    void selectLocale(value)
}
</script>

<template>
  <div class="lang-select">
    <SelectRoot
      :model-value="currentLocale"
      @update:model-value="handleLocaleChange"
    >
      <SelectTrigger as-child>
        <button
          type="button"
          class="lang-select-trigger"
          :aria-label="`${t('button.toggle_langs')}: ${currentOption.label}`"
          :title="t('button.toggle_langs')"
        >
          <i-mdi-translate aria-hidden="true" />
          <span class="lang-select-current">{{ currentOption.shortLabel }}</span>
          <i-ri-arrow-down-s-line
            class="lang-select-caret"
            aria-hidden="true"
          />
        </button>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          class="lang-select-content"
          position="popper"
          side="bottom"
          align="end"
          :side-offset="6"
          :collision-padding="8"
        >
          <SelectViewport class="lang-select-viewport">
            <SelectItem
              v-for="option in languageOptions"
              :key="option.value"
              class="lang-select-option"
              :value="option.value"
            >
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="lang-select-option-indicator">
                <i-ri-check-line aria-hidden="true" />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<style scoped lang="scss">
.lang-select {
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
  padding: 0 0.55rem;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
  transition:
    color 0.18s ease,
    background 0.18s ease;

  &:hover,
  &:focus-visible,
  &[data-state='open'] {
    color: var(--gmm-primary);
    background: var(--gmm-primary-soft);
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

  .lang-select-trigger[data-state='open'] & {
    transform: rotate(180deg);
  }
}
</style>
