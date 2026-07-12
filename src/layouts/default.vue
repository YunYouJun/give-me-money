<template>
  <div class="gmm-layout">
    <header class="gmm-header">
      <navbar />
    </header>

    <main class="gmm-main">
      <router-view />
    </main>

    <footer class="gmm-footer">
      <base-footer />
    </footer>
  </div>
</template>

<style scoped lang="scss">
.gmm-layout {
  min-height: 100vh;
}

.gmm-header {
  position: sticky;
  z-index: 10;
  top: 0;
  border-bottom: 1px solid var(--gmm-border-soft);
  background: color-mix(in srgb, var(--gmm-bg-soft) 84%, transparent);
  backdrop-filter: blur(18px);
}

.gmm-main {
  width: min(100% - 2rem, 1120px);
  min-height: calc(100vh - 160px);
  padding: clamp(2rem, 5vw, 4.5rem) 0 3rem;
  margin: 0 auto;
}

.gmm-footer {
  width: min(100% - 2rem, 1120px);
  margin: 0 auto;
}

@media (max-width: 640px) {
  .gmm-main {
    width: min(100% - 1.5rem, 1120px);
    padding-top: 2rem;
  }

  .gmm-footer {
    width: min(100% - 1.5rem, 1120px);
  }
}
</style>
