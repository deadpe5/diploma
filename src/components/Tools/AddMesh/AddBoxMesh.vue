<template>
    <v-card-title>
        Add Box Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Dimensions</v-label>
        <v-text-field label="Height" variant="solo" class="ml-4 mr-4" v-model="height" type="number"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        <v-text-field label="Width" variant="solo" class="ml-4 mr-4" v-model="width" type="number"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        <v-text-field label="Depth" variant="solo" class="ml-4 mr-4" v-model="depth" type="number"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        <div class="d-flex flex-row">
            <v-btn class="ma-2 justify-start" color="secondary" @click="cancel" :to="{ name: 'addMeshTool' }">
                <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
                Cancel
            </v-btn>

            <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'root' }" @click="confirm"
                :disabled="confirmButtonDisabled()">
                <v-icon class="v-btn__prepend" icon="mdi-check" />
                Confirm
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useVisualisationStore } from '@/stores/visualisationStore'
import type { IBoxOptions } from '@/visualisation/types';
import { isValidFloat } from '@/visualisation/common'
import { AbstractMesh } from '@babylonjs/core';
import { DEFAULT_SIZE_STEP } from '@/constants'

const height = ref(0.5)
const width = ref(0.5)
const depth = ref(0.5)
const visualisationStore = useVisualisationStore()

onMounted(() => {
    const options: IBoxOptions = {
        height: height.value,
        width: width.value,
        depth: depth.value
    }

    visualisationStore.selectable = false
    visualisationStore.addBoxToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

onBeforeUnmount(() => {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.selectable = true
    visualisationStore.deselect()
})

watch([height, width, depth], (newValues) => {
    if (confirmButtonDisabled()) {
        return
    }

    const [height, width, depth] = newValues.map(Number)

    const options: IBoxOptions = {
        height: height,
        width: width,
        depth: depth
    }

    visualisationStore.addBoxToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

function cancel() {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.deselect()
}

function confirm() {
    visualisationStore.resetMeshToAdd()
    const box = visualisationStore.sceneItems.at(-1) as AbstractMesh
    visualisationStore.addCollisionBox(box)
}

function confirmButtonDisabled(): boolean {
    return !isValidFloat(height.value.toString()) ||
        !isValidFloat(width.value.toString()) ||
        !isValidFloat(depth.value.toString())
}

</script>