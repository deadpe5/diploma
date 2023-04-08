<template>
    <v-card-title>
        Add Mesh Tool
    </v-card-title>
    <div class="d-flex flex-column mb-6">
        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addBoxMesh' }">
            <v-icon class="v-btn__prepend" icon="mdi-cube" />
            Add Box
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addSphereMesh' }">
            <v-icon class="v-btn__prepend" icon="mdi-sphere" />
            Add Sphere
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addCylinderMesh' }">
            <v-icon class="v-btn__prepend" icon="mdi-cylinder" />
            Add Cylinder
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addTorusMesh' }">
            <v-icon class="v-btn__prepend" icon="mdi-circle-double" />
            Add Torus
        </v-btn>

        <v-btn class="ma-2 justify-start" color="primary" :to="{ name: 'addCustomMesh' }">
            <v-icon class="v-btn__prepend" icon="mdi-triforce" />
            Add Custom Mesh
        </v-btn>

        <v-btn class="ma-2 justify-start" color="secondary" :to="{ name: 'root' }">
            <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
            Back
        </v-btn>
    </div>
</template>