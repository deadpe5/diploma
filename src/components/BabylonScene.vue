<template>
    <canvas ref="bjsCanvas" id="bjsCanvas"></canvas>
</template>

<script lang="ts">
import { useVisualisationStore } from '@/stores/visualisationStore';
import { ref, onMounted } from 'vue';

export default {
    name: "BabylonScene",
    setup() {
        const visualisationStore = useVisualisationStore();

        const bjsCanvas = ref(null);

        onMounted(() => {
            if (bjsCanvas.value) {
                visualisationStore.init(bjsCanvas.value)
            }
        });

        return {
            bjsCanvas,
        };
    },
};
</script>

<style>
#bjsCanvas {
    width: 100%;
    height: 100%;
    outline: none;
    -webkit-tap-highlight-color: rgb(255, 255, 255); /* mobile webkit */
}
</style>