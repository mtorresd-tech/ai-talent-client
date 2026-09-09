import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { type GebColumna } from '@geb/ui';
import type { CandidatoResumen } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { esSeleccionablePrefiltro } from '../logica/candidato';
import { resolverColorEstado, resolverEtiquetaEstado } from '../logica/etiquetasEstado';
import { formatearFecha } from '../logica/formatoFecha';
import type { AtencionCandidato } from '../logica/atencionIntegraciones';
import { FilaCandidato } from './FilaCandidato';
import { IndicadorAfinidad } from './IndicadorAfinidad';

/*
 * `@geb/ui` está compilado contra los tipos de React 18; sus `render` de
 * columna devuelven un `ReactNode` que TS ve como distinto del de React 19 de
 * este repo. El cast agrupa las columnas — es una diferencia de identidad de
 * tipos, no un error real.
 */
const comoColumnas = (columnas: unknown): readonly GebColumna<CandidatoResumen>[] =>
  columnas as readonly GebColumna<CandidatoResumen>[];

export interface ParametrosColumnasListaRankingCandidatos {
  esSelecta: boolean;
  /** Catálogo de estados del backend para la etiqueta y el color del chip (`variante="simple"`). */
  catalogo?: EstadoCatalogo[] | null;
  /** Cruce por `jobApplicationId` para el badge "Requiere atención" (pasos Bluesite/Cosinte). */
  atencionPorCandidato?: Map<string, AtencionCandidato>;
  /** Nombre visible del proveedor para el tooltip del badge; sin él, cae a "el proveedor". */
  nombreProveedorAtencion?: string;
  estaSeleccionado: (id: string) => boolean;
  onAlternarSeleccion: (id: string) => void;
  onVerDetalle?: (candidato: CandidatoResumen) => void;
}

/** Columna de checkbox de selección, solo para la variante `selecta`. */
function construirColumnaSeleccion({
  estaSeleccionado,
  onAlternarSeleccion,
}: Pick<
  ParametrosColumnasListaRankingCandidatos,
  'estaSeleccionado' | 'onAlternarSeleccion'
>): GebColumna<CandidatoResumen> {
  return {
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
}

/** Columna de indicador de afinidad, solo para la variante `selecta`. */
function construirColumnaAfinidad(): GebColumna<CandidatoResumen> {
  return {
    campo: 'scoreAfinidad',
    titulo: 'Afinidad',
    ancho: '22%',
    render: (fila: CandidatoResumen) => <IndicadorAfinidad score={fila.scoreAfinidad} />,
  };
}

/** Columna de estado + badge "Requiere atención", solo para la variante `simple`. */
function construirColumnaEstado({
  catalogo,
  atencionPorCandidato,
  nombreProveedorAtencion,
}: Pick<
  ParametrosColumnasListaRankingCandidatos,
  'catalogo' | 'atencionPorCandidato' | 'nombreProveedorAtencion'
>): GebColumna<CandidatoResumen> {
  return {
    campo: 'estado',
    titulo: 'Estado',
    ancho: '42%',
    render: (fila: CandidatoResumen) => {
      const atencion = atencionPorCandidato?.get(fila.jobApplicationId);
      return (
        <Box sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            color={resolverColorEstado(catalogo, fila.estado)}
            label={resolverEtiquetaEstado(catalogo, fila.estado)}
            sx={{ fontSize: '0.625rem', height: 20, '& .MuiChip-label': { px: 1 } }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
          >
            desde {formatearFecha(fila.estadoDesde)}
          </Typography>
          {atencion?.requiereAtencion && (
            <Tooltip
              title={`La integración con ${nombreProveedorAtencion ?? 'el proveedor'} tiene un error, expiró, o superó la fecha estimada de entrega sin resultado. ${atencion.diasTranscurridos} días transcurridos.`}
            >
              <Chip
                size="small"
                color="warning"
                label="Requiere atención"
                sx={{ fontSize: '0.625rem', height: 20, mt: 0.5, '& .MuiChip-label': { px: 1 } }}
              />
            </Tooltip>
          )}
        </Box>
      );
    },
  };
}

/**
 * Arma las columnas de `ListaRankingCandidatos` según la variante: `selecta`
 * (checkbox + afinidad) o `simple` (estado + badge de atención).
 */
export function construirColumnasListaRankingCandidatos({
  esSelecta,
  catalogo,
  atencionPorCandidato,
  nombreProveedorAtencion,
  estaSeleccionado,
  onAlternarSeleccion,
  onVerDetalle,
}: ParametrosColumnasListaRankingCandidatos): readonly GebColumna<CandidatoResumen>[] {
  return comoColumnas([
    ...(esSelecta ? [construirColumnaSeleccion({ estaSeleccionado, onAlternarSeleccion })] : []),
    {
      campo: 'alias',
      titulo: 'Candidato',
      ancho: esSelecta ? '52%' : '58%',
      render: (fila: CandidatoResumen) => (
        <FilaCandidato candidato={fila} onVerDetalle={onVerDetalle} />
      ),
    },
    ...(esSelecta
      ? [construirColumnaAfinidad()]
      : [construirColumnaEstado({ catalogo, atencionPorCandidato, nombreProveedorAtencion })]),
  ]);
}
