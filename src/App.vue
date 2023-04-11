<script setup lang="ts">
import BabylonScene from './components/BabylonScene.vue'
import FPSCounter from './components/FPSCounter.vue';
import HeaderMenu from './components/HeaderMenu.vue'
import ToolBar from './components/Tools/ToolBar.vue';
import SideBar from './components/SideBar.vue';
</script>

<template>
  <v-app>
    <HeaderMenu />
    <BabylonScene />
    <ToolBar />
    <SideBar />
  </v-app>
</template>

<style></style>
