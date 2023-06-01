<template>
    <v-card-title>
        Settings
    </v-card-title>
    <v-container>
        <v-switch
            label="Use WebGPU"
            v-model="webGPUSwitch"
            :disabled="!visualisationStore.isWebGPUSupported"
        >

        </v-switch>
        <v-btn width="100%" color="secondary" variant="elevated" :to="{ name: 'root' }">
            Back
        </v-btn>
    </v-container>
</template>
<script setup lang="ts">
import { ENGINE_VERSION, WEBGPU, WEBGL } from '@/constants';
import { useVisualisationStore } from '@/stores/visualisationStore';
import { watch, ref } from 'vue';

const visualisationStore = useVisualisationStore()

const webGPUSwitch = ref(visualisationStore.useWebGPU)

watch(webGPUSwitch, (useWebGPU) => {
    window.localStorage.setItem(ENGINE_VERSION, useWebGPU ? WEBGPU : WEBGL)
    window.location.reload()
})

</script>