import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GebDataTable, GebEmptyState, type GebColumna } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { VacanteResumen } from '../api/vacantes';
import { etiquetaEstadoVacante, resumenEtapaVacante } from '../logica/resumenEtapaVacante';

/** Milisegundos de espera antes de disparar la búsqueda al backend. */
const DEBOUNCE_BUSQUEDA_MS = 300;

export interface TablaVacantesProps {
  respuesta: RespuestaPaginada<VacanteResumen> | null;
  cargando: boolean;
  error: ApiError | null;
  /** Página base 0. */
  pagina: number;
  tamanoPagina: number;
  onCambioPagina: (pagina: number, tamanoPagina: number) => void;
  onBuscar: (texto: string) => void;
  onSeleccionar: (vacante: VacanteResumen) => void;
  onReintentar: () => void;
}

/*
 * `@geb/ui` está compilado contra los tipos de React 18; sus `render` de
 * columna devuelven un `ReactNode` que TS ve como distinto del de React 19 de
 * este repo. El cast agrupa las columnas para no repetir `as unknown` en cada
 * una — es una diferencia de identidad de tipos, no un error real.
 */
const comoColumnas = (columnas: unknown): readonly GebColumna<VacanteResumen>[] =>
  columnas as readonly GebColumna<VacanteResumen>[];

export function TablaVacantes({
  respuesta,
  cargando,
  error,
  pagina,
  tamanoPagina,
  onCambioPagina,
  onBuscar,
  onSeleccionar,
  onReintentar,
}: TablaVacantesProps) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const id = setTimeout(() => onBuscar(texto), DEBOUNCE_BUSQUEDA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  const columnas = comoColumnas([
    {
      campo: 'titulo',
      titulo: 'Vacante',
      render: (fila: VacanteResumen) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {fila.titulo}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {[fila.area, fila.ciudad].filter(Boolean).join(' · ') || 'Sin definir'}
          </Typography>
        </Box>
      ),
    },
    {
      campo: 'cerrada',
      titulo: 'Estado',
      render: (fila: VacanteResumen) => etiquetaEstadoVacante(fila.cerrada),
    },
    {
      campo: 'totalCandidatos',
      titulo: 'Candidatos',
      render: (fila: VacanteResumen) => String(fila.totalCandidatos),
    },
    {
      campo: 'conteoPorEstado',
      titulo: 'Resumen de etapa',
      render: (fila: VacanteResumen) => resumenEtapaVacante(fila.conteoPorEstado),
    },
  ]);

  return (
    <GebDataTable<VacanteResumen>
      columnas={columnas}
      filas={respuesta?.data ?? []}
      obtenerId={(fila) => fila.jobRequisitionId}
      cargando={cargando}
      filtro={texto}
      onCambioFiltro={setTexto}
      onClickFila={onSeleccionar}
      paginacion={{
        pagina,
        tamanoPagina,
        totalFilas: respuesta?.meta.total ?? 0,
        onCambioPagina,
      }}
      estadoVacio={
        <GebEmptyState
          titulo="No tienes vacantes asignadas"
          descripcion="Cuando se te asigne una vacante aparecerá en esta lista."
        />
      }
    />
  );
}
