<template>
    <v-card>
        <v-card-title>
            Rotate Tool
        </v-card-title>
        <v-container>
        <v-text-field label="X axis" color="primary" variant="solo">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Y axis" color="primary" variant="solo">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Z axis" color="primary" variant="solo">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-btn width="100%" color="primary" variant="outlined" style="margin-bottom: 22px;">
            Restore rotation
        </v-btn>
        <v-btn width="100%" color="secondary" variant="outlined" :to="{name: 'root'}" >
            Back
        </v-btn>
    </v-container>
    </v-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVisualisationStore } from '@/stores/visualisationStore'

const visualisationStore = useVisualisationStore()

onMounted(() => {
  visualisationStore.deselectable = false
})
</script>