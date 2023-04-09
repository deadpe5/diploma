<script setup lang="ts">
import BabylonScene from './components/BabylonScene.vue'
import HeaderMenu from './components/HeaderMenu.vue'
import ToolBar from './components/Tools/ToolBar.vue';
</script>

<template>
  <v-app>
    <HeaderMenu />
    <BabylonScene />
    <ToolBar />
  </v-app>
</template>

<style></style>
