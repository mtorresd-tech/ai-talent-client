import { GebEmptyState } from '@geb/ui';

/**
 * TODO: pantalla "Procesos" del reclutador — tabla de vacantes, cabecera de
 * la vacante seleccionada, rail de pipeline armado con
 * obtenerPipeline() (el orden y la composición los da el backend, no se
 * hardcodea) y tabla de candidatos de la etapa activa. Las acciones sobre un
 * candidato (prefiltro, anonimizar, ver integraciones, decidir, generar
 * oferta) viven dentro de esta misma pantalla, no en rutas separadas.
 */
export function PaginaProcesosReclutador() {
  return (
    <GebEmptyState
      titulo="Procesos de selección activos"
      descripcion="TODO: vacantes, pipeline y candidatos (GET /vacantes, /vacantes/{id}/pipeline, /vacantes/{id}/candidatos)."
    />
  );
}
