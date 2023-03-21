<template>
    <div class="diploma-toolbar">
        <v-card min-width="250px">
            <v-card-title>
                <p class="text-h4 text--primary">
                    Tools
                </p>
            </v-card-title>
            <div class="d-flex flex-column mb-6">
                <v-btn class="ma-2 pa-2 justify-start" color="primary">
                    <v-icon class="v-btn__prepend" icon="mdi-cube" />
                    Add Mesh
                </v-btn>
                <v-btn class="ma-2 pa-2 justify-start" color="primary">
                    <v-icon class="v-btn__prepend" icon="mdi-water" />
                    Add Fluid
                </v-btn>
                <v-btn class="ma-2 pa-2 justify-start" color="primary">
                    <v-icon class="v-btn__prepend" icon="mdi-rotate-orbit" />
                    Rotate
                </v-btn>
                <v-btn class="ma-2 pa-2 justify-start" color="primary">
                    <v-icon class="v-btn__prepend" icon="mdi-transition" />
                    Move
                </v-btn>
            </div>
        </v-card>
    </div>
</template>
<script setup lang="ts">

</script>
<style>
.diploma-toolbar {
    z-index: 1;
    width: fit-content;
    max-width: fit-content;
    display: flex;
    margin-left: 10px;
    margin-top: 20px;
    position: absolute;
}

.d-flex.flex-column.mb-6 .v-btn__content {
    padding: 0 8px;
}
</style>
  