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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
}

.gmm-main {
  width: min(100% - 2rem, 1120px);
  min-height: calc(100vh - 160px);
  padding: 1.75rem 0 2rem;
  margin: 0 auto;
}

.gmm-footer {
  width: min(100% - 2rem, 1120px);
  margin: 0 auto;
}
</style>
