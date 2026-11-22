
<script setup lang="ts">
const auth = useAuthStore()

const abierto = defineModel<boolean>('abierto', {
  default: true,
})

const esCandidato = computed(() => auth.tieneRol('CANDIDATO'))
const puedeVerVacantes = computed(() => auth.tienePermiso('Ver vacantes'))
const puedeCrearVacantes = computed(() => auth.tienePermiso('Crear vacantes'))
const puedeVerUnidades = computed(() => auth.tienePermiso('Ver unidades'))

const nombreUsuario = computed(() => [
  auth.usuario?.primer_nombre,
  auth.usuario?.primer_apellido,
].filter(Boolean).join(' '))
</script>

<template>
  <VNavigationDrawer
      v-model="abierto"
      width="265"
  >
    <div class="pa-5">
      <div class="d-flex align-center ga-3">
        <VAvatar color="primary" variant="tonal" rounded="lg">
          <VIcon icon="mdi-account-group-outline" />
        </VAvatar>

        <div>
          <div class="text-h6 font-weight-bold">
            TalentHub
          </div>
          <div class="text-caption text-medium-emphasis">
            Cooperativa Guayacán
          </div>
        </div>
      </div>
    </div>

    <VDivider />

    <VList nav density="comfortable" class="pa-3">
      <VListSubheader>
        PRINCIPAL
      </VListSubheader>

      <VListItem
          to="/"
          title="Inicio"
          prepend-icon="mdi-view-dashboard-outline"
          rounded="lg"
          color="primary"
      />

      <VListItem
          v-if="puedeVerVacantes"
          to="/vacantes"
          title="Vacantes"
          prepend-icon="mdi-briefcase-outline"
          rounded="lg"
          color="primary"
      />

      <VListItem
          v-if="esCandidato"
          title="Mi perfil"
          prepend-icon="mdi-account-outline"
          rounded="lg"
          disabled
      />

      <VDivider class="my-3" />

      <VListSubheader>
        GESTIÓN DE RECLUTAMIENTO
      </VListSubheader>


      <VListItem
          v-if="puedeCrearVacantes"
          title="Administrar vacantes"
          prepend-icon="mdi-file-document-edit-outline"
          rounded="lg"
          disabled
      />

      <VListItem
          v-if="!esCandidato"
          title="Candidatos"
          prepend-icon="mdi-account-multiple-outline"
          rounded="lg"
          disabled
      />

      <VListItem
          v-if="!esCandidato"
          title="Postulaciones"
          prepend-icon="mdi-clipboard-text-outline"
          rounded="lg"
          disabled
      />

      <VListItem
          v-if="!esCandidato"
          title="Entrevistas"
          prepend-icon="mdi-calendar-account-outline"
          rounded="lg"
          disabled
      />

      <VListItem
          v-if="puedeVerUnidades"
          to="/unidades"
          title="Unidades"
          prepend-icon="mdi-domain"
          rounded="lg"
          color="primary"
      />
    </VList>

    <template #append>
      <VDivider />

      <VListItem
          :title="nombreUsuario"
          :subtitle="auth.roles.join(', ')"
          prepend-icon="mdi-account-circle-outline"
          class="ma-3"
      />
    </template>
  </VNavigationDrawer>
</template>
