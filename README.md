# IA Talento — Frontend

Frontend de IA Talento (Grupo Energía Bogotá): dos portales — **Reclutador**
(gestiona vacantes, candidatos y el pipeline de selección) y **Líder**
(evalúa informes incógnitos y califica entrevistas). Consume un backend de
orquestación propio que a su vez integra SAP SuccessFactors, Bluesite,
Cosinte y Medilaboral.

## Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [Material UI](https://mui.com) como base de componentes
- [`@geb/*`](#librería-geb) — design system y utilidades transversales de GEB (UI, cliente HTTP, autenticación, formularios)
- [React Router](https://reactrouter.com)
- [pnpm](https://pnpm.io) como gestor de paquetes

## Requisitos previos

- Node 18.18 o superior (desarrollado y probado con Node 24).
- pnpm 10.
- El repo **`geb-frontend-libs`** clonado como hermano de este repo (mismo
  directorio padre), es decir:
  ```
  <directorio-padre>/
  ├── SELECTA Frontend/     (este repo)
  └── geb-frontend-libs/
  ```
  Los paquetes `@geb/*` se consumen como dependencia local (`link:`) apuntando
  a `../geb-frontend-libs/packages/<paquete>`, así que ese repo tiene que
  existir en esa ruta relativa y estar buildeado
  (`pnpm build` dentro de `geb-frontend-libs`) antes de instalar aquí. Esto es
  temporal: cuando `@geb/*` se publique en un feed de paquetes, estas
  dependencias pasan a apuntar a una versión publicada en vez de a una ruta
  local.

## Configuración

1. Copia `.env.example` a `.env.local` y completa las variables (ver
   [Variables de entorno](#variables-de-entorno)).
2. `pnpm install`
3. `pnpm dev`

### Variables de entorno

| Variable                                                                                          | Para qué                                                      |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`                                                                               | URL base del backend de orquestación de IA Talento.           |
| `VITE_ENTRA_CLIENT_ID` / `VITE_ENTRA_TENANT_ID` / `VITE_ENTRA_REDIRECT_URI` / `VITE_ENTRA_SCOPES` | Registro de la app en Microsoft Entra ID, para el login real. |

Mientras `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID` estén vacíos (no hay
app registration todavía), la app arranca con un **login simulado en
memoria**: cualquier correo/contraseña entra, sin validar contra Entra ID.
Sirve para desarrollar y navegar la app mientras ese registro no exista.

## Scripts disponibles

| Script              | Qué hace                                    |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Levanta el servidor de desarrollo.          |
| `pnpm build`        | Typecheck (`tsc -b`) + build de producción. |
| `pnpm lint`         | ESLint sobre todo el proyecto.              |
| `pnpm format`       | Formatea con Prettier.                      |
| `pnpm format:check` | Verifica formato sin escribir cambios.      |
| `pnpm test`         | Corre la suite de pruebas (Vitest) una vez. |
| `pnpm test:watch`   | Vitest en modo watch.                       |
| `pnpm preview`      | Sirve el build de producción localmente.    |

Las pruebas usan Vitest + Testing Library + jsdom. `vitest.config.ts` replica el
`alias`/`dedupe` de React, `@mui/material` y `@emotion` de la config de build
para no cargar dos copias de React en el entorno de pruebas.

## Estructura del proyecto

```
src/
├── app/            # shell: providers (theme + auth), layout, router
├── features/       # un directorio por módulo de negocio
│   ├── auth/           # login
│   ├── procesos/       # vacantes, candidatos, pipeline, decisiones — ambos portales
│   ├── integraciones/  # estado por proveedor: bluesite/, cosinte/, medilaboral/, ssff/
│   ├── metricas/        # portal reclutador (placeholder)
│   ├── notificaciones/  # ambos portales (placeholder)
│   └── configuracion/   # políticas de compuertas, rol administrador
└── shared/         # tipos de dominio y cliente HTTP compartidos — sin lógica de negocio
```

Los features no se importan entre sí (excepto `procesos`, que consume tipos
de `integraciones`); lo reutilizable entre proyectos GEB se propone como
paquete `@geb/*`, no como código duplicado en este repo.

## Convenciones

- **Idioma**: componentes, funciones, tipos y variables en español; carpetas
  y paquetes en inglés.
- **Ramas**: nunca se trabaja directo sobre `main`, `dev` o `qa`. Cada cambio
  va en `[prefijo]/id/nombre-apellido/nombre-funcionalidad`, con
  `prefijo` ∈ `feature | bugfix | hotfix | test | wip`.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
  en español (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`,
  `style:`), un commit por archivo.
- **Antes de abrir un PR**: `pnpm lint && pnpm format:check && pnpm build && pnpm test`
  en verde.

## Documentación de funcionalidades

En `docs/` se documenta cada funcionalidad ya implementada:

- [`docs/p-02-vista-general-procesos.md`](docs/p-02-vista-general-procesos.md) —
  vista general de Procesos del reclutador: tabla de vacantes, detalle, pipeline
  dinámico, ranking de candidatos por afinidad y envío a prefiltro telefónico.
- [`docs/pendientes-backend.md`](docs/pendientes-backend.md) — confirmaciones y
  cambios pendientes del servicio de orquestación.
