
<script setup lang="ts">
const numero = ref<number | null>(null)
const resultadoPar = ref('')

const inicio = ref<number | null>(null)
const fin = ref<number | null>(null)
const resultadoPrimos = ref('')

const cantidad = ref<number | null>(null)
const sucesion = ref<number[]>([])
const sumaPares = ref<number | null>(null)

function validarEntero(valor: number | null, minimo: number, maximo: number) {
  return valor !== null
      && Number.isInteger(valor)
      && valor >= minimo
      && valor <= maximo
}

function verificarPar() {
  resultadoPar.value = ''

  if (!validarEntero(numero.value, -100000, 100000)) {
    resultadoPar.value = 'Ingresa un número entero entre -100000 y 100000.'
    return
  }

  resultadoPar.value = numero.value! % 2 === 0 ? 'PAR' : 'IMPAR'
}

function esPrimo(numero: number) {
  if (numero < 2) return false

  for (let i = 2; i <= Math.sqrt(numero); i++) {
    if (numero % i === 0) return false
  }

  return true
}

function buscarPrimos() {
  resultadoPrimos.value = ''

  if (
      !validarEntero(inicio.value, 1, 100000)
      || !validarEntero(fin.value, 1, 100000)
      || inicio.value! > fin.value!
  ) {
    resultadoPrimos.value = 'Ingresa un rango válido: 1 ≤ a ≤ b ≤ 100000.'
    return
  }

  const primos: number[] = []

  for (let i = inicio.value!; i <= fin.value!; i++) {
    if (esPrimo(i)) primos.push(i)
  }

  resultadoPrimos.value = primos.length
      ? primos.join(', ')
      : 'No se encontraron números primos.'
}

function calcularFibonacci() {
  sucesion.value = []
  sumaPares.value = null

  if (!validarEntero(cantidad.value, 2, 40)) {
    return
  }

  let anterior = 0
  let actual = 1
  let suma = 0

  for (let i = 0; i < cantidad.value!; i++) {
    sucesion.value.push(anterior)

    if (anterior % 2 === 0) {
      suma += anterior
    }

    const siguiente = anterior + actual
    anterior = actual
    actual = siguiente
  }

  sumaPares.value = suma
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <VCard rounded="lg">
      <VCardTitle>1. Número par o impar</VCardTitle>
      <VDivider />

      <VCardText>
        <VTextField
            v-model.number="numero"
            type="number"
            label="Número entero"
            variant="outlined"
            hint="Valores permitidos: -100000 a 100000"
            persistent-hint
        />

        <VBtn
            color="primary"
            class="mt-4"
            @click="verificarPar"
        >
          Verificar
        </VBtn>

        <VAlert
            v-if="resultadoPar"
            type="info"
            variant="tonal"
            class="mt-4"
        >
          {{ resultadoPar }}
        </VAlert>
      </VCardText>
    </VCard>

    <VCard rounded="lg">
      <VCardTitle>2. Números primos en un rango</VCardTitle>
      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
                v-model.number="inicio"
                type="number"
                label="Número inicial (a)"
                variant="outlined"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
                v-model.number="fin"
                type="number"
                label="Número final (b)"
                variant="outlined"
            />
          </VCol>
        </VRow>

        <VBtn
            color="primary"
            class="mt-2"
            @click="buscarPrimos"
        >
          Buscar primos
        </VBtn>

        <VAlert
            v-if="resultadoPrimos"
            type="info"
            variant="tonal"
            class="mt-4"
        >
          {{ resultadoPrimos }}
        </VAlert>
      </VCardText>
    </VCard>

    <VCard rounded="lg">
      <VCardTitle>3. Suma de términos pares de Fibonacci</VCardTitle>
      <VDivider />

      <VCardText>
        <VTextField
            v-model.number="cantidad"
            type="number"
            label="Cantidad de términos (n)"
            variant="outlined"
            hint="Ingresa un entero entre 2 y 40"
            persistent-hint
        />

        <VBtn
            color="primary"
            class="mt-4"
            @click="calcularFibonacci"
        >
          Calcular
        </VBtn>

        <VAlert
            v-if="cantidad !== null && !validarEntero(cantidad, 2, 40)"
            type="error"
            variant="tonal"
            class="mt-4"
        >
          Ingresa un número entero entre 2 y 40.
        </VAlert>

        <VAlert
            v-if="sumaPares !== null"
            type="success"
            variant="tonal"
            class="mt-4"
        >
          <div>
            <strong>Sucesión:</strong>
            {{ sucesion.join(' ') }}
          </div>

          <div class="mt-2">
            <strong>Suma de pares:</strong>
            {{ sumaPares }}
          </div>
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>
