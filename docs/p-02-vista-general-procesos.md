# Vista general de Procesos (portal Reclutador)

## Qué es

Pantalla principal del portal del reclutador (ruta `/procesos`). Permite listar
las vacantes asignadas, abrir una, ver su detalle, recorrer su pipeline de
selección y trabajar la primera etapa operativa: el ranking de candidatos por
afinidad y el envío de candidatos a prefiltro telefónico.

Antes de esta entrega la pantalla era un placeholder vacío. Ahora es la vista
funcional; las etapas del pipeline posteriores a la primera quedan navegables
pero muestran un cartel "en construcción".

## Cómo usarla

1. **Listar vacantes.** Al entrar se carga la tabla de vacantes del reclutador
   (paginada desde el servidor, 20 por página). Cada fila muestra el título de la
   vacante con su área y ciudad, el estado ("En proceso" / "Cerrada"), el número
   de candidatos y un resumen de en qué etapa están (los uno o dos estados con
   más candidatos, por ejemplo `En ranking (12) · Prefiltro pendiente (3)`).
2. **Buscar.** El buscador de la tabla filtra por texto; la consulta al servidor
   se dispara 300 ms después de dejar de escribir.
3. **Seleccionar una vacante.** Al hacer clic en una fila se fija como vacante
   activa: aparece una barra con su nombre, la tarjeta de detalle, el rail del
   pipeline y el área de trabajo de dos columnas.
4. **Ver el detalle.** Tarjeta oscura con área y ciudad, candidatos en proceso,
   fecha de apertura, fecha estimada de cierre ("Sin definir" si la vacante sigue
   abierta) y el reclutador a cargo ("No disponible" si el dato falta).
5. **Recorrer el pipeline.** El rail dibuja una ficha por etapa, en el orden que
   define el backend, con su nombre y su número de candidatos. Las flechas
   desplazan el rail y se deshabilitan en los extremos. Por defecto queda activa
   la etapa de ranking; si el pipeline no la incluye, la primera etapa. Cambiar
   de etapa no cambia la URL.
6. **Trabajar el ranking.** Con la etapa de ranking activa, la columna izquierda
   lista los candidatos ordenados por afinidad descendente, con avatar de
   iniciales, posición en el ranking, origen y fecha de postulación, un chip de
   estado en español y el porcentaje de afinidad. La lista se pagina contra el
   servidor.
7. **Ver el resultado Selecta.** Al hacer clic en un candidato, la columna
   derecha muestra su resultado de afinidad: porcentaje total, desglose por
   fortalezas / experiencia / estudios, listas de fortalezas y debilidades y
   comentarios. El enlace "Ver detalle completo" todavía no lleva a ninguna
   parte (pendiente de la subpágina de detalle de candidato).
8. **Enviar a prefiltro telefónico.**
   - Marca los checkboxes de los candidatos que quieres enviar. Solo son
     seleccionables los que tienen pendiente la decisión de ranking; el resto
     aparece con el checkbox deshabilitado y un tooltip que lo explica.
   - Con al menos uno marcado aparece una barra con el conteo y el botón
     "Prefiltro telefónico".
   - El botón abre un modal de confirmación con la lista de seleccionados y un
     aviso de que el prefiltro se diligencia en SAP SuccessFactors.
   - Al confirmar, cada candidato pasa de "En ranking" a "Prefiltro pendiente".
     El modal muestra el progreso ("Enviando 2 de 5…").
   - Al terminar se muestra un resumen ("3 enviados, 2 con error"), con el motivo
     y el ID de correlación de cada fallo, y la lista de la etapa se recarga.

### Qué queda fuera de esta entrega

- Las etapas del pipeline posteriores al ranking (anonimización, Bluesite,
  Cosinte, Medilaboral, oferta): navegables, sin datos ni acciones.
- El sub-paso "Lista de filtrados" dentro de la etapa de ranking: navegable, con
  contenido placeholder.
- La subpágina completa de detalle de candidato (enlace "Ver detalle completo").
- El botón "Filtrar" de la barra de la vacante (filtros avanzados): deshabilitado.
- El diligenciamiento real del prefiltro telefónico (cumple perfil, interés de
  continuidad, aspiración salarial): se hace en SAP SuccessFactors.
- El portal del líder y el recálculo de afinidad bajo demanda.

## Arquitectura resultante

### Componentes

```
PaginaProcesosReclutador  (orquesta el estado: vacante -> etapa -> sub-paso -> candidato)
├── TablaVacantes + BarraSeleccionVacante   GET /vacantes  (paginación de servidor, q con debounce)
├── TarjetaDetalleVacante                   GET /vacantes/{id}
├── RailPipeline + SubnavPasosEtapa         GET /vacantes/{id}/pipeline  (orden y etapas los da el backend)
└── LayoutPasoPipeline (dos columnas 340px / 1fr, colapsa < 900px)
    ├── izquierda
    │   ├── etapa de ranking:  BarraAccionPrefiltro + ListaRankingCandidatos + ModalConfirmarPrefiltro
    │   └── otra etapa / sub-paso no operativo:  PasoEnConstruccion
    └── derecha
        └── etapa de ranking:  ResultadoSelecta  (con o sin candidato seleccionado)

Hooks de datos (useEffect + AbortController, estado cargando/error/datos/recargar):
  useVacantes · useDetalleVacante · usePipeline · useCandidatosEtapa · useDetalleCandidato
  — todos sobre el patrón genérico usePeticion.
Hooks de interacción:
  useSeleccionMultiple (Set de ids) · useEnviarPrefiltro (envío secuencial de decisiones).
Lógica de derivación (solo frontend):
  mapaEstadosPorEtapa · subpasosPorEtapa · etiquetasEstado · resumenEtapaVacante ·
  formatoFecha · paginacion · candidato · api/serializacion.
```

Al seleccionar una vacante se disparan en paralelo su detalle y su pipeline;
cuando llega el pipeline se resuelve la etapa activa y se cargan sus candidatos.
Cambiar de vacante, etapa, página o candidato cancela con `AbortController`
cualquier petición en vuelo para no pintar respuestas obsoletas. Cada región
tiene su propio estado de carga/error, así que el fallo de una no tumba el resto
de la pantalla; los errores se muestran con el título del Problem Details y el
ID de correlación, más un botón de reintento.

### Estructuras solo de frontend: `ESTADOS_POR_ETAPA` y `SUBPASOS_POR_ETAPA`

Estas dos estructuras existen porque el backend y la vista modelan el avance del
candidato de forma distinta, y hacen falta para construir los pasos siguientes
del pipeline sin repetir estas decisiones.

**`ESTADOS_POR_ETAPA` (en `logica/mapaEstadosPorEtapa.ts`).**
El endpoint de candidatos de una vacante (`GET /vacantes/{id}/candidatos`) no
filtra por "etapa del pipeline": filtra por `estado` del proceso
(`EstadoProceso[]`). El rail, en cambio, se dibuja a partir de las etapas del
pipeline. `ESTADOS_POR_ETAPA` es el puente: traduce la `clave` de la etapa activa
a la lista de estados con la que se consulta el backend.

- Solo la etapa de ranking está mapeada hoy: su clave → `['RANKING_SELECTA']`.
- Cualquier otra clave → `[]`. Cuando el resultado es `[]` la etapa se considera
  no operativa: se muestra `PasoEnConstruccion` y **no** se llama al backend.
- Esta estructura **no** define el orden ni la composición del pipeline (eso
  siempre viene de `GET /vacantes/{id}/pipeline`); solo traduce claves a estados.
- La clave de la etapa de ranking está centralizada en la constante
  `CLAVE_ETAPA_RANKING` (`'RANKING'`), marcada como pendiente de confirmar contra
  el contrato real del pipeline del reclutador. Cuando se implementen las etapas
  siguientes, cada una añade su entrada aquí con los estados que le correspondan.

**`SUBPASOS_POR_ETAPA` (en `logica/subpasosPorEtapa.ts`).**
El pipeline del backend es plano: cada `EtapaPipeline` es una etapa sin
sub-divisiones. Pero la etapa de ranking necesita mostrar, además del ranking, una
vista "Lista de filtrados". Eso se modela como sub-pasos **visuales**, colgados
de una clave de etapa:

- `CLAVE_ETAPA_RANKING` → `[{ Ranking, operativo }, { Lista de filtrados, no operativo }]`.
- Cualquier otra clave → `[]` (sin subnavegación; no se renderiza `SubnavPasosEtapa`).
- Un sub-paso con `operativo: false` es un placeholder navegable.
- Los pasos siguientes que necesiten sub-vistas propias las agregan aquí sin
  tocar el rail dinámico.

### Contratos de API consumidos

Todas las llamadas van por el cliente HTTP compartido; el tenant y el
`x-correlation-id` los inyecta el interceptor, nunca se envían a mano. La
paginación del backend es base 1 y la de las tablas base 0: la conversión está
aislada en `logica/paginacion.ts`.

| Endpoint                                                                                                                          | Uso en la vista                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /vacantes?page&pageSize&q`                                                                                                   | Tabla de vacantes. Respuesta paginada de `VacanteResumen`.                                                                                                                               |
| `GET /vacantes/{id}`                                                                                                              | Tarjeta de detalle (`VacanteDetalle`).                                                                                                                                                   |
| `GET /vacantes/{id}/pipeline`                                                                                                     | Rail del pipeline (`EtapaPipeline[]`, ordenado por `orden`).                                                                                                                             |
| `GET /vacantes/{id}/candidatos?page&pageSize&estado=RANKING_SELECTA&ordenarPor=scoreAfinidad&direccion=desc`                      | Lista de la etapa de ranking. El parámetro `estado` se serializa como `?estado=A,B` (form, sin explode) mediante `api/serializacion.ts`.                                                 |
| `GET /candidatos/{jobApplicationId}`                                                                                              | Panel derecho: `desgloseAfinidad` del candidato seleccionado.                                                                                                                            |
| `POST /candidatos/{jobApplicationId}/decisiones` con `{ compuerta: 'RANKING', decision: 'APRUEBA' }` y cabecera `Idempotency-Key` | Acción "Prefiltro telefónico": una llamada por candidato, secuencial. Transiciona `RANKING_SELECTA → PREFILTRO_PENDIENTE`. Un `409` marca ese candidato como fallido y el lote continúa. |

### Diferencias respecto al plan original

- **Envío a prefiltro con el endpoint de decisiones.** No se usa
  `POST /candidatos/{id}/prefiltro` (que exige los datos de la llamada
  telefónica). En esta vista el modal solo confirma el avance de etapa; el
  diligenciamiento real se hace después en SAP. Se aprueba la compuerta `RANKING`
  con el endpoint genérico de decisiones. Tanto la clave de la etapa
  (`CLAVE_ETAPA_RANKING`) como esta transición llevan un comentario `TODO(contrato)`
  y están registradas como pendientes de backend (ver más abajo).
- **No hay endpoint de decisión masiva.** El envío es N llamadas secuenciales con
  un `Idempotency-Key` (UUID) por candidato y manejo de fallo parcial. Reintentar
  un candidato fallido usa una clave nueva.
- **Framework de pruebas: Vitest 4, no 3.** El plan preveía Vitest 3.x, pero esa
  línea falla al resolver la ruta del proyecto cuando contiene `%20` (espacio
  codificado). Se usó Vitest 4.1.11, que ya no tiene ese problema.
- **Componente `EstadoError`.** Se agregó un adaptador propio que traduce el
  `ApiError` del cliente HTTP a las props del estado de error del design system
  (que todavía no consume `ApiError` directamente). Todos los errores de la vista
  pasan por él.
- **Campos del mockup que el contrato no expone y quedaron fuera:** "líder de
  área" en la tarjeta de detalle, y un texto de experiencia/resumen en el
  subtítulo de la fila de candidato (se usa origen + fecha de postulación).
  Registrados como pendientes de backend.
- **Módulos de lógica añadidos y no listados en el plan:**
  `logica/resumenEtapaVacante.ts` (columna "Resumen de etapa" de la tabla),
  `logica/candidato.ts` (iniciales, nombre visible, regla de seleccionable) y el
  hook genérico `hooks/usePeticion.ts` que comparten todos los hooks de datos.

## Cómo probarla

### Pruebas automatizadas

El proyecto usa **Vitest** con Testing Library y jsdom. `vitest.config.ts`
replica el `alias` + `dedupe` de React / `@mui/material` / `@emotion` de la
config de build para no cargar dos copias de React en el entorno de pruebas.

```
pnpm test         # corre toda la suite una vez
pnpm test:watch   # modo watch
```

`pnpm test` forma parte de la cadena de validación previa a dar cualquier cambio
por terminado:

```
pnpm lint && pnpm format:check && pnpm build && pnpm test
```

Cobertura de esta entrega (pruebas unitarias y de integración con un cliente
HTTP falso, sin red):

- **Lógica de derivación:** `formatoFecha`, `paginacion` (conversión base 0 ↔
  base 1), `api/serializacion` (`?estado=A,B`), `mapaEstadosPorEtapa`
  (`resolverEtapaOperativa` con y sin coincidencia, `estadosDeEtapa` de una clave
  no mapeada), `subpasosPorEtapa`, `etiquetasEstado` (etiqueta fija y respaldo en
  Title Case), `candidato`.
- **Hooks:** `usePeticion` (patrón genérico: carga, error, cancelación de
  obsoletas), `useCandidatosEtapa` (cambio de etapa mientras carga → se descarta
  la respuesta vieja), `useSeleccionMultiple` (alternar y limpiar),
  `useEnviarPrefiltro` (todos correctos, fallo parcial, `409`).
- **Componentes:** `LayoutPasoPipeline` (renderiza ambos slots), `RailPipeline`
  (flechas deshabilitadas en los extremos), `ModalConfirmarPrefiltro` (lista de
  seleccionados, cancelar no llama, confirmar dispara el envío, progreso).
- **Integración:** `PaginaProcesosReclutador` — seleccionar una vacante dispara
  detalle + pipeline + lista de candidatos; seleccionar un candidato dispara su
  detalle; flujo de prefiltro con fallo parcial.

### Verificación manual

- **Primer uso de la tabla del design system en el repo.** Verificar en un
  navegador real que la tabla de vacantes y la lista de candidatos se montan y
  paginan sin errores de React ni de instancias de MUI.
- Seleccionar una vacante y comprobar que el detalle, el rail y la lista cargan.
- Navegar el rail con las flechas; comprobar que se deshabilitan en la primera y
  la última etapa y que las etapas posteriores al ranking muestran "en
  construcción" sin romper la vista.
- Marcar candidatos, abrir el modal de prefiltro, confirmar y comprobar que los
  aprobados dejan de aparecer bajo "En ranking" al recargarse la lista.

## Pendientes de backend

Estas notas dependen del servicio de orquestación (otro repositorio) y están
registradas en `docs/pendientes-backend.md`.

- Confirmar las claves reales de las etapas del pipeline del reclutador para
  fijar `CLAVE_ETAPA_RANKING` sin adivinar.
- Confirmar que aprobar la compuerta `RANKING` vía el endpoint de decisiones es
  la transición correcta `RANKING_SELECTA → PREFILTRO_PENDIENTE`, y su
  comportamiento cuando la compuerta está en política automática.
- Evaluar un endpoint de decisión masiva para `RANKING`.
- Evaluar un parámetro `etapa` en `GET /vacantes/{id}/candidatos` para no
  depender del mapa frontend de estados por etapa.
- Agregar "líder de área" a `VacanteDetalle`.
- Agregar un campo de experiencia/resumen a `CandidatoResumen` para el subtítulo
  de la fila del ranking.
- Confirmar la serialización esperada del parámetro `estado` (`?estado=A,B`).
