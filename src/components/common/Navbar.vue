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
    <RouterLink
      class="gmm-nav-brand"
      :class="{ 'is-active': activePath === '/' }"
      to="/"
      aria-label="Give Me Money"
    >
      <img
        class="gmm-menu-logo"
        src="/give-me-money-mark.svg"
        alt=""
        aria-hidden="true"
      >
      <span class="gmm-brand-text">Give Me Money</span>
    </RouterLink>
    <div class="gmm-menu">
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
  align-items: center;
  gap: 0.35rem;
  min-height: 4rem;
  padding: 0 max(1rem, calc((100vw - 1120px) / 2));
  color: var(--gmm-text);
}

.gmm-nav-brand,
.gmm-menu {
  display: flex;
  align-items: center;
  min-width: 0;
}

.gmm-nav-brand {
  gap: 0.6rem;
  min-height: 2.5rem;
  margin-right: auto;
  color: var(--gmm-heading);
  font-family: ui-rounded, 'Arial Rounded MT Bold', sans-serif;
  font-weight: 900;
  text-decoration: none;
  letter-spacing: -0.025em;
}

.gmm-nav-brand:hover,
.gmm-nav-brand:focus-visible {
  color: var(--gmm-primary);
  outline: none;
}

.gmm-brand-text {
  white-space: nowrap;
}

.gmm-menu {
  gap: 0.1rem;
}

.gmm-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  padding: 0 0.7rem;
  color: var(--gmm-muted);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    color 0.18s ease,
    background 0.18s ease;
}

.gmm-nav-link:hover,
.gmm-nav-link:focus-visible,
.gmm-nav-link.is-active {
  color: var(--gmm-primary);
  background: var(--gmm-primary-soft);
  outline: none;
}

.gmm-menu-logo {
  width: 2.15rem;
  height: 2.15rem;
  object-fit: contain;
}

.gmm-nav-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.gmm-nav-actions :deep(.base-tooltip) {
  height: 2.4rem;
}

.gmm-nav-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  color: var(--gmm-muted);
  font-size: 1.15rem;
  text-decoration: none;
  border-radius: 50%;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
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
  flex: 0 0 4.6rem;
  justify-content: center;
  height: 2.4rem;
}

.gmm-nav-actions :deep(.lang-select) {
  width: 4.6rem;
}

@media (max-width: 640px) {
  .gmm-nav {
    gap: 0.15rem;
    min-height: 3.75rem;
    padding: 0 0.75rem;
  }

  .gmm-nav-brand {
    margin-right: auto;
  }

  .gmm-menu {
    flex: 0 0 auto;
  }

  .gmm-nav-link {
    min-width: 0;
    padding: 0 0.5rem;
    font-size: 0.82rem;
  }

  .right-menu-item {
    flex-basis: 4.75rem;
  }

  .gmm-nav-actions :deep(.lang-select) {
    width: 4.75rem;
  }

  .gmm-nav-icon-link {
    width: 2.3rem;
  }
}

@media (max-width: 480px) {
  .gmm-brand-text {
    display: none;
  }

  .gmm-nav-brand {
    flex: 0 0 auto;
  }
}
</style>
