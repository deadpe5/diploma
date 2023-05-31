<template>
    <v-card-title>
        Add Custom Mesh
    </v-card-title>
    <input id="fileUpload" type="file" hidden multiple @change="onFileChanged">
    <div class="d-flex flex-column mb-6">
        <v-label class="ml-4 mb-2">Loaders</v-label>
        <v-btn class="ma-2" color="primary" @click="onButtonClick(fileTypes.STL)" :disabled="visualisationStore.isLoading">
            Load STL model
        </v-btn>
        <v-btn class="ma-2" color="primary" @click="onButtonClick(fileTypes.OBJ)" :disabled="visualisationStore.isLoading">
            Load OBJ model
        </v-btn>
        <v-btn class="ma-2" color="primary" @click="onButtonClick(fileTypes.glTF)" :disabled="visualisationStore.isLoading">
            Load glTF model
        </v-btn>
        <v-btn class="ma-2 justify-start" color="secondary" :to="{ name: 'addMeshTool' }" :disabled="visualisationStore.isLoading" :loading="visualisationStore.isLoading">
            <v-icon class="v-btn__prepend" icon="mdi-arrow-left" />
            Cancel
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { fileTypes } from '@/constants';
import { useVisualisationStore } from '@/stores/visualisationStore';

const visualisationStore = useVisualisationStore()
let selectedFileFormat: fileTypes

onMounted(() => {
    visualisationStore.deselect()
})

function onButtonClick(fileType: fileTypes) {
    const fileUpload = document.getElementById('fileUpload')
    if (!fileUpload) {
        return
    }
    selectedFileFormat = fileType
    if ([fileTypes.STL, fileTypes.OBJ].includes(fileType)) {
        fileUpload.setAttribute('accept', fileType)
    }
    else {
        fileUpload.removeAttribute('accept')
    }
    fileUpload.click()
}

function onFileChanged(e: any) {
    const file = e.target.files[0]
    if (!file) {
        return
    }

    if ([fileTypes.STL, fileTypes.OBJ].includes(selectedFileFormat)) {
        const url = URL.createObjectURL(file)
        visualisationStore.isLoading = true
        visualisationStore.importMeshFromFile(selectedFileFormat, url)
    }

    if (selectedFileFormat === fileTypes.glTF) {
        console.log(e.target.files)
    }
}
</script>