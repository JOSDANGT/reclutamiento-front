<template>
  <VMain class="auth-container">
    <VContainer class="fill-height" fluid>
      <VRow justify="center" align="center">
        <VCol cols="12" sm="8" md="5" lg="4">

          <div class="text-center mb-8">
            <VAvatar color="primary" size="64" class="mb-4">
              <VIcon icon="mdi-account-group" size="36" />
            </VAvatar>

            <h1 class="text-h4 font-weight-bold">
              TalentHub
            </h1>

            <p class="text-medium-emphasis mt-2">
              Cooperativa Guayacán
            </p>
          </div>
          <slot />

          <p class="text-center text-caption mt-6">
            Sistema de Reclutamiento y Selección de Personal
          </p>

        </VCol>
      </VRow>
    </VContainer>
  </VMain>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>