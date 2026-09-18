import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { GebDataTable, GebEmptyState, GebStatusChip, type GebColumna } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { VacanteResumen } from '../api/vacantes';
import {
  estadoRegistroVacante,
  etiquetaEstadoVacante,
  resumenEtapaVacante,
} from '../logica/resumenEtapaVacante';

/** Milisegundos de espera antes de disparar la búsqueda al backend. */
const DEBOUNCE_BUSQUEDA_MS = 300;

export interface TablaVacantesProps {
  respuesta: RespuestaPaginada<VacanteResumen> | null;
  cargando: boolean;
  error: ApiError | null;
  /** Página base 0. */
  pagina: number;
  tamanoPagina: number;
  /** `jobRequisitionId` de la vacante activa; resalta su fila. */
  vacanteSeleccionadaId: string | null;
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
  vacanteSeleccionadaId,
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
      render: (fila: VacanteResumen) => {
        const seleccionada = fila.jobRequisitionId === vacanteSeleccionadaId;
        return (
          <Box>
            {/* Marcador invisible para resaltar la fila con el selector `:has()`. */}
            {seleccionada && <span data-fila-seleccionada hidden />}
            <Typography
              variant="body2"
              sx={{
                fontWeight: seleccionada ? 700 : 600,
                color: seleccionada ? 'primary.main' : 'text.primary',
              }}
            >
              {fila.titulo}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {[fila.area, fila.ciudad].filter(Boolean).join(' · ') || 'Sin definir'}
            </Typography>
          </Box>
        );
      },
    },
    {
      campo: 'cerrada',
      titulo: 'Estado',
      render: (fila: VacanteResumen) => (
        <GebStatusChip
          estado={estadoRegistroVacante(fila.cerrada)}
          label={etiquetaEstadoVacante(fila.cerrada)}
        />
      ),
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
    <Box
      sx={{
        // `GebDataTable` no expone un estado de fila seleccionada: se marca la
        // fila/tarjeta activa con un `span` oculto (`data-fila-seleccionada`) y
        // se la detecta con `:has()` para reforzar su fondo y borde izquierdo.
        '& tbody tr:has([data-fila-seleccionada])': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
        '& tbody tr:has([data-fila-seleccionada]) td:first-of-type': {
          boxShadow: (theme) => `inset 4px 0 0 0 ${theme.palette.primary.main}`,
        },
        // Mismo resalte en la vista de tarjetas (viewports `< sm`), donde no hay
        // filas de tabla.
        '& [data-geb="GebDataTable-tarjetas"] .MuiCard-root:has([data-fila-seleccionada])': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          boxShadow: (theme) => `inset 4px 0 0 0 ${theme.palette.primary.main}`,
        },
        // Negrilla real en los encabezados de columna: `.MuiTableCell-head` cubre
        // la tabla de escritorio. En la vista de tarjetas mobile no hay
        // `TableCell` de header — el título de cada campo se pinta como
        // `Typography variant="caption"` dentro de la tarjeta, hijo directo de la
        // fila; el selector baja hasta ese nivel exacto para no afectar otros
        // textos en `caption` que pueda tener el contenido de cada campo.
        '& .MuiTableCell-head': { fontWeight: 700 },
        '& [data-geb="GebDataTable-tarjetas"] .MuiCard-root > .MuiCardContent-root > .MuiBox-root > .MuiTypography-caption':
          { fontWeight: 700 },
        // La paginación no encoge sola en pantallas angostas; se envuelve en
        // vez de forzar scroll horizontal.
        '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', rowGap: 0.25 },
      }}
    >
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
          totalFilas: respuesta?.meta?.total ?? 0,
          onCambioPagina,
        }}
        estadoVacio={
          <GebEmptyState
            titulo="No tienes vacantes asignadas"
            descripcion="Cuando se te asigne una vacante aparecerá en esta lista."
          />
        }
      />
    </Box>
  );
}
