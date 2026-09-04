import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GebDataTable, GebEmptyState, type GebColumna } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { CandidatoResumen } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { esSeleccionablePrefiltro } from '../logica/candidato';
import { resolverColorEstado, resolverEtiquetaEstado } from '../logica/etiquetasEstado';
import { formatearFecha } from '../logica/formatoFecha';
import { FilaCandidato } from './FilaCandidato';
import { IndicadorAfinidad } from './IndicadorAfinidad';

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
  estaSeleccionado: (id: string) => boolean;
  onAlternarSeleccion: (id: string) => void;
  onCambioPagina: (pagina: number, tamanoPagina: number) => void;
  onClickCandidato: (candidato: CandidatoResumen) => void;
  /** Abre la subpágina de detalle de un candidato desde su fila. */
  onVerDetalle?: (candidato: CandidatoResumen) => void;
  onReintentar: () => void;
}

/*
 * `@geb/ui` está compilado contra los tipos de React 18; sus `render` de
 * columna devuelven un `ReactNode` que TS ve como distinto del de React 19 de
 * este repo. El cast agrupa las columnas — es una diferencia de identidad de
 * tipos, no un error real.
 */
const comoColumnas = (columnas: unknown): readonly GebColumna<CandidatoResumen>[] =>
  columnas as readonly GebColumna<CandidatoResumen>[];

export function ListaRankingCandidatos({
  respuesta,
  cargando,
  error,
  pagina,
  tamanoPagina,
  variante,
  catalogo,
  mensajeVacio,
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

  const columnaSeleccion: GebColumna<CandidatoResumen> = {
    campo: 'jobApplicationId',
    titulo: '',
    ancho: 28,
    render: (fila: CandidatoResumen) => {
      const habilitado = esSeleccionablePrefiltro(fila);
      const casilla = (
        <Checkbox
          size="small"
          sx={{ p: 0, mt: '4px' }}
          checked={estaSeleccionado(fila.jobApplicationId)}
          disabled={!habilitado}
          onClick={(evento) => evento.stopPropagation()}
          onChange={() => onAlternarSeleccion(fila.jobApplicationId)}
          slotProps={{
            input: {
              'aria-label': `Seleccionar candidato ${fila.rankingPosicion ?? ''}`,
            },
          }}
        />
      );
      return habilitado ? (
        casilla
      ) : (
        <Tooltip title="Este candidato no tiene pendiente la decisión de ranking">
          <span>{casilla}</span>
        </Tooltip>
      );
    },
  };

  const columnaAfinidad: GebColumna<CandidatoResumen> = {
    campo: 'scoreAfinidad',
    titulo: 'Afinidad',
    ancho: '22%',
    render: (fila: CandidatoResumen) => <IndicadorAfinidad score={fila.scoreAfinidad} />,
  };

  const columnaEstado: GebColumna<CandidatoResumen> = {
    campo: 'estado',
    titulo: 'Estado',
    ancho: '42%',
    render: (fila: CandidatoResumen) => (
      <Box sx={{ minWidth: 0 }}>
        <Chip
          size="small"
          color={resolverColorEstado(catalogo, fila.estado)}
          label={resolverEtiquetaEstado(catalogo, fila.estado)}
          sx={{ fontSize: '0.625rem', height: 20, '& .MuiChip-label': { px: 1 } }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
          desde {formatearFecha(fila.estadoDesde)}
        </Typography>
      </Box>
    ),
  };

  const columnas = comoColumnas([
    ...(esSelecta ? [columnaSeleccion] : []),
    {
      campo: 'alias',
      titulo: 'Candidato',
      ancho: esSelecta ? '52%' : '58%',
      render: (fila: CandidatoResumen) => (
        <FilaCandidato candidato={fila} onVerDetalle={onVerDetalle} />
      ),
    },
    ...(esSelecta ? [columnaAfinidad] : [columnaEstado]),
  ]);

  return (
    <Box
      sx={{
        // `table-layout: fixed` obliga a cada columna a respetar su `ancho`: sin
        // esto, la columna "Candidato" (sin ancho fijo) crece con el contenido
        // (nombre + origen + fecha) y empuja la tabla a un scroll horizontal
        // innecesario en el layout de 340px del paso.
        '& .MuiTable-root': { tableLayout: 'fixed', width: '100%' },
        // Con el bloque de identidad a varias líneas (nombre + meta + "Ver
        // detalle"), alinear el contenido de cada celda arriba deja el avatar,
        // el checkbox y la afinidad a la altura del nombre, no flotando al
        // centro vertical de la fila.
        '& .MuiTableCell-root': { verticalAlign: 'top' },
        ...(esSelecta
          ? {
              // Acerca el checkbox al avatar: recorta el relleno lateral entre
              // la primera columna (selección) y la segunda (candidato).
              '& td:first-of-type, & th:first-of-type': { pr: 0 },
              '& td:nth-of-type(2), & th:nth-of-type(2)': { pl: 0.5 },
            }
          : {}),
        // La paginación de GebDataTable no encoge sola en columnas angostas;
        // se compacta para que quepa sin scroll horizontal propio.
        '& .MuiTablePagination-toolbar': {
          flexWrap: 'wrap',
          minHeight: 'auto',
          rowGap: 0.25,
          pl: 1,
          pr: 0.5,
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          fontSize: '0.7rem',
        },
        '& .MuiTablePagination-select': {
          fontSize: '0.7rem',
        },
        '& .MuiTablePagination-actions': {
          ml: 0,
        },
        '& .MuiTablePagination-actions .MuiIconButton-root': {
          p: 0.5,
        },
      }}
    >
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
