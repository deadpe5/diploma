<template>
    <div class="diploma-sidebar">
        <v-card min-width="300px" elevation="2">
            <div class="d-flex flex-row justify-space-between">
                <v-card-title>Mesh list</v-card-title>
                <v-btn :icon="'mdi-delete'" variant="text" @click="dialog = true" :disabled="visualisationStore.selectedMesh === null" />
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
            <v-card-title>Fluid properties</v-card-title>
            <v-container class="padding">
                <v-checkbox label="Check box bounds"></v-checkbox>
                <v-label>Fluid color & transparency</v-label>
                <v-color-picker v-model="fluidColor" hide-canvas hide-inputs></v-color-picker>
                <v-label class="mt-4">Particle count</v-label>
                <v-slider thumb-label></v-slider>
                <v-btn width="100%" class="mb-4" color="secondary">Pause</v-btn>
                <v-btn width="100%" color="primary">Restart</v-btn>
            </v-container>
        </v-card>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useVisualisationStore } from '@/stores/visualisationStore';
import type { AbstractMesh } from '@babylonjs/core';

const dialog = ref(false)

const fluidColor = ref('#00E5FF')
const visualisationStore = useVisualisationStore()

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
  