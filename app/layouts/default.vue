<script setup lang="ts">
import AppSidebar from '../layouts/AppSidebar.vue'
import AppHeader from '../layouts/AppHeader.vue'

const sidebarAbierto = ref(true)
</script>

<template>
  <VLayout>
    <AppSidebar v-model:abierto="sidebarAbierto" />

    <AppHeader
        @toggle-sidebar="sidebarAbierto = !sidebarAbierto"
    />

    <VMain>
      <slot />
    </VMain>
  </VLayout>
</template>