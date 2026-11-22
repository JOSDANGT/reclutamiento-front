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

  routeRules: {
    '/api/**': {
      proxy: 'http://talentohumanoback.local/api/**',
    },
  },

  runtimeConfig: {
    apiBaseUrl: '',
  },
})