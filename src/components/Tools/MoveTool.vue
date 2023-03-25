<template>
    <v-card-title>
        Move tool
    </v-card-title>
    <v-container>
        <v-text-field label="X axis" color="primary" variant="solo" v-model="X"
            :rules="[v => isValid(v) || 'Must be a number']" clearable>
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('X')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Y axis" color="primary" variant="solo" v-model="Y"
            :rules="[v => isValid(v) || 'Must be a number']" clearable>
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('Y')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-text-field label="Z axis" color="primary" variant="solo" v-model="Z"
            :rules="[v => isValid(v) || 'Must be a number']" clearable>
            <template v-slot:append>
                <v-btn color="primary" variant="outlined" @click="apply('Z')">
                    Apply
                </v-btn>
            </template>
        </v-text-field>
        <v-switch v-model="LCS" label="Perform movement in LCS" color="primary" ></v-switch>
        <v-btn width="100%" color="primary" variant="outlined" style="margin-bottom: 22px;" @click="recenter">
            Recenter
        </v-btn>
        <v-btn width="100%" color="secondary" variant="outlined" :to="{ name: 'root' }">
            Back
        </v-btn>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVisualisationStore } from '@/stores/visualisationStore'

const visualisationStore = useVisualisationStore()

function isValid(value: string): boolean {
    return !isNaN(Number(value))
}

const X = ref(null)
const Y = ref(null)
const Z = ref(null)
const LCS = ref(false)

function apply(axis: string) {
    let value: number = 0
    switch (axis) {
        case 'X':
            if (X.value && isValid(X.value)) {
                value = Number(X.value)
                X.value = null
            }
            break
        case 'Y':
            if (Y.value && isValid(Y.value)) {
                value = Number(Y.value)
                Y.value = null
            }
            break
        case 'Z':
            if (Z.value && isValid(Z.value)) {
                value = Number(Z.value)
                Z.value = null
            }
            break
        default:
            return
    }

    if (value !== 0) {
        const movementInLCS = LCS.value
        visualisationStore.moveSelectedMesh(axis, value, movementInLCS)
    }
}

function recenter() {
    visualisationStore.recenterSelectedMesh()
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

.text-right {
  text-align: right;
}
</style>