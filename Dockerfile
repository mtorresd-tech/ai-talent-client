# syntax=docker/dockerfile:1
#
# Build de tres stages para IA Talento Frontend (Reclutador/Líder). El
# contexto de este build tiene que ser un directorio que contenga, en algún
# nivel, tanto el código de este repo como el de "geb-frontend-libs"
# (código fuente de los paquetes @geb/* que se compilan en el primer stage,
# porque todavía no existe un feed npm privado donde estén publicados). Las
# rutas de cada uno dentro de ese contexto varían según cómo cada persona
# tenga organizados sus repos localmente, así que se pasan como build args:
#
#   - GEB_LIBS_SUBDIR: ruta de "geb-frontend-libs" relativa al contexto.
#   - FRONTEND_SUBDIR: ruta de este repo relativa al contexto.
#
# Ejemplo con ambos repos como hermanos directos bajo un mismo padre (valores
# por defecto, sin necesidad de pasar GEB_LIBS_SUBDIR/FRONTEND_SUBDIR), desde
# ese directorio padre:
#
#   docker build \
#     --file "SELECTA Frontend/Dockerfile" \
#     --tag ia-talento-frontend:dev \
#     --build-arg VITE_API_BASE_URL=https://api-dev.example.com \
#     --build-arg VITE_ENTRA_REDIRECT_URI=https://frontend-dev.example.com \
#     --build-arg VITE_ENTRA_SCOPES="openid profile email" \
#     --build-arg VITE_URL_SUCCESSFACTORS=https://successfactors-dev.example.com \
#     .
#
# Ejemplo cuando los repos no son hermanos directos (por ejemplo, este repo
# vive anidado un nivel más abajo que "geb-frontend-libs"), pasando el
# ancestro común de ambos como contexto y ajustando las rutas relativas a él:
#
#   docker build \
#     --file "azure/SELECTA Frontend/Dockerfile" \
#     --tag ia-talento-frontend:dev \
#     --build-arg GEB_LIBS_SUBDIR=geb-frontend-libs \
#     --build-arg FRONTEND_SUBDIR="azure/SELECTA Frontend" \
#     --build-arg VITE_API_BASE_URL=https://api-dev.example.com \
#     --build-arg VITE_ENTRA_REDIRECT_URI=https://frontend-dev.example.com \
#     --build-arg VITE_ENTRA_SCOPES="openid profile email" \
#     --build-arg VITE_URL_SUCCESSFACTORS=https://successfactors-dev.example.com \
#     .
#
# Los --build-arg VITE_* quedan embebidos en el bundle JS al compilar (Vite
# los resuelve en build-time): una imagen distinta por entorno, sin mecanismo
# de sustitución en runtime.
#
# El archivo de exclusión de este build se llama "Dockerfile.dockerignore"
# (no ".dockerignore") porque el contexto de build no es esta carpeta:
# BuildKit busca primero un ignore-file con el mismo nombre que el Dockerfile
# referenciado por --file, y solo si no existe cae al ".dockerignore" de la
# raíz del contexto (que aquí no existe, por vivir fuera de este repo). Un
# ".dockerignore" común dentro de esta carpeta nunca se leería con los
# comandos de arriba.

ARG NODE_VERSION=24
ARG PNPM_VERSION=10
ARG NGINX_VERSION=1.27-alpine
ARG GEB_LIBS_SUBDIR=geb-frontend-libs
ARG FRONTEND_SUBDIR="SELECTA Frontend"

# ---------------------------------------------------------------------------
# Stage 1: builder-geb-libs
#
# Compila desde su código fuente los paquetes de geb-frontend-libs que este
# frontend consume (@geb/ui, @geb/api-client, @geb/auth, @geb/forms), porque
# todavía no existe un feed npm privado donde estén publicados. No se
# compilan @geb/reports ni @geb/offline: no están instalados en este repo.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder-geb-libs
ARG PNPM_VERSION
ARG GEB_LIBS_SUBDIR
ARG GEB_LIBS_REF=""
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Esta ruta exacta (/workspace/geb-frontend-libs) es la que el stage
# builder-frontend espera encontrar para que la ruta relativa con la que
# package.json declara cada dependencia @geb/* (tal como está en el checkout
# local de la persona desarrolladora) resuelva sin tener que reescribirla.
# Es independiente de GEB_LIBS_SUBDIR, que solo describe dónde está el
# código fuente en el contexto de build, no la ruta dentro de la imagen.
WORKDIR /workspace/geb-frontend-libs

# Manifiestos primero, para que pnpm install se cachee aparte del código
# fuente. Solo se copian los paquetes que este frontend consume, más
# @geb/eslint-config (necesario únicamente para resolver la referencia
# "workspace:*" que declaran como devDependency; no se ejecuta su lint acá).
COPY ${GEB_LIBS_SUBDIR}/package.json ${GEB_LIBS_SUBDIR}/pnpm-lock.yaml ${GEB_LIBS_SUBDIR}/pnpm-workspace.yaml ${GEB_LIBS_SUBDIR}/tsconfig.base.json ./
COPY ${GEB_LIBS_SUBDIR}/packages/ui/package.json ./packages/ui/package.json
COPY ${GEB_LIBS_SUBDIR}/packages/api-client/package.json ./packages/api-client/package.json
COPY ${GEB_LIBS_SUBDIR}/packages/auth/package.json ./packages/auth/package.json
COPY ${GEB_LIBS_SUBDIR}/packages/forms/package.json ./packages/forms/package.json
COPY ${GEB_LIBS_SUBDIR}/packages/eslint-config/package.json ./packages/eslint-config/package.json

# Como solo se copia el subconjunto de paquetes que este frontend consume (no
# el workspace completo de geb-frontend-libs, que incluye además @geb/reports,
# @geb/offline y una app de documentación), el pnpm-lock.yaml copiado
# describe una estructura de workspace más grande que la presente en este
# stage. pnpm igual resuelve las versiones contra ese lockfile, pero sin
# --frozen-lockfile, que exigiría coincidencia exacta con esa estructura
# completa.
RUN pnpm install --no-frozen-lockfile

# Código fuente de cada paquete a compilar.
COPY ${GEB_LIBS_SUBDIR}/packages/ui/tsconfig.json ./packages/ui/tsconfig.json
COPY ${GEB_LIBS_SUBDIR}/packages/ui/src ./packages/ui/src
COPY ${GEB_LIBS_SUBDIR}/packages/api-client/tsconfig.json ./packages/api-client/tsconfig.json
COPY ${GEB_LIBS_SUBDIR}/packages/api-client/src ./packages/api-client/src
COPY ${GEB_LIBS_SUBDIR}/packages/auth/tsconfig.json ./packages/auth/tsconfig.json
COPY ${GEB_LIBS_SUBDIR}/packages/auth/src ./packages/auth/src
COPY ${GEB_LIBS_SUBDIR}/packages/forms/tsconfig.json ./packages/forms/tsconfig.json
COPY ${GEB_LIBS_SUBDIR}/packages/forms/src ./packages/forms/src

# @geb/ui se compila primero: @geb/auth y @geb/forms importan su dist/.
RUN pnpm --filter "@geb/ui" run build \
 && pnpm --filter "@geb/api-client" run build \
 && pnpm --filter "@geb/auth" run build \
 && pnpm --filter "@geb/forms" run build

# Referencia informativa (commit/tag) del código de geb-frontend-libs
# incluido en esta imagen, para trazabilidad, dado que ese repo no publica
# un número de versión.
LABEL com.geb.geb-libs-ref="${GEB_LIBS_REF}"

# ---------------------------------------------------------------------------
# Stage 2: builder-frontend
#
# Instala las dependencias de SELECTA Frontend con pnpm (usando el dist/ de
# @geb/* generado en el stage anterior) y compila la SPA con tsc + vite.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder-frontend
ARG PNPM_VERSION
ARG FRONTEND_SUBDIR
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# WORKDIR anidado a dos niveles bajo /workspace: así "../../", la ruta
# relativa con la que package.json declara cada dependencia @geb/* (igual
# que en el checkout local de la persona desarrolladora), resuelve dentro de
# la imagen exactamente a /workspace/geb-frontend-libs, el mismo directorio
# usado en el stage anterior, sin tener que reescribir package.json. Es
# independiente de FRONTEND_SUBDIR, que solo describe dónde está el código
# fuente de este repo en el contexto de build, no la ruta dentro de la
# imagen.
WORKDIR /workspace/build/frontend

COPY ${FRONTEND_SUBDIR}/package.json ${FRONTEND_SUBDIR}/pnpm-lock.yaml ./

# Se copia el árbol completo de /workspace/geb-frontend-libs (no solo
# package.json + dist de cada paquete) porque @geb/auth y @geb/forms
# resuelven en runtime peer dependencies (@azure/msal-browser,
# @azure/msal-react) que pnpm instaló como devDependency de cada paquete,
# vía symlinks dentro de su propio node_modules que apuntan al store
# .pnpm de la raíz de geb-frontend-libs. Copiar solo dist/ dejaba esos
# symlinks sin destino y el bundle de Vite fallaba al no poder resolverlos.
# Al copiar todo el árbol al mismo path absoluto (/workspace/geb-frontend-libs
# en ambos stages), esos symlinks siguen apuntando a un destino válido.
COPY --from=builder-geb-libs /workspace/geb-frontend-libs /workspace/geb-frontend-libs

RUN pnpm install --frozen-lockfile

COPY ${FRONTEND_SUBDIR}/index.html ${FRONTEND_SUBDIR}/tsconfig.json ${FRONTEND_SUBDIR}/tsconfig.app.json ${FRONTEND_SUBDIR}/tsconfig.node.json ${FRONTEND_SUBDIR}/vite.config.ts ./
COPY ${FRONTEND_SUBDIR}/public ./public
COPY ${FRONTEND_SUBDIR}/src ./src

# Variables VITE_* build-time: Vite las reemplaza de forma estática al
# compilar, así que cada combinación de valores requiere una imagen propia
# (no se pueden cambiar en runtime sin reconstruir). Vacías por defecto: sin
# VITE_ENTRA_CLIENT_ID/VITE_ENTRA_TENANT_ID la app usa el login simulado en
# memoria ya existente en el código, útil como modo demo.
ARG VITE_API_BASE_URL=""
ARG VITE_ENTRA_CLIENT_ID=""
ARG VITE_ENTRA_TENANT_ID=""
ARG VITE_ENTRA_REDIRECT_URI=""
ARG VITE_ENTRA_SCOPES=""
# Se declara para dejar completa la lista de build args del proyecto; el
# código de esta rama todavía no la expone en vite-env.d.ts, así que Vite no
# la reemplaza en el bundle hasta que ese tipado exista.
ARG VITE_URL_SUCCESSFACTORS=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_ENTRA_CLIENT_ID=${VITE_ENTRA_CLIENT_ID} \
    VITE_ENTRA_TENANT_ID=${VITE_ENTRA_TENANT_ID} \
    VITE_ENTRA_REDIRECT_URI=${VITE_ENTRA_REDIRECT_URI} \
    VITE_ENTRA_SCOPES=${VITE_ENTRA_SCOPES} \
    VITE_URL_SUCCESSFACTORS=${VITE_URL_SUCCESSFACTORS}

RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 3: runtime
#
# Sirve los estáticos generados con nginx, sin arrastrar Node, pnpm ni
# node_modules de los stages anteriores. Usa la variante "unprivileged" de la
# imagen oficial de nginx, que ya corre como usuario no root y escucha en un
# puerto no privilegiado (8080) en vez de 80.
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime
ARG GEB_LIBS_REF=""
ARG FRONTEND_SUBDIR

LABEL org.opencontainers.image.title="ia-talento-frontend" \
      com.geb.geb-libs-ref="${GEB_LIBS_REF}"

COPY ${FRONTEND_SUBDIR}/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder-frontend /workspace/build/frontend/dist /usr/share/nginx/html

EXPOSE 8080
