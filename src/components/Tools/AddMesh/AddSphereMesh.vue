<template>
    <v-card-title>
        Add Sphere Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Dimensions</v-label>
        <v-text-field label="Diameter X" variant="solo" class="ml-4 mr-4" v-model="diameterX" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Diameter Y" variant="solo" class="ml-4 mr-4" v-model="diameterY" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Diameter Z" variant="solo" class="ml-4 mr-4" v-model="diameterZ" type="number"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']"></v-text-field>

        <v-label class="ml-4 mb-2">Geometry</v-label>
        <v-text-field label="Segments count" variant="solo" class="ml-4 mr-4" v-model="segments" type="number"
            :rules="[v => isValidInt(v, 0, 65) || 'Must be a integer and be 0 < value < 65']"></v-text-field>

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
import type { ISphereOptions } from '@/visualisation/types';

const diameterX = ref(1)
const diameterY = ref(1)
const diameterZ = ref(1)
const segments = ref(32)
const visualisationStore = useVisualisationStore()

onMounted(() => {
    const options: ISphereOptions = {
        diameterX: diameterX.value,
        diameterY: diameterY.value,
        diameterZ: diameterZ.value,
        segments: segments.value
    }

    visualisationStore.addSphereToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

onBeforeUnmount(() => {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.deselect()
})

watch([diameterX, diameterY, diameterZ, segments], (newValues) => {
    if (confirmButtonDisabled()) {
        return
    }
    const [diameterX, diameterY, diameterZ, segments] = newValues.map(Number)

    const options: ISphereOptions = {
        diameterX: diameterX,
        diameterY: diameterY,
        diameterZ: diameterZ,
        segments: segments
    }

    visualisationStore.addSphereToScene(options)
    visualisationStore.zoomToFitAddMesh()
    visualisationStore.deselect()
})

function cancel() {
    visualisationStore.disposeMeshToAdd()
    visualisationStore.deselect()
}

function confirm() {
    visualisationStore.resetMeshToAdd()
}

function confirmButtonDisabled(): boolean {
    return !isValidFloat(diameterX.value.toString()) ||
        !isValidFloat(diameterY.value.toString()) ||
        !isValidFloat(diameterZ.value.toString()) ||
        !isValidInt(segments.value.toString(), 0, 65)
}

</script>