<template>
    <v-container class="scrollable-card zero-padding" fluid>
        <v-card-title>Fluid Settings</v-card-title>
        <v-label class="ml-4 mb-2">Bounding Box</v-label>
        <v-text-field label="Height" variant="solo" class="ml-4 mr-4" v-model="boundingBoxHeight"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Width" variant="solo" class="ml-4 mr-4" v-model="boundingBoxWidth"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Depth" variant="solo" class="ml-4 mr-4" v-model="boundingBoxDepth"
            :rules="[v => isValidFloat(v) || 'Must be a number and greater than 0']"></v-text-field>

        <v-label class="ml-4 mb-2">Fluid</v-label>
        <div class="text-caption ml-4">Particle size</div>
        <v-slider thumb-label :min="MIN_PARTICLE_SIZE" :max="MAX_PARTICLE_SIZE" :step="PARTICLE_SIZE_STEP"
            @mouseover="onMouseEnter(0)" v-model="particleSize" class="padding">
            <template v-slot:append>
                <v-text-field v-model="particleSize" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[0]" variant="outlined" :step="PARTICLE_SIZE_STEP"></v-text-field>
            </template>
        </v-slider>
        <v-snackbar v-model="snackbars[0]" :timeout="timeout" color="error">
            {{ errorMsgs[0] }}
            <template v-slot:actions>
                <v-btn color="white" @click="snackbars[0] = false">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                </v-btn>
            </template>
        </v-snackbar>

        <div class="text-caption ml-4">Smoothing radius</div>
        <v-slider thumb-label :min="MIN_SMOOTHING_RADIUS" :max="MAX_SMOOTHING_RADIUS" :step="SMOOTHING_RADIUS_STEP"
            @mouseover="onMouseEnter(1)" v-model="smoothingRadius" class="padding">
            <template v-slot:append>
                <v-text-field v-model="smoothingRadius" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[1]" variant="outlined" :step="SMOOTHING_RADIUS_STEP"></v-text-field>
            </template>
        </v-slider>
        <v-snackbar v-model="snackbars[1]" :timeout="timeout" color="error">
            {{ errorMsgs[1] }}
            <template v-slot:actions>
                <v-btn color="white" @click="snackbars[1] = false">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                </v-btn>
            </template>
        </v-snackbar>

        <div class="text-caption ml-4">Density reference</div>
        <v-slider thumb-label :min="MIN_DENSITY_REFERENCE" :max="MAX_DENSITY_REFERENCE" :step="DENSITY_REFERENCE_STEP" @mouseover="onMouseEnter(2)"
            v-model="fluidDensity" class="padding">
            <template v-slot:append>
                <v-text-field v-model="fluidDensity" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[2]" variant="outlined" :step="DENSITY_REFERENCE_STEP"></v-text-field>
            </template>
        </v-slider>
        <v-snackbar v-model="snackbars[2]" :timeout="timeout" color="error">
            {{ errorMsgs[2] }}
            <template v-slot:actions>
                <v-btn color="white" @click="snackbars[2] = false">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                </v-btn>
            </template>
        </v-snackbar>

        <div class="text-caption ml-4">Preasure constant</div>
        <v-slider thumb-label :min="MIN_PREASURE_CONSTANT" :max="MAX_PREASURE_CONSTANT" :step="PREASURE_CONSTANT_STEP" @mouseover="onMouseEnter(3)"
            v-model="preasureConstant" class="padding">
            <template v-slot:append>
                <v-text-field v-model="preasureConstant" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[3]" variant="outlined" :step="PREASURE_CONSTANT_STEP"></v-text-field>
            </template>
        </v-slider>
        <v-snackbar v-model="snackbars[3]" :timeout="timeout" color="error">
            {{ errorMsgs[3] }}
            <template v-slot:actions>
                <v-btn color="white" @click="snackbars[3] = false">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                </v-btn>
            </template>
        </v-snackbar>

        <div class="text-caption ml-4">Max velocity</div>
        <v-slider thumb-label :min="MIN_FLUID_VELOCITY" :max="MAX_FLUID_VELOCITY" :step="FLUID_VELOCITY_STEP" @mouseover="onMouseEnter(4)"
            v-model="fluidVelocity" class="padding">
            <template v-slot:append>
                <v-text-field v-model="fluidVelocity" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[4]" variant="outlined" :step="FLUID_VELOCITY_STEP"></v-text-field>
            </template>
        </v-slider>
        <v-snackbar v-model="snackbars[4]" :timeout="timeout" color="error">
            {{ errorMsgs[4] }}
            <template v-slot:actions>
                <v-btn color="white" @click="snackbars[4] = false">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" size="2xl" />
                </v-btn>
            </template>
        </v-snackbar>

        <v-label class="ml-4">Debug</v-label>
        <v-checkbox label="Enable Debug Mode" class="ml-2 mr-4"></v-checkbox>
        <v-select label="Feature" variant="solo" class="ml-4 mr-4"></v-select>
    </v-container>
    <v-container>
        <v-btn width="100%" color="secondary" :to="{ name: 'root' }">
            Back
        </v-btn>
    </v-container>
</template>
  
<script setup lang="ts">
import { isValidFloat } from '@/visualisation/common';
import { ref, watch } from 'vue';
import {
    MIN_PARTICLE_SIZE,
    MAX_PARTICLE_SIZE,
    PARTICLE_SIZE_STEP,
    SMOOTHING_RADIUS_STEP,
    MAX_SMOOTHING_RADIUS,
    MIN_SMOOTHING_RADIUS,
    MIN_DENSITY_REFERENCE,
    MAX_DENSITY_REFERENCE,
    DENSITY_REFERENCE_STEP,
    MIN_PREASURE_CONSTANT,
    MAX_PREASURE_CONSTANT,
    PREASURE_CONSTANT_STEP,
    MIN_FLUID_VELOCITY,
    MAX_FLUID_VELOCITY,
    FLUID_VELOCITY_STEP,
} from '../../constants'

const boundingBoxHeight = ref(1)
const boundingBoxWidth = ref(1)
const boundingBoxDepth = ref(1)

const particleSize = ref((MIN_PARTICLE_SIZE + MAX_PARTICLE_SIZE) / 2)
const smoothingRadius = ref((MIN_SMOOTHING_RADIUS + MAX_SMOOTHING_RADIUS) / 2)
const fluidDensity = ref((MIN_DENSITY_REFERENCE + MAX_DENSITY_REFERENCE) / 2)
const preasureConstant = ref(Math.floor((MIN_PREASURE_CONSTANT + MAX_PREASURE_CONSTANT) / 2))
const fluidVelocity = ref((MIN_FLUID_VELOCITY + MAX_FLUID_VELOCITY) / 2)

const timeout = ref(2000)
const snackbars = ref([false, false, false, false, false])
const errorMsgs = ref(['', '', '', '', ''])

const rules = [
    [
        (v: string | number) => !isNaN(Number(v)) || 'Particle size must be a number',
        (v: string | number) => Number(v) >= MIN_PARTICLE_SIZE || `Particle size must be greater than ${MIN_PARTICLE_SIZE}`,
        (v: string | number) => Number(v) <= MAX_PARTICLE_SIZE || `Particle size must be lower than ${MAX_PARTICLE_SIZE}`,
    ],
    [
        (v: string | number) => !isNaN(Number(v)) || 'Smoothing radius must be a number',
        (v: string | number) => Number(v) >= MIN_SMOOTHING_RADIUS || `Smoothing radius must be greater than ${MIN_SMOOTHING_RADIUS}`,
        (v: string | number) => Number(v) <= MAX_SMOOTHING_RADIUS || `Smoothing radius must be lower than ${MAX_SMOOTHING_RADIUS}`
    ],
    [
        (v: string | number) => (!isNaN(Number(v)) && Number.isInteger(Number(v))) || 'Density reference must be an integer',
        (v: string | number) => Number(v) >= MIN_DENSITY_REFERENCE || `Density reference must be greater than ${MIN_DENSITY_REFERENCE}`,
        (v: string | number) => Number(v) <= MAX_DENSITY_REFERENCE || `Density reference must be lower than ${MAX_DENSITY_REFERENCE}`
    ],
    [
        (v: string | number) => (!isNaN(Number(v)) && Number.isInteger(Number(v))) || 'Fluid velocity must be an integer',
        (v: string | number) => Number(v) >= MIN_PREASURE_CONSTANT || `Preasure constant must be greater than ${MIN_PREASURE_CONSTANT}`,
        (v: string | number) => Number(v) <= MAX_PREASURE_CONSTANT || `Preasure constant must be lower than ${MAX_PREASURE_CONSTANT}`
    ],
    [
        (v: string | number) => (!isNaN(Number(v)) && Number.isInteger(Number(v))) || 'Fluid velocity must be an integer',
        (v: string | number) => Number(v) >= MIN_FLUID_VELOCITY || `Fluid velocity must be greater than ${MIN_FLUID_VELOCITY}`,
        (v: string | number) => Number(v) <= MAX_FLUID_VELOCITY || `Fluid velocity must be lower than ${MAX_FLUID_VELOCITY}`
    ]
]

watch(particleSize, () => {
    errorMsgs.value[0] = ''
    snackbars.value[0] = false
    const rulesSet = rules[0]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(particleSize.value)
        if (typeof result === 'string') {
            errorMsgs.value[0] = result
            snackbars.value[0] = true
            break
        }
    }
})

watch(smoothingRadius, () => {
    errorMsgs.value[1] = ''
    snackbars.value[1] = false
    const rulesSet = rules[1]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(smoothingRadius.value)
        if (typeof result === 'string') {
            errorMsgs.value[1] = result
            snackbars.value[1] = true
            break
        }
    }
})

watch(fluidDensity, () => {
    errorMsgs.value[2] = ''
    snackbars.value[2] = false
    const rulesSet = rules[2]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(fluidDensity.value)
        if (typeof result === 'string') {
            errorMsgs.value[2] = result
            snackbars.value[2] = true
            break
        }
    }
})

watch(preasureConstant, () => {
    errorMsgs.value[3] = ''
    snackbars.value[3] = false
    const rulesSet = rules[3]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(preasureConstant.value)
        if (typeof result === 'string') {
            errorMsgs.value[3] = result
            snackbars.value[3] = true
            break
        }
    }
})

watch(fluidVelocity, () => {
    errorMsgs.value[4] = ''
    snackbars.value[4] = false
    const rulesSet = rules[4]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(fluidVelocity.value)
        if (typeof result === 'string') {
            errorMsgs.value[4] = result
            snackbars.value[4] = true
            break
        }
    }
})

function onMouseEnter(index: number) {
    if (errorMsgs.value[index] !== '') {
        snackbars.value[index] = true
    }
}

</script>
  
<style scoped>
.scrollable-card {
    height: 500px !important;
    /* set the height as per your requirement */
    overflow-y: auto;
}

.zero-padding {
    padding: 0px !important;
}

.padding {
    padding: 0px 8px !important;
}
</style>
  