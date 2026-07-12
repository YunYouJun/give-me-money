<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import DisplayImage from '~/components/DisplayImage.vue'
import InfoInput from '~/components/InfoInput.vue'
import NsfwPreviewWarning from '~/components/NsfwPreviewWarning.vue'
import { isClient } from '~/utils/isClient'

const { t } = useI18n()
const PREVIEW_WARNING_KEY = 'give-me-money:preview-warning-accepted'

const isPreviewAllowed = shallowRef(false)

function hasPreviewConsent() {
  if (!isClient)
    return false

  try {
    return sessionStorage.getItem(PREVIEW_WARNING_KEY) === 'true'
  }
  catch {
    return false
  }
}

function rememberPreviewConsent() {
  if (!isClient)
    return

  try {
    sessionStorage.setItem(PREVIEW_WARNING_KEY, 'true')
  }
  catch {}
}

function allowPreview() {
  isPreviewAllowed.value = true
  rememberPreviewConsent()
}

onMounted(() => {
  isPreviewAllowed.value = hasPreviewConsent()
})
</script>

<template>
  <NsfwPreviewWarning
    v-if="!isPreviewAllowed"
    @continue="allowPreview"
  />
  <template v-else>
    <section class="gmm-prank-stage">
      <header class="gmm-hero">
        <div class="gmm-hero-coin" aria-hidden="true">
          <span>¥</span>
        </div>
        <div class="gmm-hero-copy">
          <p class="gmm-hero-kicker">
            GIVE ME MONEY · JUST FOR FUN
          </p>
          <h1 class="gmm-hero-title">
            {{ t("message.title") }}
          </h1>
          <p class="gmm-hero-note">
            {{ t("message.header") }}
          </p>
        </div>
      </header>

      <div class="gmm-prank-grid">
        <DisplayImage />
        <InfoInput />
      </div>
    </section>
    <audio id="love-you" preload="none" aria-hidden="true">
      <source src="/audio/love.mp3" type="audio/mpeg">
    </audio>
  </template>
</template>

<style scoped lang="scss">
.gmm-prank-stage {
  width: min(100%, 1040px);
  margin: 0 auto;
}

.gmm-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto clamp(1.5rem, 4vw, 2.75rem);
  text-align: left;
}

.gmm-hero-coin {
  display: grid;
  flex: 0 0 auto;
  width: clamp(4rem, 8vw, 5.5rem);
  aspect-ratio: 1;
  place-items: center;
  color: #624600;
  font-family: ui-rounded, 'Arial Rounded MT Bold', sans-serif;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 900;
  border: 2px solid color-mix(in srgb, var(--gmm-accent) 68%, #7a5a00);
  border-radius: 50%;
  background: var(--gmm-accent);
  box-shadow:
    inset 0 0 0 7px color-mix(in srgb, var(--gmm-accent) 72%, white),
    0 8px 0 color-mix(in srgb, var(--gmm-accent) 64%, #9b6b00),
    0 16px 24px rgba(53, 65, 71, 0.12);
  transform: rotate(-8deg);
  animation: coin-arrive 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.gmm-hero-copy {
  min-width: 0;
}

.gmm-hero-kicker {
  margin: 0 0 0.35rem;
  color: var(--gmm-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.gmm-hero-title {
  margin: 0;
  color: var(--gmm-heading);
  font-family: ui-rounded, 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', sans-serif;
  font-size: clamp(2rem, 5vw, 4.35rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.gmm-hero-note {
  margin: 0.55rem 0 0;
  color: var(--gmm-muted);
  font-size: 0.95rem;
}

.gmm-prank-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(26rem, 1.1fr);
  gap: clamp(1.25rem, 3vw, 2.5rem);
  align-items: start;
}

@keyframes coin-arrive {
  from {
    opacity: 0;
    transform: translateY(-0.75rem) rotate(-18deg) scale(0.8);
  }
}

@media (max-width: 860px) {
  .gmm-prank-grid {
    grid-template-columns: 1fr;
    width: min(100%, 42rem);
    margin: 0 auto;
  }
}

@media (max-width: 540px) {
  .gmm-hero {
    justify-content: flex-start;
    gap: 0.8rem;
  }

  .gmm-hero-kicker {
    font-size: 0.64rem;
    letter-spacing: 0.08em;
  }

  .gmm-hero-title {
    font-size: clamp(1.75rem, 10vw, 2.55rem);
  }

  .gmm-hero-note {
    margin-top: 0.35rem;
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gmm-hero-coin {
    animation: none;
  }
}
</style>
