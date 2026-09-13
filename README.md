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
- El repo **`geb-frontend-libs`** clonado dos niveles arriba de este repo
  (en el directorio abuelo, no en el padre inmediato), es decir:
  ```
  <directorio-abuelo>/
  ├── <cualquier-carpeta-intermedia>/
  │   └── SELECTA Frontend/     (este repo)
  └── geb-frontend-libs/
  ```
  Los paquetes `@geb/*` se consumen como dependencia local (`link:`) apuntando
  a `../../geb-frontend-libs/packages/<paquete>`, así que ese repo tiene que
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
│   └── notificaciones/  # ambos portales (placeholder)
└── shared/         # tipos de dominio y cliente HTTP compartidos — sin lógica de negocio
```

El código de las integraciones con Bluesite, Cosinte y Medilaboral, y el
paso Oferta del pipeline (en `features/integraciones/` y
`features/procesos/`), se mantiene en el repositorio como respaldo: no
están expuestos en el rail del portal del Reclutador, pero conservan su
lógica, sus pantallas y sus pruebas intactas por si el cliente decide
reactivarlos. Se eliminarán al finalizar el proyecto si no se retoman
antes de esa fecha.

Los features no se importan entre sí (excepto `procesos`, que consume tipos
de `integraciones`); lo reutilizable entre proyectos GEB se propone como
paquete `@geb/*`, no como código duplicado en este repo.

## Docker

La imagen se construye con un `Dockerfile` multi-stage: un stage compila los
paquetes `@geb/*` desde el código fuente de `geb-frontend-libs` (todavía no
hay feed npm privado donde estén publicados), otro instala dependencias con
pnpm y compila el frontend con Vite, y el último sirve los estáticos
resultantes con nginx.

Por eso el build necesita un contexto que incluya, en algún nivel, tanto
este repo como `geb-frontend-libs/` — nunca se ejecuta `docker build .`
desde `SELECTA Frontend/` sola. Como la ruta de cada repo dentro de ese
contexto depende de cómo estén organizados localmente (no siempre son
hermanos directos bajo el mismo padre), se pasan como build args
(`GEB_LIBS_SUBDIR` y `FRONTEND_SUBDIR`, ambas relativas al contexto).

```
# Caso 1: ambos repos como hermanos directos bajo un mismo padre.
# Desde ese directorio padre (valores por defecto, sin build args extra):

docker build \
  --file "SELECTA Frontend/Dockerfile" \
  --tag ia-talento-frontend:dev \
  --build-arg VITE_API_BASE_URL=https://api-dev.example.com \
  --build-arg VITE_ENTRA_REDIRECT_URI=https://frontend-dev.example.com \
  --build-arg VITE_ENTRA_SCOPES="openid profile email" \
  --build-arg VITE_URL_SUCCESSFACTORS=https://successfactors-dev.example.com \
  .
```

```
# Caso 2: este repo anidado un nivel más abajo que "geb-frontend-libs"
# (por ejemplo, geb-frontend-libs y una carpeta intermedia que contiene a
# SELECTA Frontend, ambas bajo el mismo directorio abuelo). Desde ese
# directorio abuelo, indicando la ruta relativa de cada uno:

docker build \
  --file "azure/SELECTA Frontend/Dockerfile" \
  --tag ia-talento-frontend:dev \
  --build-arg GEB_LIBS_SUBDIR=geb-frontend-libs \
  --build-arg FRONTEND_SUBDIR="azure/SELECTA Frontend" \
  --build-arg VITE_API_BASE_URL=https://api-dev.example.com \
  --build-arg VITE_ENTRA_REDIRECT_URI=http://localhost:8080 \
  --build-arg VITE_ENTRA_SCOPES="openid profile email" \
  .
```

En ambos casos, dejar `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID` sin
pasar es válido para una primera prueba local: la imagen queda en modo demo
(login simulado).

El archivo de exclusión del build se llama `Dockerfile.dockerignore` (no
`.dockerignore`) y vive junto al `Dockerfile`: como el contexto no es esta
carpeta, un `.dockerignore` suelto aquí nunca se leería, así que se usa el
nombre que Docker prioriza para el `Dockerfile` indicado con `--file`.

### Variables de entorno como build args

| Variable                                                                                          | Notas                                                                                                                                        |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`                                                                               | URL base del backend de orquestación.                                                                                                        |
| `VITE_ENTRA_CLIENT_ID` / `VITE_ENTRA_TENANT_ID` / `VITE_ENTRA_REDIRECT_URI` / `VITE_ENTRA_SCOPES` | Registro de la app en Microsoft Entra ID. Vacías = login simulado en memoria (modo demo).                                                    |
| `VITE_URL_SUCCESSFACTORS`                                                                         | Declarada como build arg, pero el código de esta rama todavía no la tipa en `vite-env.d.ts`, así que por ahora no tiene efecto en el bundle. |

Todas son variables de **build-time**: Vite las reemplaza al compilar, así
que cada combinación de valores requiere una imagen distinta — no se pueden
cambiar en runtime sin reconstruir.

### Ejecutar la imagen

```
docker run -p 8080:8080 ia-talento-frontend:dev
```

El stage final usa `nginx-unprivileged` (corre como usuario no root), que
escucha en el puerto no privilegiado 8080.

### Notas pendientes

- `geb-frontend-libs` todavía no tiene su propio `Dockerfile.dockerignore`
  ni consideraciones de build Docker; si ese repo crece, conviene agregarle
  uno (fuera del alcance de este repo).

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
  en verde
