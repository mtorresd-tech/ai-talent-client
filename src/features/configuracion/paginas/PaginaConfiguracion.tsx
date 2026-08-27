import { GebEmptyState } from '@geb/ui';

/** TODO: administrar política MANUAL/AUTOMATICA por compuerta (solo rol administrador). */
export function PaginaConfiguracion() {
  return (
    <GebEmptyState
      titulo="Configuración de compuertas"
      descripcion="TODO: listar y editar políticas por compuerta (GET/PUT /politicas)."
    />
  );
}
