
<script setup lang="ts">
const props = defineProps<{
  modelValue: any[]
  puestoId: number | null
  disabled?: boolean
  editando?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const { get, post } = useClienteRequest()

const disponibles = ref<any[]>([])
const requisitoSeleccionado = ref<number | null>(null)
const busqueda = ref('')

const cargando = ref(false)
const cargandoPuesto = ref(false)
const error = ref('')

const dialogoCrear = ref(false)
const guardandoNuevo = ref(false)
const cargandoTipos = ref(false)
const errorCrear = ref('')

const tiposRequisitos = ref<any[]>([])

const nuevoRequisito = reactive({
  tipo_requisito_id: null as number | null,
  nombre: '',
  descripcion: '',
})

let temporizador: ReturnType<typeof setTimeout> | null = null
let consultaActual = 0
let consultaPuestoActual = 0

const requisitos = computed(() => props.modelValue ?? [])

const requisitosDisponibles = computed(() =>
    disponibles.value.filter(
        requisito => !requisitos.value.some(
            seleccionado => Number(seleccionado.id) === Number(requisito.id),
        ),
    ),
)

const totalObligatorios = computed(() =>
    requisitos.value.filter(requisito => requisito.obligatorio).length,
)

function obtenerRegistros(respuesta: any): any[] {
  const contenido = respuesta.data

  if (Array.isArray(contenido)) {
    return contenido
  }

  if (Array.isArray(contenido?.data)) {
    return contenido.data
  }

  if (Array.isArray(contenido?.data?.data)) {
    return contenido.data.data
  }

  return []
}

function actualizarRequisitos(nuevos: any[]) {
  emit(
      'update:modelValue',
      nuevos.map((requisito, index) => ({
        ...requisito,
        orden: index + 1,
      })),
  )
}

function agregarRequisito(id: number | null) {
  if (id == null || props.disabled || cargandoPuesto.value) return

  const requisito = disponibles.value.find(
      item => Number(item.id) === Number(id),
  )

  if (!requisito) return

  const existe = requisitos.value.some(
      item => Number(item.id) === Number(id),
  )

  if (!existe) {
    actualizarRequisitos([
      ...requisitos.value,
      {
        id: requisito.id,
        nombre: requisito.nombre,
        descripcion: requisito.descripcion,
        obligatorio: true,
        orden: requisitos.value.length + 1,
      },
    ])
  }

  requisitoSeleccionado.value = null
  busqueda.value = ''
}

function eliminarRequisito(id: number) {
  if (props.disabled || cargandoPuesto.value) return

  actualizarRequisitos(
      requisitos.value.filter(
          requisito => Number(requisito.id) !== Number(id),
      ),
  )
}

function cambiarObligatorio(id: number, obligatorio: boolean) {
  if (props.disabled || cargandoPuesto.value) return

  actualizarRequisitos(
      requisitos.value.map(requisito =>
          Number(requisito.id) === Number(id)
              ? { ...requisito, obligatorio }
              : requisito,
      ),
  )
}

async function buscarRequisitos() {
  const consulta = ++consultaActual

  cargando.value = true
  error.value = ''

  try {
    const parametros = new URLSearchParams()
    const search = String(busqueda.value ?? '').trim()

    if (search) {
      parametros.set('search', search)
    }

    parametros.set('per_page', '30')

    const respuesta = await get(
        `/api/requisitos?${parametros.toString()}`,
    )

    if (consulta !== consultaActual) return

    disponibles.value = obtenerRegistros(respuesta).filter(
        (requisito: any) =>
            requisito.estado === true
            || requisito.estado === 1,
    )
  }
  catch (exception: any) {
    if (consulta !== consultaActual) return

    error.value = exception.response?.data?.message
        || 'No fue posible consultar los requisitos.'
  }
  finally {
    if (consulta === consultaActual) {
      cargando.value = false
    }
  }
}

async function cargarRequisitosPuesto(puestoId: number) {
  const consulta = ++consultaPuestoActual

  cargandoPuesto.value = true
  error.value = ''

  try {
    const respuesta = await get(
        `/api/puestos/requisitos/${puestoId}`,
    )

    if (
        consulta !== consultaPuestoActual
        || Number(props.puestoId) !== Number(puestoId)
    ) return

    const registros = obtenerRegistros(respuesta)

    actualizarRequisitos(
        registros.map((requisito: any) => ({
          id: requisito.id,
          nombre: requisito.nombre,
          descripcion: requisito.descripcion,
          obligatorio: Boolean(requisito.pivot?.obligatorio),
          orden: requisito.pivot?.orden,
        })),
    )
  }
  catch (exception: any) {
    if (consulta !== consultaPuestoActual) return

    error.value = exception.response?.data?.message
        || 'No fue posible obtener los requisitos del puesto.'
  }
  finally {
    if (consulta === consultaPuestoActual) {
      cargandoPuesto.value = false
    }
  }
}

async function obtenerTiposRequisitos() {
  cargandoTipos.value = true
  errorCrear.value = ''

  try {
    const respuesta = await get('/api/tipos-requisitos')

    tiposRequisitos.value = obtenerRegistros(respuesta).filter(
        (tipo: any) =>
            tipo.estado === true
            || tipo.estado === 1,
    )
  }
  catch (exception: any) {
    errorCrear.value = exception.response?.data?.message
        || 'No fue posible obtener los tipos de requisitos.'
  }
  finally {
    cargandoTipos.value = false
  }
}

async function abrirCrearRequisito() {
  if (!props.puestoId || props.disabled || cargandoPuesto.value) return

  nuevoRequisito.tipo_requisito_id = null
  nuevoRequisito.nombre = String(busqueda.value ?? '').trim()
  nuevoRequisito.descripcion = ''

  errorCrear.value = ''
  dialogoCrear.value = true

  if (!tiposRequisitos.value.length) {
    await obtenerTiposRequisitos()
  }
}

function cerrarCrearRequisito() {
  if (guardandoNuevo.value) return

  dialogoCrear.value = false
  errorCrear.value = ''
}

async function crearRequisito() {
  if (
      guardandoNuevo.value
      || !nuevoRequisito.tipo_requisito_id
      || !nuevoRequisito.nombre.trim()
      || props.disabled
      || !props.puestoId
  ) return

  guardandoNuevo.value = true
  errorCrear.value = ''

  try {
    const respuesta = await post('/api/requisitos', {
      tipo_requisito_id: nuevoRequisito.tipo_requisito_id,
      nombre: nuevoRequisito.nombre.trim(),
      descripcion: nuevoRequisito.descripcion.trim() || null,
      estado: true,
    })

    const requisito = respuesta.data?.data ?? respuesta.data

    if (!requisito?.id) {
      throw new Error('La API no devolvió el requisito creado.')
    }

    const existe = requisitos.value.some(
        item => Number(item.id) === Number(requisito.id),
    )

    if (!existe) {
      actualizarRequisitos([
        ...requisitos.value,
        {
          id: requisito.id,
          nombre: requisito.nombre,
          descripcion: requisito.descripcion,
          obligatorio: true,
          orden: requisitos.value.length + 1,
        },
      ])
    }

    dialogoCrear.value = false
    requisitoSeleccionado.value = null
    busqueda.value = ''

    await buscarRequisitos()
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    errorCrear.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || exception.message
        || 'No fue posible crear el requisito.'
  }
  finally {
    guardandoNuevo.value = false
  }
}

// Buscar requisitos mientras el usuario escribe.
watch(busqueda, () => {
  if (temporizador) {
    clearTimeout(temporizador)
  }

  temporizador = setTimeout(() => {
    buscarRequisitos()
  }, 350)
})

// Cargar automáticamente los requisitos al cambiar de puesto.
watch(
    () => props.puestoId,
    async (nuevoPuestoId, anteriorPuestoId) => {
      ++consultaPuestoActual

      if (!nuevoPuestoId) {
        cargandoPuesto.value = false

        if (anteriorPuestoId != null) {
          actualizarRequisitos([])
        }

        return
      }

      // Al abrir una vacante para editar, el formulario padre
      // ya carga sus requisitos guardados desde la API.
      // No debemos sustituirlos por la plantilla del puesto.
      if (props.editando && anteriorPuestoId == null) {
        cargandoPuesto.value = false
        return
      }

      await cargarRequisitosPuesto(Number(nuevoPuestoId))
    },
)

onMounted(() => {
  buscarRequisitos()

  // En creación, si el puesto ya viene seleccionado,
  // cargar su plantilla automáticamente.
  if (!props.editando && props.puestoId) {
    cargarRequisitosPuesto(Number(props.puestoId))
  }
})

onUnmounted(() => {
  if (temporizador) {
    clearTimeout(temporizador)
  }

  ++consultaActual
  ++consultaPuestoActual
})
</script>

<template>
  <VCard rounded="lg" elevation="1" class="mb-5">
    <VCardTitle
        class="d-flex align-center justify-space-between flex-wrap ga-3 pa-5"
    >
      <div class="d-flex align-center ga-2">
        <VIcon
            icon="mdi-clipboard-list-outline"
            color="primary"
        />

        <span>Requisitos de la vacante</span>

        <VChip
            color="primary"
            variant="tonal"
            size="small"
        >
          {{ requisitos.length }}
        </VChip>
      </div>

      <VBtn
          color="primary"
          prepend-icon="mdi-plus"
          :disabled="disabled || !puestoId || cargandoPuesto"
          @click="abrirCrearRequisito"
      >
        Crear requisito
      </VBtn>
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <VAlert
          v-if="!puestoId"
          type="info"
          variant="tonal"
      >
        Selecciona primero un puesto de trabajo para gestionar sus requisitos.
      </VAlert>

      <template v-else>
        <VAlert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
        >
          {{ error }}
        </VAlert>

        <VProgressLinear
            v-if="cargandoPuesto"
            indeterminate
            color="primary"
            class="mb-4"
        />

        <div class="mb-4">
          <div class="text-subtitle-1 font-weight-medium">
            Seleccionar requisitos
          </div>

          <div class="text-body-2 text-medium-emphasis">
            Busca requisitos existentes o crea uno nuevo.
            Los requisitos base se cargan automáticamente al seleccionar el puesto.
          </div>
        </div>

        <VAutocomplete
            v-model="requisitoSeleccionado"
            v-model:search="busqueda"
            :items="requisitosDisponibles"
            item-title="nombre"
            item-value="id"
            label="Buscar requisito"
            placeholder="Escribe el nombre del requisito"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            :loading="cargando"
            :disabled="disabled || cargandoPuesto"
            no-filter
            clearable
            no-data-text="No se encontraron requisitos"
            @update:model-value="agregarRequisito"
        />

        <VAlert
            v-if="!cargandoPuesto && !requisitos.length"
            type="info"
            variant="tonal"
            class="mb-4"
        >
          Esta vacante todavía no tiene requisitos seleccionados.
        </VAlert>

        <div
            v-for="(requisito, index) in requisitos"
            :key="requisito.id"
            class="requisito-seleccionado mb-3"
        >
          <div class="d-flex align-start ga-3">
            <VAvatar
                color="primary"
                variant="tonal"
                size="30"
            >
              {{ index + 1 }}
            </VAvatar>

            <div class="flex-grow-1">
              <div class="font-weight-medium">
                {{ requisito.nombre }}
              </div>

              <div
                  v-if="requisito.descripcion"
                  class="text-body-2 text-medium-emphasis mt-1"
              >
                {{ requisito.descripcion }}
              </div>

              <VCheckbox
                  :model-value="Boolean(requisito.obligatorio)"
                  label="Requisito obligatorio"
                  color="primary"
                  density="compact"
                  hide-details
                  class="mt-2"
                  :disabled="disabled || cargandoPuesto"
                  @update:model-value="
                  cambiarObligatorio(requisito.id, Boolean($event))
                "
              />
            </div>

            <VBtn
                icon="mdi-delete-outline"
                color="error"
                variant="text"
                size="small"
                :disabled="disabled || cargandoPuesto"
                @click="eliminarRequisito(requisito.id)"
            />
          </div>
        </div>

        <div
            v-if="requisitos.length"
            class="text-caption text-medium-emphasis mt-3"
        >
          {{ totalObligatorios }} obligatorios de
          {{ requisitos.length }} requisitos seleccionados.
        </div>
      </template>
    </VCardText>
  </VCard>

  <!-- Modal de creación de requisitos -->
  <VDialog
      v-model="dialogoCrear"
      max-width="600"
      persistent
  >
    <VCard rounded="lg">
      <VCardTitle class="pa-5">
        <VIcon
            icon="mdi-plus-circle-outline"
            color="primary"
            class="mr-2"
        />
        Crear nuevo requisito
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <VAlert
            v-if="errorCrear"
            type="error"
            variant="tonal"
            class="mb-4"
        >
          {{ errorCrear }}
        </VAlert>

        <VSelect
            v-model="nuevoRequisito.tipo_requisito_id"
            :items="tiposRequisitos"
            item-title="nombre"
            item-value="id"
            label="Tipo de requisito *"
            variant="outlined"
            density="comfortable"
            :loading="cargandoTipos"
            :disabled="guardandoNuevo"
            class="mb-3"
            no-data-text="No hay tipos de requisitos disponibles"
        />

        <VTextField
            v-model="nuevoRequisito.nombre"
            label="Nombre del requisito *"
            placeholder="Ej. Experiencia en SQL Server"
            variant="outlined"
            density="comfortable"
            maxlength="150"
            :disabled="guardandoNuevo"
            class="mb-3"
        />

        <VTextarea
            v-model="nuevoRequisito.descripcion"
            label="Descripción"
            placeholder="Describe el requisito..."
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
            :disabled="guardandoNuevo"
        />
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
            variant="text"
            :disabled="guardandoNuevo"
            @click="cerrarCrearRequisito"
        >
          Cancelar
        </VBtn>

        <VBtn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="guardandoNuevo"
            :disabled="
            cargandoTipos
            || !nuevoRequisito.tipo_requisito_id
            || !nuevoRequisito.nombre.trim()
          "
            @click="crearRequisito"
        >
          Guardar y agregar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.requisito-seleccionado {
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.25);
  border-radius: 10px;
}
</style>
