<template>
    <div class="diploma-toolbar">
        <v-card min-width="300px" elevation="2">
            <router-view></router-view>
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
  