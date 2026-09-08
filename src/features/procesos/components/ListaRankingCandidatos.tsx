import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { GebDataTable, GebEmptyState } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { CandidatoResumen } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import type { AtencionCandidato } from '../logica/atencionIntegraciones';
import { estiloTablaListaRankingCandidatos } from '../logica/estiloTablaListaRankingCandidatos';
import { construirColumnasListaRankingCandidatos } from './ColumnasListaRankingCandidatos';

export interface ListaRankingCandidatosProps {
  respuesta: RespuestaPaginada<CandidatoResumen> | null;
  cargando: boolean;
  error: ApiError | null;
  pagina: number;
  tamanoPagina: number;
  /**
   * `selecta`: paso de ranking — todas las filas están en `RANKING_SELECTA`, así
   * que se omite la columna de estado y se muestra checkbox de selección +
   * afinidad. `simple`: cualquier otro paso operativo — sin checkbox ni
   * afinidad; como agrupa más de un `EstadoProceso` (p. ej. el listado de
   * filtrados: prefiltro pendiente/completado y preseleccionado), sí muestra la
   * columna de estado.
   */
  variante: 'selecta' | 'simple';
  /**
   * Catálogo de estados del backend para la etiqueta y el color del chip de
   * estado (`variante="simple"`). Sin catálogo se usa el mapa local / Title Case.
   */
  catalogo?: EstadoCatalogo[] | null;
  /** Copy del estado vacío. Por defecto, un texto genérico del paso. */
  mensajeVacio?: string;
  /** Cruce por `jobApplicationId` para el badge "Requiere atención" (pasos Bluesite/Cosinte). */
  atencionPorCandidato?: Map<string, AtencionCandidato>;
  /** Nombre visible del proveedor para el tooltip del badge; sin él, cae a "el proveedor". */
  nombreProveedorAtencion?: string;
  estaSeleccionado: (id: string) => boolean;
  onAlternarSeleccion: (id: string) => void;
  onCambioPagina: (pagina: number, tamanoPagina: number) => void;
  onClickCandidato: (candidato: CandidatoResumen) => void;
  /** Abre la subpágina de detalle de un candidato desde su fila. */
  onVerDetalle?: (candidato: CandidatoResumen) => void;
  onReintentar: () => void;
}

export function ListaRankingCandidatos({
  respuesta,
  cargando,
  error,
  pagina,
  tamanoPagina,
  variante,
  catalogo,
  mensajeVacio,
  atencionPorCandidato,
  nombreProveedorAtencion,
  estaSeleccionado,
  onAlternarSeleccion,
  onCambioPagina,
  onClickCandidato,
  onVerDetalle,
  onReintentar,
}: ListaRankingCandidatosProps) {
  const esSelecta = variante === 'selecta';

  // En Selecta las filas se reordenan por afinidad descendente.
  const filas = useMemo(() => {
    const datos = respuesta?.data ?? [];
    if (!esSelecta) return datos;
    return [...datos].sort((a, b) => (b.scoreAfinidad ?? -1) - (a.scoreAfinidad ?? -1));
  }, [respuesta, esSelecta]);

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  const columnas = construirColumnasListaRankingCandidatos({
    esSelecta,
    catalogo,
    atencionPorCandidato,
    nombreProveedorAtencion,
    estaSeleccionado,
    onAlternarSeleccion,
    onVerDetalle,
  });

  return (
    <Box sx={estiloTablaListaRankingCandidatos(esSelecta)}>
      <GebDataTable<CandidatoResumen>
        columnas={columnas}
        filas={filas}
        obtenerId={(fila) => fila.jobApplicationId}
        cargando={cargando}
        onClickFila={onClickCandidato}
        paginacion={{
          pagina,
          tamanoPagina,
          totalFilas: respuesta?.meta?.total ?? 0,
          onCambioPagina,
        }}
        estadoVacio={<GebEmptyState titulo={mensajeVacio ?? 'No hay candidatos en este paso'} />}
      />
    </Box>
  );
}
