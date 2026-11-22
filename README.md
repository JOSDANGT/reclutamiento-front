
# TalentHub — Frontend

Sistema web de gestión de reclutamiento y selección de personal, desarrollado con **Nuxt 4, Vue 3 y Vuetify 3**.

## Tecnologías utilizadas

- Nuxt 4
- Vue 3
- Vuetify 3
- TypeScript
- Node.js y npm
- Git y GitHub

## Requisitos

- Node.js compatible con Nuxt 4.
- npm.
- Backend de TalentHub configurado y en ejecución.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/JOSDANGT/reclutamiento-front.git
cd TalentoHumanoFront
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno
```
NUXT_API_BASE_URL=http://talentohumanoback.local
```

### 4. Iniciar el servidor de desarrollo

```bash
pnpm run dev -- --port 3001
```

Acceder desde el navegador:

http://localhost:3001

## Usuarios de prueba

Para ingresar al módulo administrativo de TalentHub, se encuentran disponibles las siguientes cuentas de prueba:

| Usuario | Contraseña inicial | Rol |
|---|---|---|
| `superadmin` | `Admin1234` | Administrador |
| `gerenterh` | `Admin1234` | Administrador |
| `coordinadorrh` | `Admin1234` | Reclutador |
| `analistareclutamiento` | `Admin1234` | Reclutador |
| `especialistaseleccion` | `Admin1234` | Reclutador |

Las cuentas se generan mediante el seeder `SuperAdminSeeder` del backend. La contraseña inicial se asigna únicamente cuando se crea un usuario nuevo.
