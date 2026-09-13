import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';

/**
 * TODO: sin endpoint todavía en el contrato del backend — página del
 * reclutador, no inventar forma de datos hasta que exista un requirement
 * concreto para esta pantalla.
 */
export function PaginaMetricas() {
  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      <EncabezadoPagina
        titulo="Métricas"
        subtitulo="Consulta indicadores sobre el desempeño de tus procesos de selección."
      />
      <GebEmptyState
        titulo="Muy pronto"
        descripcion="Esta sección estará disponible en una próxima entrega."
      />
    </Stack>
  );
}
