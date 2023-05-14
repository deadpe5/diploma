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
            @mouseover="onMouseEnter(0)" v-model="particleSize" class="padding8">
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
            @mouseover="onMouseEnter(1)" v-model="smoothingRadius" class="padding8">
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
        <v-slider thumb-label :min="MIN_DENSITY_REFERENCE" :max="MAX_DENSITY_REFERENCE" :step="DENSITY_REFERENCE_STEP"
            @mouseover="onMouseEnter(2)" v-model="densityReference" class="padding8">
            <template v-slot:append>
                <v-text-field v-model="densityReference" type="number" style="width: 100px" density="compact" hide-details
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

        <div class="text-caption ml-4">Pressure constant</div>
        <v-slider thumb-label :min="MIN_PRESSURE_CONSTANT" :max="MAX_PRESSURE_CONSTANT" :step="PRESSURE_CONSTANT_STEP"
            @mouseover="onMouseEnter(3)" v-model="pressureConstant" class="padding8">
            <template v-slot:append>
                <v-text-field v-model="pressureConstant" type="number" style="width: 100px" density="compact" hide-details
                    :rules="rules[3]" variant="outlined" :step="PRESSURE_CONSTANT_STEP"></v-text-field>
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
        <v-slider thumb-label :min="MIN_FLUID_VELOCITY" :max="MAX_FLUID_VELOCITY" :step="FLUID_VELOCITY_STEP"
            @mouseover="onMouseEnter(4)" v-model="fluidVelocity" class="padding8">
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
    </v-container>
    <v-container class="padding16">
        <v-btn width="100%" color="primary" @click="restoreDefault">Restore default</v-btn>
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
    MIN_PRESSURE_CONSTANT,
    MAX_PRESSURE_CONSTANT,
    PRESSURE_CONSTANT_STEP,
    MIN_FLUID_VELOCITY,
    MAX_FLUID_VELOCITY,
    FLUID_VELOCITY_STEP,
    DEFAULT_PARTICLE_SIZE,
    changableFluidParams,
    DEFAULT_SMOOTHING_RADIUS,
    DEFAULT_DENSITY_REFERENCE,
    DEFAULT_PRESSURE_CONSTANT,
    DEFAULT_FLUID_VELOCITY,
} from '../../constants'
import { useVisualisationStore } from '@/stores/visualisationStore';
const visualisationStore = useVisualisationStore()

const boundingBoxHeight = ref(1)
const boundingBoxWidth = ref(1)
const boundingBoxDepth = ref(1)

const particleSize = ref(DEFAULT_PARTICLE_SIZE)
const smoothingRadius = ref(DEFAULT_SMOOTHING_RADIUS)
const densityReference = ref(DEFAULT_DENSITY_REFERENCE)
const pressureConstant = ref(DEFAULT_PRESSURE_CONSTANT)
const fluidVelocity = ref(DEFAULT_FLUID_VELOCITY)

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
        (v: string | number) => Number(v) >= MIN_PRESSURE_CONSTANT || `Pressure constant must be greater than ${MIN_PRESSURE_CONSTANT}`,
        (v: string | number) => Number(v) <= MAX_PRESSURE_CONSTANT || `Pressure constant must be lower than ${MAX_PRESSURE_CONSTANT}`
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

    if (!snackbars.value[0]) {
        visualisationStore.changeFluidParam(changableFluidParams.particleSize, particleSize.value)
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

    if (!snackbars.value[1]) {
        visualisationStore.changeFluidParam(changableFluidParams.smoothingRadius, smoothingRadius.value)
    }
})

watch(densityReference, () => {
    errorMsgs.value[2] = ''
    snackbars.value[2] = false
    const rulesSet = rules[2]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(densityReference.value)
        if (typeof result === 'string') {
            errorMsgs.value[2] = result
            snackbars.value[2] = true
            break
        }
    }

    if (!snackbars.value[2]) {
        visualisationStore.changeFluidParam(changableFluidParams.densityReference, densityReference.value)
    }
})

watch(pressureConstant, () => {
    errorMsgs.value[3] = ''
    snackbars.value[3] = false
    const rulesSet = rules[3]
    for (let i = 0; i < rulesSet.length; i++) {
        const rule = rulesSet[i]
        const result = rule(pressureConstant.value)
        if (typeof result === 'string') {
            errorMsgs.value[3] = result
            snackbars.value[3] = true
            break
        }
    }

    if (!snackbars.value[3]) {
        visualisationStore.changeFluidParam(changableFluidParams.pressureConstant, pressureConstant.value)
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

    if (!snackbars.value[4]) {
        visualisationStore.changeFluidParam(changableFluidParams.maxVelocity, fluidVelocity.value)
    }
})

function onMouseEnter(index: number) {
    if (errorMsgs.value[index] !== '') {
        snackbars.value[index] = true
    }
}

function restoreDefault() {
    particleSize.value = DEFAULT_PARTICLE_SIZE
    smoothingRadius.value = DEFAULT_SMOOTHING_RADIUS
    densityReference.value = DEFAULT_DENSITY_REFERENCE
    pressureConstant.value = DEFAULT_PRESSURE_CONSTANT
    fluidVelocity.value = DEFAULT_FLUID_VELOCITY
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

.padding8 {
    padding: 0px 8px !important;
}

.padding16 {
    padding: 0px 16px !important;
}
</style>
  