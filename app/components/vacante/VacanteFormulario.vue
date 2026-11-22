<script setup lang="ts">
const props = defineProps<{
  vacante?: any
  guardando?: boolean
}>()

const emit = defineEmits<{
  guardar: [datos: any]
}>()

const {get} = useClienteRequest()

const formulario = ref()
const unidades = ref<any[]>([])
const cargandoUnidades = ref(false)
const errorUnidades = ref('')

const editando = computed(() => !!props.vacante?.id)

const datos = reactive({
  titulo: '',
  unidad_id: null as number | null,
  descripcion: '',
  cantidad_plazas: 1,
  salario_minimo: null as number | null,
  salario_maximo: null as number | null,
  modalidad: '',
  tipo_contrato: '',
  nivel_experiencia: '',
  fecha_inicio: '',
  fecha_limite: '',
})

const modalidades = [
  {title: 'Presencial', value: 'PRESENCIAL'},
  {title: 'Híbrida', value: 'HIBRIDA'},
  {title: 'Remota', value: 'REMOTA'},
]

const tiposContrato = [
  {title: 'Tiempo completo', value: 'TIEMPO_COMPLETO'},
  {title: 'Medio tiempo', value: 'MEDIO_TIEMPO'},
  {title: 'Temporal', value: 'TEMPORAL'},
  {title: 'Por contrato', value: 'POR_CONTRATO'},
]

const nivelesExperiencia = [
  {title: 'Sin experiencia', value: 'SIN_EXPERIENCIA'},
  {title: 'Junior', value: 'JUNIOR'},
  {title: 'Intermedio', value: 'INTERMEDIO'},
  {title: 'Senior', value: 'SENIOR'},
]


const reglas = {
  requerido: (valor: any) =>
      (valor !== null
          && valor !== undefined
          && String(valor).trim() !== '')
      || 'Este campo es obligatorio.',

  maximo: (valor: string, cantidad: number) =>
      !valor
      || valor.length <= cantidad
      || `Máximo ${cantidad} caracteres.`,

  plazas: (valor: any) =>
      (valor !== null
          && valor !== ''
          && Number.isInteger(Number(valor))
          && Number(valor) >= 1)
      || 'Ingrese un número entero mayor a cero.',

  salario: (valor: any) =>
      valor === null
      || valor === ''
      || (Number.isFinite(Number(valor)) && Number(valor) >= 0)
      || 'Ingrese un salario válido.',

  salarioMaximo: (valor: any) =>
      valor === null
      || valor === ''
      || datos.salario_minimo === null
      || datos.salario_minimo === ('' as any)
      || Number(valor) >= Number(datos.salario_minimo)
      || 'El salario máximo debe ser mayor o igual al mínimo.',

  fechaLimite: (valor: string) =>
      !valor
      || !datos.fecha_inicio
      || valor >= datos.fecha_inicio
      || 'La fecha límite no puede ser anterior a la fecha de inicio.',
}

function fechaInput(fecha: string | null | undefined) {
  return fecha ? String(fecha).substring(0, 10) : ''
}

function numeroOpcional(valor: any) {
  return valor === null || valor === undefined || valor === ''
      ? null
      : Number(valor)
}

function cargarFormulario(vacante?: any) {
  datos.titulo = vacante?.titulo ?? ''
  datos.unidad_id = vacante?.unidad_id == null
      ? null
      : Number(vacante.unidad_id)
  datos.descripcion = vacante?.descripcion ?? ''
  datos.cantidad_plazas = vacante?.cantidad_plazas ?? 1
  datos.salario_minimo = numeroOpcional(vacante?.salario_minimo)
  datos.salario_maximo = numeroOpcional(vacante?.salario_maximo)
  datos.modalidad = vacante?.modalidad ?? ''
  datos.tipo_contrato = vacante?.tipo_contrato ?? ''
  datos.nivel_experiencia = vacante?.nivel_experiencia ?? ''
  datos.fecha_inicio = fechaInput(vacante?.fecha_inicio)
  datos.fecha_limite = fechaInput(vacante?.fecha_limite)
}

watch(
    () => props.vacante,
    cargarFormulario,
    {immediate: true},
)

async function obtenerUnidades() {
  cargandoUnidades.value = true
  errorUnidades.value = ''

  try {
    const respuesta = await get('/api/unidades')

    const registros = Array.isArray(respuesta.data)
        ? respuesta.data
        : respuesta.data?.data ?? []

    unidades.value = registros.filter(
        (unidad: any) =>
            unidad.estado === true
            || unidad.estado === 1,
    )

    // Permite visualizar la unidad actual aunque esté inactiva.
    const unidadActual = props.vacante?.unidad

    if (
        unidadActual
        && !unidades.value.some(
            unidad => Number(unidad.id) === Number(unidadActual.id),
        )
    ) {
      unidades.value.push(unidadActual)
    }
  } catch (exception: any) {
    errorUnidades.value = exception.response?.data?.message
        || 'No fue posible cargar las unidades.'
  } finally {
    cargandoUnidades.value = false
  }
}

async function guardar() {
  if (props.guardando || cargandoUnidades.value || errorUnidades.value) return

  const {valid} = await formulario.value.validate()

  if (!valid) return

  const payload: any = {
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion.trim() || null,
    cantidad_plazas: Number(datos.cantidad_plazas),
    salario_minimo: numeroOpcional(datos.salario_minimo),
    salario_maximo: numeroOpcional(datos.salario_maximo),
    modalidad: datos.modalidad,
    tipo_contrato: datos.tipo_contrato,
    nivel_experiencia: datos.nivel_experiencia,
    fecha_inicio: datos.fecha_inicio || null,
    fecha_limite: datos.fecha_limite || null,
  }

  // En edición, no reenviar la misma unidad si está inactiva.
  if (
      !editando.value
      || Number(datos.unidad_id) !== Number(props.vacante?.unidad_id)
  ) {
    payload.unidad_id = datos.unidad_id
  }

  emit('guardar', payload)
}

onMounted(obtenerUnidades)
</script>

<template>
  <VForm
      ref="formulario"
      @submit.prevent="guardar"
  >
    <VAlert
        v-if="errorUnidades"
        type="error"
        variant="tonal"
        class="mb-4"
    >
      {{ errorUnidades }}
    </VAlert>

    <VCard rounded="lg" elevation="1" class="mb-5">
      <VCardTitle class="pa-5">
        <VIcon icon="mdi-briefcase-outline" color="primary" class="mr-2"/>
        Información general
      </VCardTitle>

      <VDivider/>

      <VCardText class="pa-5">
        <VRow>
          <VCol cols="12">
            <VTextField
                v-model="datos.titulo"
                label="Título de la vacante *"
                variant="outlined"
                density="comfortable"
                maxlength="150"
                :rules="[
                reglas.requerido,
                valor => reglas.maximo(valor, 150),
              ]"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect
                v-model="datos.unidad_id"
                label="Unidad organizacional *"
                :items="unidades"
                item-title="nombre"
                item-value="id"
                :loading="cargandoUnidades"
                :disabled="cargandoUnidades || !!errorUnidades"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
                no-data-text="No hay unidades activas disponibles"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
                v-model.number="datos.cantidad_plazas"
                label="Cantidad de plazas *"
                type="number"
                min="1"
                step="1"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido, reglas.plazas]"
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
                v-model="datos.descripcion"
                label="Descripción del puesto"
                variant="outlined"
                density="comfortable"
                rows="5"
                auto-grow
                counter="4000"
                :rules="[valor => reglas.maximo(valor, 4000)]"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard rounded="lg" elevation="1" class="mb-5">
      <VCardTitle class="pa-5">
        <VIcon icon="mdi-account-tie-outline" color="primary" class="mr-2"/>
        Condiciones laborales
      </VCardTitle>

      <VDivider/>

      <VCardText class="pa-5">
        <VRow>
          <VCol cols="12" md="4">
            <VSelect
                v-model="datos.modalidad"
                label="Modalidad *"
                :items="modalidades"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
            />
          </VCol>

          <VCol cols="12" md="4">
            <VSelect
                v-model="datos.tipo_contrato"
                label="Tipo de contrato *"
                :items="tiposContrato"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
            />
          </VCol>

          <VCol cols="12" md="4">
            <VSelect
                v-model="datos.nivel_experiencia"
                label="Nivel de experiencia *"
                :items="nivelesExperiencia"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.requerido]"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
                v-model.number="datos.salario_minimo"
                label="Salario mínimo"
                type="number"
                min="0"
                step="0.01"
                prefix="Q"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.salario]"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
                v-model.number="datos.salario_maximo"
                label="Salario máximo"
                type="number"
                min="0"
                step="0.01"
                prefix="Q"
                variant="outlined"
                density="comfortable"
                :rules="[
                reglas.salario,
                reglas.salarioMaximo,
              ]"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard rounded="lg" elevation="1" class="mb-5">
      <VCardTitle class="pa-5">
        <VIcon
            icon="mdi-calendar-check-outline"
            color="primary"
            class="mr-2"
        />
        Fechas de la vacante
      </VCardTitle>

      <VDivider/>

      <VCardText class="pa-5">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
                v-model="datos.fecha_inicio"
                label="Fecha de inicio"
                type="date"
                variant="outlined"
                density="comfortable"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
                v-model="datos.fecha_limite"
                label="Fecha límite"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[reglas.fechaLimite]"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <div class="d-flex justify-end ga-3">
      <VBtn
          variant="outlined"
          to="/vacantes"
          :disabled="guardando"
      >
        Cancelar
      </VBtn>

      <VBtn
          type="submit"
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :loading="guardando"
          :disabled="guardando || cargandoUnidades || !!errorUnidades"
      >
        {{ editando ? 'Guardar cambios' : 'Guardar vacante' }}
      </VBtn>
    </div>
  </VForm>
</template>
