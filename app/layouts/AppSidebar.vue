<script setup lang="ts">
const auth = useAuthStore()

const abierto = defineModel<boolean>('abierto', {
  default: true,
})

// Permisos de reclutamiento
const puedeVerVacantes = computed(() =>
    auth.tienePermiso('Ver vacantes'),
)

const puedeVerPostulaciones = computed(() =>
    auth.tienePermiso('Ver postulaciones'),
)

const puedeVerCandidatos = computed(() =>
    auth.tienePermiso('Ver candidatos'),
)

// Permisos del portal del candidato
const puedeVerOportunidades = computed(() =>
    auth.tienePermiso('Ver oportunidades laborales'),
)

const puedeVerMisPostulaciones = computed(() =>
    auth.tienePermiso('Ver mis postulaciones'),
)

const puedeVerPerfilCandidato = computed(() =>
    auth.tienePermiso('Ver perfil candidato'),
)

// Administración
const puedeVerUnidades = computed(() =>
    auth.tienePermiso('Ver unidades'),
)

// El portal del candidato se muestra solo al rol CANDIDATO.
const esCandidato = computed(() =>
    auth.tieneRol('CANDIDATO'),
)

const mostrarReclutamiento = computed(() =>
    puedeVerVacantes.value
    || puedeVerPostulaciones.value
    || puedeVerCandidatos.value,
)

const mostrarPortalCandidato = computed(() =>
        esCandidato.value
        && (
            puedeVerOportunidades.value
            || puedeVerMisPostulaciones.value
            || puedeVerPerfilCandidato.value
        ),
)

const nombreUsuario = computed(() =>
    [
      auth.usuario?.primer_nombre,
      auth.usuario?.primer_apellido,
    ].filter(Boolean).join(' ') || 'Usuario',
)

const rolesUsuario = computed(() =>
    auth.roles?.join(', ') || 'Sin rol asignado',
)
</script>

<template>
  <VNavigationDrawer
      v-model="abierto"
      width="265"
  >
    <!-- Identidad de la aplicación -->
    <div class="pa-5">
      <div class="d-flex align-center ga-3">
        <VAvatar
            color="primary"
            variant="tonal"
            rounded="lg"
            size="48"
        >
          <VIcon
              icon="mdi-account-group-outline"
              size="26"
          />
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

    <VList
        nav
        density="comfortable"
        class="pa-3"
    >
      <!-- Principal -->
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

      <!-- Gestión de reclutamiento -->
      <template v-if="mostrarReclutamiento">
        <VDivider class="my-3" />

        <VListSubheader>
          GESTIÓN DE RECLUTAMIENTO
        </VListSubheader>

        <VListItem
            v-if="puedeVerVacantes"
            to="/vacantes"
            title="Gestión de vacantes"
            prepend-icon="mdi-briefcase-outline"
            rounded="lg"
            color="primary"
        />

        <VListItem
            v-if="puedeVerPostulaciones"
            to="/postulaciones"
            title="Postulaciones"
            prepend-icon="mdi-clipboard-text-outline"
            rounded="lg"
            color="primary"
        />

        <VListItem
            v-if="puedeVerCandidatos"
            title="Candidatos"
            prepend-icon="mdi-account-multiple-outline"
            rounded="lg"
            disabled
        />
      </template>

      <!-- Portal del candidato -->
      <template v-if="mostrarPortalCandidato">
        <VDivider class="my-3" />

        <VListSubheader>
          MI BÚSQUEDA DE EMPLEO
        </VListSubheader>

        <VListItem
            v-if="puedeVerOportunidades"
            to="/oportunidades"
            title="Oportunidades laborales"
            prepend-icon="mdi-briefcase-search-outline"
            rounded="lg"
            color="primary"
        />

        <VListItem
            v-if="puedeVerMisPostulaciones"
            to="/mis-postulaciones"
            title="Mis postulaciones"
            prepend-icon="mdi-file-document-check-outline"
            rounded="lg"
            color="primary"
            disabled
        />

        <VDivider
            v-if="puedeVerPerfilCandidato"
            class="my-3"
        />

        <VListSubheader v-if="puedeVerPerfilCandidato">
          MI CUENTA
        </VListSubheader>

        <VListItem
            v-if="puedeVerPerfilCandidato"
            to="/candidatos/mi-perfil"
            title="Mi perfil"
            prepend-icon="mdi-account-outline"
            rounded="lg"
            color="primary"
        />
      </template>

      <!-- Administración -->
      <template v-if="puedeVerUnidades">
        <VDivider class="my-3" />

        <VListSubheader>
          ADMINISTRACIÓN
        </VListSubheader>

        <VListItem
            to="/unidades"
            title="Unidades"
            prepend-icon="mdi-domain"
            rounded="lg"
            color="primary"
        />
      </template>
    </VList>

    <!-- Usuario autenticado -->
    <template #append>
      <VDivider />

      <VListItem
          :title="nombreUsuario"
          :subtitle="rolesUsuario"
          prepend-icon="mdi-account-circle-outline"
          class="ma-3"
      />
    </template>
  </VNavigationDrawer>
</template>
