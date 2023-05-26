<template>
    <v-chip 
        v-show="visualisationStore.isFPSCounterEnabled"
        class="fps"
        :text="`${visualisationStore.fps.toFixed()}FPS`"
        :color="visualisationStore.fpsCounterColor"
        size="large"
        />
</template>

<script setup lang="ts">
import { useVisualisationStore } from '@/stores/visualisationStore';
const visualisationStore = useVisualisationStore()
</script>
<style>
.fps {
  z-index: 999;
  width: fit-content;
  max-width: fit-content;
}
</style>