<template>
    <v-card-title>
        Add Custom Mesh
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Loaders</v-label>
        <v-btn class="ma-2" color="primary">
            Load STL model
        </v-btn>
        <v-btn class="ma-2" color="primary">
            Load OBJ model
        </v-btn>
        <v-btn class="ma-2" color="primary">
            Load Draco model
        </v-btn>
        <v-btn class="ma-2 justify-start" color="secondary" variant="outlined" :to="{ name: 'addMeshTool' }">
            <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
            Cancel
        </v-btn>
    </div>
</template>

<script setup lang="ts">

</script>