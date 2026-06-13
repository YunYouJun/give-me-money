<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getCommentsUrl } from '~/services/commentsConfig'

const { t } = useI18n()
const route = useRoute()
const activePath = computed(() => route.path)
const commentsUrl = getCommentsUrl()
const githubUrl = 'https://github.com/YunYouJun/give-me-money'
</script>

<template>
  <nav class="gmm-nav" aria-label="Primary">
    <div class="gmm-menu">
      <RouterLink
        class="gmm-nav-link is-logo"
        :class="{ 'is-active': activePath === '/' }"
        to="/"
        aria-label="Give Me Money"
      >
        <span class="gmm-menu-logo i-ri-money-cny-circle-line" aria-hidden="true" />
      </RouterLink>
      <a
        class="gmm-nav-link"
        :href="commentsUrl"
        target="_blank"
        rel="noopener"
      >
        {{ t("link.comments") }}
      </a>
      <RouterLink
        class="gmm-nav-link"
        :class="{ 'is-active': activePath === '/about' }"
        to="/about"
      >
        {{ t("link.about") }}
      </RouterLink>
    </div>
    <div class="gmm-nav-actions">
      <BaseTooltip content="GitHub">
        <a
          class="gmm-nav-icon-link"
          :href="githubUrl"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          title="GitHub"
        >
          <i-mdi-github />
        </a>
      </BaseTooltip>
      <lang-select class="right-menu-item" />
    </div>
  </nav>
</template>

<style scoped lang="scss">
.gmm-nav {
  display: flex;
  align-items: stretch;
  padding: 0 max(1rem, calc((100vw - 1120px) / 2));
  color: var(--gmm-text);
  border-bottom: 1px solid var(--gmm-border-soft);
}

.gmm-menu {
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  min-width: 0;
}

.gmm-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  height: 60px;
  padding: 0 1rem;
  color: var(--gmm-text);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.gmm-nav-link.is-active {
  color: var(--gmm-primary);
  border-bottom-color: var(--gmm-primary);
}

.gmm-nav-link.is-logo {
  min-width: 3.25rem;
}

.gmm-menu-logo {
  display: block;
  width: 1.35rem;
  height: 1.35rem;
  color: currentColor;
}

.gmm-nav-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: stretch;
}

.gmm-nav-actions :deep(.base-tooltip) {
  height: 60px;
}

.gmm-nav-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 60px;
  color: var(--gmm-text);
  font-size: 1.25rem;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition:
    color 0.18s ease,
    background 0.18s ease;
}

.gmm-nav-icon-link:hover,
.gmm-nav-icon-link:focus-visible {
  color: var(--gmm-primary);
  background: var(--gmm-primary-soft);
  outline: none;
}

.right-menu-item {
  display: inline-flex;
  flex: 0 0 5.75rem;
  justify-content: center;
  height: 60px;
}

@media (max-width: 480px) {
  .gmm-nav {
    padding: 0 0.5rem;
  }

  .gmm-nav-link {
    min-width: auto;
    padding: 0 0.65rem;
  }

  .gmm-nav-icon-link,
  .right-menu-item {
    width: 4.75rem;
    flex-basis: 4.75rem;
  }
}
</style>
