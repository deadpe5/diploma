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
        <v-slider class="ml-4 mr-4" thumb-label></v-slider>

        <div class="text-caption ml-4">Smoothing radius</div>
        <v-slider class="ml-4 mr-4" thumb-label></v-slider>

        <div class="text-caption ml-4">Fluid density</div>
        <v-slider class="ml-4 mr-4" thumb-label></v-slider>

        <div class="text-caption ml-4">Preasure constant</div>
        <v-slider class="ml-4 mr-4" thumb-label></v-slider>

        <div class="text-caption ml-4">Max velocity</div>
        <v-slider class="ml-4 mr-4" thumb-label></v-slider>

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
import { ref } from 'vue';

const boundingBoxHeight = ref(1)
const boundingBoxWidth = ref(1)
const boundingBoxDepth = ref(1)
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
</style>
  