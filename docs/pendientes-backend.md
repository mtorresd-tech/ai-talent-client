# Pendientes de backend

Cambios o confirmaciones que dependen del servicio de orquestación de IA Talento
(repositorio aparte) y que hoy el frontend resuelve con supuestos, adaptadores o
placeholders. Cada entrada indica la funcionalidad que la originó.

## Vista general de Procesos (Reclutador) — `docs/p-02-vista-general-procesos.md`

- **Claves del pipeline del reclutador.** Confirmar el juego real de `clave` /
  `nombre` que devuelve `GET /vacantes/{id}/pipeline` para el portal del
  reclutador. El frontend fija hoy la etapa de ranking con la constante
  `CLAVE_ETAPA_RANKING = 'RANKING'` (marcada con `TODO(contrato)`); si la clave
  real es otra, la etapa de ranking no se activará.
- **Transición del prefiltro.** Confirmar que aprobar la compuerta `RANKING` con
  `POST /candidatos/{id}/decisiones` (`{ compuerta: 'RANKING', decision: 'APRUEBA' }`)
  es la transición correcta `RANKING_SELECTA → PREFILTRO_PENDIENTE`, y qué pasa si
  esa compuerta está en política `AUTOMATICA`.
- **Decisión masiva para `RANKING`.** Evaluar un endpoint de decisión en lote.
  Hoy el frontend hace N `POST` secuenciales con `Idempotency-Key` por candidato
  y consolida el fallo parcial.
- **Filtro por etapa en la lista de candidatos.** Evaluar un parámetro `etapa`
  opcional en `GET /vacantes/{id}/candidatos`. Hoy el frontend traduce la etapa
  del pipeline a una lista de `estado` con un mapa propio (`ESTADOS_POR_ETAPA`),
  porque el endpoint solo filtra por estado.
- **Líder de área en `VacanteDetalle`.** El endpoint no expone "líder de área" y
  el diseño lo pide. Evaluar agregar `liderArea { nombre, email }`.
- **Experiencia/resumen en `CandidatoResumen`.** No hay un campo para el
  subtítulo de la fila del ranking; hoy se usa `origenPostulacion` +
  `fechaPostulacion`.
- **Serialización del parámetro `estado`.** El frontend lo envía como
  `?estado=A,B` (`style: form`, `explode: false`). Confirmar que coincide con lo
  que valida el backend.
