<template>
    <v-card-title>
        Add Torus Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Dimensions</v-label>
        <v-text-field label="Diameter" variant="solo" class="ml-4 mr-4"
            :rules="[v => isValid(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        <v-text-field label="Thickness" variant="solo" class="ml-4 mr-4"
            :rules="[v => isValid(v, 0) || 'Must be a number and greater than 0']"></v-text-field>
        
        <v-label class="ml-4 mb-2">Geometry</v-label>
        <v-text-field label="Segments count" variant="solo" class="ml-4 mr-4"
            :rules="[v => isValid(v, 3) || 'Must be a number and greater than 3']"></v-text-field>

        <div class="d-flex flex-row">
            <v-btn class="ma-2 justify-start" color="secondary" variant="outlined" :to="{ name: 'addMeshTool' }">
                <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
                Cancel
            </v-btn>

            <!-- TODO add mesh to scene -->
            <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'root' }">
                <v-icon class="v-btn__prepend" icon="mdi-check" />
                Confirm
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">

function isValid(value: string, minValue: number): boolean {
    return !isNaN(Number(value)) && (Number(value) > minValue)
}

</script>