<script setup>
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
