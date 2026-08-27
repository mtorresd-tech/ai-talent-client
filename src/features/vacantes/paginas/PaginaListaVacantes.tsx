import { GebEmptyState } from '@geb/ui';

/** TODO: reemplazar por GebDataTable de @geb/ui consumiendo listarVacantes(). */
export function PaginaListaVacantes() {
  return (
    <GebEmptyState
      titulo="Procesos de selección activos"
      descripcion="TODO: listar vacantes (GET /vacantes) con conteo de candidatos por estado."
    />
  );
}
