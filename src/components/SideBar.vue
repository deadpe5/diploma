<template>
    <div class="diploma-sidebar">
        <v-card min-width="300px" elevation="2">
            <div class="d-flex flex-row justify-space-between">
                <v-card-title>Mesh list</v-card-title>
                <v-btn :icon="'mdi-delete'" variant="text" @click="dialog = true"
                    :disabled="visualisationStore.selectedMesh === null" />
                <v-dialog v-model="dialog" width="auto">
                    <v-card>
                        <v-card-text>
                            Are you sure?
                        </v-card-text>
                        <v-card-subtitle>
                            Remove item '{{ visualisationStore.selectedMesh?.name }}'?
                        </v-card-subtitle>
                        <v-card-actions>
                            <v-btn color="secondary" @click="dialog = false">Cancel</v-btn>
                            <v-btn color="primary" @click="removeItem">Confirm</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

            </div>
            <v-container class="scrollable-list padding">
                <v-list>
                    <v-list-item v-for="item in visualisationStore.sceneItems" :key="item.id" :title="item.name"
                        @click="selectItem(item as AbstractMesh)">
                        <template v-slot:append>
                            <v-btn :icon="item.material?.alpha === 1.0 ? 'mdi-eye' : 'mdi-eye-off'" variant="text"
                                @click.stop="toggleVisibility(item as AbstractMesh)"></v-btn>
                        </template>
                    </v-list-item>
                </v-list>
            </v-container>
            <v-divider></v-divider>
            <v-card-title>Environment</v-card-title>
            <v-container  class="padding">
                <v-select label="Background" variant="solo" hide-details :items="ENVIRONMENT_NAMES" v-model="selectedEnv"></v-select>
                <v-label class="mt-4">Box opacity</v-label>
                <v-slider thumb-label :min="MIN_BOX_OPACITY" :max="MAX_BOX_OPACITY" :step="BOX_OPACITY_STEP"
                @mouseover="onMouseEnterBoxOpacity" v-model="boxOpacity">
                <template v-slot:append>
                    <v-text-field v-model="boxOpacity" type="number" style="width: 100px" density="compact" hide-details
                        :rules="boxRules" variant="outlined" :step="BOX_OPACITY_STEP"></v-text-field>
                </template>
            </v-slider>
            <v-snackbar v-model="boxSnackbar" :timeout="timeout" color="red-accent-4">
                {{ boxErrorMsg }}
                <template v-slot:actions>
                    <v-btn color="white" @click="boxSnackbar = false">
                        <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                    </v-btn>
                </template>
            </v-snackbar>
            </v-container>
            <v-divider></v-divider>
            <v-card-title>Fluid properties</v-card-title>
            <v-container class="padding">
                <v-checkbox label="Check box bounds" hide-details v-model="checkBounds"></v-checkbox>
                <v-checkbox label="Auto rotate box" hide-details v-model="autoRotateBox"
                    :disabled="!checkBounds || visualisationStore.isPaused"></v-checkbox>
                <v-label>Fluid color & transparency</v-label>
                <v-color-picker v-model="fluidColor" hide-canvas hide-inputs></v-color-picker>
                <v-label class="mt-4">Particle count</v-label>
                <v-slider thumb-label :min="MIN_PARTICLES_COUNT" :max="MAX_PARTICLES_COUNT" :step="PARTICLES_COUNT_STEP"
                    @mouseover="onMouseEnterParticle" v-model="particleCount">
                    <template v-slot:append>
                        <v-text-field v-model="particleCount" type="number" style="width: 100px" density="compact"
                            hide-details :rules="particleRules" variant="outlined"></v-text-field>
                    </template>
                </v-slider>
                <v-snackbar v-model="particleSnackbar" :timeout="timeout" color="red-accent-4">
                    {{ particleErrorMsg }}
                    <template v-slot:actions>
                        <v-btn color="white" @click="particleSnackbar = false">
                            <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                        </v-btn>
                    </template>
                </v-snackbar>

                <v-btn 
                    width="100%" class="mb-4" color="secondary" 
                    :variant="visualisationStore.isPaused ? 'outlined' : 'elevated' " 
                    :text="visualisationStore.isPaused ? 'Resume' : 'Pause' "
                    @click="pause"/>
                <v-btn width="100%" color="primary" @click="restart">Restart</v-btn>
            </v-container>
        </v-card>
    </div>
</template>
<script setup lang="ts">

import { ref, watch } from 'vue';
import { useVisualisationStore } from '@/stores/visualisationStore';
import type { AbstractMesh } from '@babylonjs/core';
import {
    MIN_PARTICLES_COUNT,
    MAX_PARTICLES_COUNT,
    PARTICLES_COUNT_STEP,
    MIN_BOX_OPACITY,
    MAX_BOX_OPACITY,
    BOX_OPACITY_STEP,
    DEFAULT_BOX_OPACITY,
    ENVIRONMENT_NAMES
} from '../constants'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const visualisationStore = useVisualisationStore()

const autoRotateBox = ref(false)
const checkBounds = ref(true)
const timeout = ref(2000)
const dialog = ref(false)

const selectedEnv = ref(ENVIRONMENT_NAMES[0])

watch(selectedEnv, (value) => {
    visualisationStore.changeEnvironment(value)
})

const boxErrorMsg = ref('')
const boxSnackbar = ref(false)
const boxOpacity = ref(DEFAULT_BOX_OPACITY)
const boxRules = [
    (v: string | number) => !isNaN(Number(v)) || 'Box opacity must be a number',
    (v: string | number) => Number(v) >= MIN_BOX_OPACITY || `Box opacity must be greater than ${MIN_BOX_OPACITY}`,
    (v: string | number) => Number(v) <= MAX_BOX_OPACITY || `Box opacity must be lower than ${MAX_BOX_OPACITY}`,
]

watch(boxOpacity, (value) => {
    boxErrorMsg.value = ''
    boxSnackbar.value = false
    for (let i = 0; i < boxRules.length; i++) {
        const rule = boxRules[i]
        const result = rule(value)
        if (typeof result === 'string') {
            boxErrorMsg.value = result
            boxSnackbar.value = true
            break
        }
    }

    visualisationStore.changeBoxOpacity(value)
})

const particleErrorMsg = ref('')
const particleSnackbar = ref(false)
const particleCount = ref((MIN_PARTICLES_COUNT + MAX_PARTICLES_COUNT) / 2)
const particleRules = [
    (v: string | number) => !isNaN(Number(v)) && Number.isInteger(Number(v)) || 'Particle count must be an integer',
    (v: string | number) => Number(v) >= MIN_PARTICLES_COUNT || `Particle count must be greater than ${MIN_PARTICLES_COUNT}`,
    (v: string | number) => Number(v) <= MAX_PARTICLES_COUNT || `Particle count must be lower than ${MAX_PARTICLES_COUNT}`,
]

watch(particleCount, (value) => {
    particleErrorMsg.value = ''
    particleSnackbar.value = false
    for (let i = 0; i < particleRules.length; i++) {
        const rule = particleRules[i]
        const result = rule(value)
        if (typeof result === 'string') {
            particleErrorMsg.value = result
            particleSnackbar.value = true
            break
        }
    }
})

watch(autoRotateBox, isActive => {
    visualisationStore.enableAutoRotateBox(isActive)
})

watch(checkBounds, isActive => {
    visualisationStore.checkBounds(isActive)

    if (autoRotateBox.value) {
        autoRotateBox.value = false
    }
})

const fluidColor = ref('#00E5FF')

function selectItem(item: AbstractMesh) {
    visualisationStore.select(item)
}

function toggleVisibility(item: AbstractMesh) {
    visualisationStore.toggleVisibility(item)
}

function removeItem() {
    dialog.value = false
    visualisationStore.removeSelectedSceneItem()
}

function pause() {
    if (visualisationStore.isPaused && autoRotateBox.value) {
        visualisationStore.enableAutoRotateBox(true)
    }
    visualisationStore.pauseSimulation()
}

function restart() {
    autoRotateBox.value = false
    visualisationStore.restartSimulation()
}

function onMouseEnterParticle() {
    if (particleErrorMsg.value !== '') {
        particleSnackbar.value = true
    }
}

function onMouseEnterBoxOpacity() {
    if (boxErrorMsg.value !== '') {
        boxSnackbar.value = true
    }
}
</script>
<style>
.scrollable-list {
    max-height: 200px !important;
    overflow-y: auto;
}

.diploma-sidebar {
    z-index: 1;
    width: fit-content;
    max-width: fit-content;
    display: flex;
    margin-right: 20px;
    position: absolute;
    top: 50%;
    /* add top property */
    transform: translateY(-50%);
    /* add transform property */
    right: 0;
}

.d-flex.flex-column.mb-6 .v-btn__content {
    padding: 0 8px;
}

.padding {
    padding: 0px 16px 16px 16px !important;
}
</style>
  