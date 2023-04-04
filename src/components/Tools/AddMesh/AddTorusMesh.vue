<template>
    <v-card-title>
        Add Torus Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Dimensions</v-label>
        <v-text-field label="Diameter" variant="solo" class="ml-4 mr-4" v-model="diameter"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Thickness" variant="solo" class="ml-4 mr-4" v-model="thickness"
            :rules="[v => isValidFloat(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        
        <v-label class="ml-4 mb-2">Geometry</v-label>
        <v-text-field label="Segments count" variant="solo" class="ml-4 mr-4" v-model="segments"
            :rules="[v => isValidInt(v, 2, 65) || 'Must be a integer and be 2 < value < 65']"></v-text-field>

        <div class="d-flex flex-row">
            <v-btn class="ma-2 justify-start" color="secondary" variant="outlined" :to="{ name: 'addMeshTool' }"
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
import { ref, onMounted, watch } from 'vue'
import { isValidFloat, isValidInt } from '@/visualisation/common'
import { useVisualisationStore } from '@/stores/visualisationStore'
import type { ITorusOptions } from '@/visualisation/types';


const diameter = ref(1)
const thickness = ref(0.5)
const segments = ref(32)
const visualisationStore = useVisualisationStore()

onMounted(() => {
    const options: ITorusOptions = {
        diameter: diameter.value,
        thickness: thickness.value,
        segments: segments.value
    }

    visualisationStore.addTorusToScene(options)
    visualisationStore.zoomToFitAddMesh()
})

watch([diameter, thickness, segments], (newValues) => {
    if (confirmButtonDisabled()) {
        return
    }
    const [diameter, thickness, segments] = newValues.map(Number)

    const options: ITorusOptions = {
        diameter: diameter,
        thickness: thickness,
        segments: segments
    }

    visualisationStore.addTorusToScene(options)
    visualisationStore.zoomToFitAddMesh()
})

function cancel() {
    visualisationStore.disposeMeshToAdd()
}

function confirm() {
    visualisationStore.resetMeshToAdd()
}

function confirmButtonDisabled(): boolean {
    return !isValidFloat(diameter.value.toString()) ||
        !isValidFloat(thickness.value.toString()) ||
        !isValidInt(segments.value.toString(), 2, 65)
}

</script>