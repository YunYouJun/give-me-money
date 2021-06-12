<template>
  <el-container>
    <el-header>
      <navbar />
    </el-header>

    <el-main>
      <router-view />
    </el-main>

    <el-footer>
      <base-footer />
    </el-footer>
  </el-container>
</template>

<style lang="scss">
.el-header {
  padding: 0 !important;
}
.el-main {
  padding: 0 0.5rem !important;
}
</style>
