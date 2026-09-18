import Box from '@mui/material/Box';
import { GebDataTable, GebEmptyState } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { InformeIncognito } from '../api/bandejas';
import { construirColumnasTablaInformesIncognito } from './ColumnasTablaInformesIncognito';

export interface TablaInformesIncognitoProps {
  respuesta: RespuestaPaginada<InformeIncognito> | null;
  cargando: boolean;
  error: ApiError | null;
  /** Página base 0, independiente de la tabla de vacantes. */
  pagina: number;
  tamanoPagina: number;
  onCambioPagina: (pagina: number, tamanoPagina: number) => void;
  onVerInforme: (informe: InformeIncognito) => void;
  onReintentar: () => void;
}

/**
 * Tabla de informes anonimizados de la vacante activa. Paginación server-side
 * propia; cada fila se identifica por `alias` (único dato visible del
 * candidato). El ícono de ojo abre el informe en un modal de solo consulta.
 */
export function TablaInformesIncognito({
  respuesta,
  cargando,
  error,
  pagina,
  tamanoPagina,
  onCambioPagina,
  onVerInforme,
  onReintentar,
}: TablaInformesIncognitoProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  const columnas = construirColumnasTablaInformesIncognito({ onVerInforme });

  return (
    <Box
      sx={{
        // Negrilla real en los encabezados de columna: `.MuiTableCell-head`
        // cubre la tabla de escritorio; en la vista de tarjetas mobile el
        // título de cada campo se pinta como `Typography variant="caption"`,
        // hijo directo de la fila — mismo criterio que `TablaVacantes`.
        '& .MuiTableCell-head': { fontWeight: 700 },
        '& [data-geb="GebDataTable-tarjetas"] .MuiCard-root > .MuiCardContent-root > .MuiBox-root > .MuiTypography-caption':
          { fontWeight: 700 },
        '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', rowGap: 0.25 },
      }}
    >
      <GebDataTable<InformeIncognito>
        columnas={columnas}
        filas={respuesta?.data ?? []}
        obtenerId={(informe) => informe.alias}
        cargando={cargando}
        paginacion={{
          pagina,
          tamanoPagina,
          totalFilas: respuesta?.meta?.total ?? 0,
          onCambioPagina,
        }}
        estadoVacio={
          <GebEmptyState titulo="Esta vacante no tiene informes anonimizados por revisar." />
        }
      />
    </Box>
  );
}
