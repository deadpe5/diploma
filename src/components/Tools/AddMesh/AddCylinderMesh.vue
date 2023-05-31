<template>
    <v-card-title>
        Add Cylinder Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Dimensions</v-label>
        <v-text-field label="Diameter Top" variant="solo" class="ml-4 mr-4" v-model="diameterTop" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        <v-text-field label="Diameter Bottom" variant="solo" class="ml-4 mr-4" v-model="diameterBottom" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        <v-text-field label="Height" variant="solo" class="ml-4 mr-4" v-model="height" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']" :step="DEFAULT_SIZE_STEP"></v-text-field>
        
        <v-label class="ml-4 mb-2">Geometry</v-label>
        <v-text-field label="Segments count" variant="solo" class="ml-4 mr-4" v-model="segments" type="number"
            :rules="[v => isValidInt(v, 2, 65) || 'Must be a integer and be 2 < value < 65']"></v-text-field>

        <div class="d-flex flex-row">
            <v-btn class="ma-2 justify-start" color="secondary" :to="{ name: 'addMeshTool' }"
            @click="cancel">
                <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
                Cancel
            </v-btn>

            <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'root' }" :disabled="confirmButtonDisabled()"
            @click="confirm">
                <v-icon class="v-btn__prepend" icon="mdi-check" />
                Confirm
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { isValidFloat, isValidInt } from '@/visualisation/common'
import { useVisualisationStore } from '@/stores/visualisationStore'
import type { ICylinderOptions } from '@/visualisation/types';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { DEFAULT_SIZE_STEP } from '@/constants'

const diameterTop = ref(1)
const diameterBottom = ref(1)
const height = ref(2)
const segments = ref(32)
const visualisationStore = useVisualisationStore()

onMounted(() => {
    const options: ICylinderOptions = {
        diameterTop: diameterTop.value,
        diameterBottom: diameterBottom.value,
        height: height.value,
        segments: segments.value
    }

    visualisationStore.selectable = false
    visualisationStore.addCylinderToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

onBeforeUnmount(() => {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.selectable = true
    visualisationStore.deselect()
})

watch([diameterTop, diameterBottom, height, segments], (newValues) => {
    if (confirmButtonDisabled()) {
        return
    }
    const [diameterTop, diameterBottom, height, segments] = newValues.map(Number)

    const options: ICylinderOptions = {
        diameterTop: diameterTop,
        diameterBottom: diameterBottom,
        height: height,
        segments: segments
    }

    visualisationStore.addCylinderToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

function cancel() {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.deselect()
}

function confirm() {
    visualisationStore.resetMeshToAdd()
    const cylinder = visualisationStore.sceneItems.at(-1) as AbstractMesh
    visualisationStore.addCollisionCylinder(cylinder)
}

function confirmButtonDisabled(): boolean {
    return !isValidFloat(diameterTop.value.toString()) ||
        !isValidFloat(diameterBottom.value.toString()) ||
        !isValidFloat(height.value.toString()) ||
        !isValidInt(segments.value.toString(), 2, 65)
}
</script>