<template>
    <v-card-title>
        <p class="text-h4 text--primary">
            Tools
        </p>
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addMeshTool' }">
            <v-icon class="v-btn__prepend" icon="mdi-cube" />
            Add Mesh
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'rotateTool' }"
            :disabled="visualisationStore.selectedMesh === null">
            <v-icon class="v-btn__prepend" icon="mdi-rotate-orbit" />
            Rotate
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'moveTool' }"
            :disabled="visualisationStore.selectedMesh === null">
            <v-icon class="v-btn__prepend" icon="mdi-transition" />
            Move
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVisualisationStore } from '@/stores/visualisationStore'

const visualisationStore = useVisualisationStore()

onMounted(() => {
  visualisationStore.deselectable = true
})

</script>