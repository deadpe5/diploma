<template>
    <v-card-title>
        Move tool
    </v-card-title>
    <v-container>
        <v-text-field label="X axis" color="primary" variant="solo" v-model="X">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('X')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Y axis" color="primary" variant="solo" v-model="Y">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('Y')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Z axis" color="primary" variant="solo" v-model="Z">
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('Z')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-btn width="100%" color="primary" variant="outlined" style="margin-bottom: 22px;">
            Recenter
        </v-btn>
        <v-btn width="100%" color="secondary" variant="outlined" :to="{name: 'root'}" >
            Back
        </v-btn>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVisualisationStore } from '@/stores/visualisationStore'

const visualisationStore = useVisualisationStore()

const X = ref(null)
const Y = ref(null)
const Z = ref(null)

function apply(axis: string) {
    
}

onMounted(() => {
  visualisationStore.deselectable = false
})
</script>

<style>
.v-input__append {
    padding-top: 0 !important;
    align-items: center;
}
</style>