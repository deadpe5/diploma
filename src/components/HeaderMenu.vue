<template>
  <div class="diploma-header">
    <v-toolbar height="32px" rounded elevation="2" style="padding: 5px 0px">
      <v-btn rounded="lg" size="small" icon @click="changeView('+X')">
        <font-awesome-icon icon="fa-solid fa-cube" size="2xl" />
        <v-tooltip activator="parent" location="bottom" text="+X" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('-X')">
        <font-awesome-icon icon="fa-solid fa-cube" size="2xl" flip="both" />
        <v-tooltip activator="parent" location="bottom" text="-X" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('+Y')">
        <font-awesome-icon icon="fa-solid fa-cube" size="2xl" flip="horizontal" />
        <v-tooltip activator="parent" location="bottom" text="+Y" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('-Y')">
        <font-awesome-icon icon="fa-solid fa-cube" size="2xl" flip="vertical" />
        <v-tooltip activator="parent" location="bottom" text="-Y" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('+Z')">
        <v-icon size="22px">
          <TopFilledCubeIcon />
        </v-icon>
        <v-tooltip activator="parent" location="bottom" text="+Z" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('-Z')">
        <v-icon size="22px" style="transform: rotate(180deg)">
          <TopFilledCubeIcon />
        </v-icon>
        <v-tooltip activator="parent" location="bottom" text="-Z" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="changeView('XYZ')">
        <v-icon size="22px">
          <OutlineCubeIcon />
        </v-icon>
        <v-tooltip activator="parent" location="bottom" text="Isometric View" />
      </v-btn>

      <v-btn rounded="lg" size="small" icon @click="zoomToFit">
        <font-awesome-icon icon="fa-solid fa-expand" size="2xl" />
        <v-tooltip activator="parent" location="bottom" text="Zoom to Fit" />
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
import OutlineCubeIcon from './Icons/OutlineCubeIcon.vue'
import TopFilledCubeIcon from './Icons/TopFilledCubeIcon.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useVisualisationStore } from '@/stores/visualisationStore'
const visualisationStore = useVisualisationStore()

function changeView(view: string) {
  visualisationStore.changeView(view)
}

function zoomToFit() {
  visualisationStore.zoomToFit()
}
</script>

<style>
.diploma-header {
  z-index: 1;
  width: fit-content;
  max-width: fit-content;
  margin: 0 auto;
  margin-top: 10px;
}
</style>
