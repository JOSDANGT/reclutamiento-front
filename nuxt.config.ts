export default defineNuxtConfig({
  compatibilityDate: '2026-11-21',

  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
  ],

  css: [
    '@mdi/font/css/materialdesignicons.css',
  ],

  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000',
    },
  },
})