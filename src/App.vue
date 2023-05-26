<script setup lang="ts">
import BabylonScene from './components/BabylonScene.vue'
import FPSCounter from './components/FPSCounter.vue';
import HeaderMenu from './components/HeaderMenu.vue'
import ToolBar from './components/Tools/ToolBar.vue';
</script>

<template>
  <HeaderMenu />
  <BabylonScene />
  <FPSCounter />
  <ToolBar />
</template>

<style>
</style>
