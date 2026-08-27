import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { GebDataTable, GebEmptyState, type GebColumna } from '@geb/ui';
import { EstadoError } from './EstadoError';
import type { ApiError } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { CandidatoResumen } from '../api/candidatos';
import { etiquetaEstado } from '../logica/etiquetasEstado';
import { esSeleccionablePrefiltro } from '../logica/candidato';
import { FilaCandidato } from './FilaCandidato';

export interface ListaRankingCandidatosProps {
  respuesta: RespuestaPaginada<CandidatoResumen> | null;
  cargando: boolean;
  error: ApiError | null;
  pagina: number;
  tamanoPagina: number;
  estaSeleccionado: (id: string) => boolean;
  onAlternarSeleccion: (id: string) => void;
  onCambioPagina: (pagina: number, tamanoPagina: number) => void;
  onClickCandidato: (candidato: CandidatoResumen) => void;
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
  estaSeleccionado,
  onAlternarSeleccion,
  onCambioPagina,
  onClickCandidato,
  onReintentar,
}: ListaRankingCandidatosProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  const columnas = comoColumnas([
    {
      campo: 'jobApplicationId',
      titulo: '',
      ancho: 48,
      render: (fila: CandidatoResumen) => {
        const habilitado = esSeleccionablePrefiltro(fila);
        const casilla = (
          <Checkbox
            size="small"
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
    },
    {
      campo: 'alias',
      titulo: 'Candidato',
      render: (fila: CandidatoResumen) => <FilaCandidato candidato={fila} />,
    },
    {
      campo: 'estado',
      titulo: 'Estado',
      ancho: 160,
      render: (fila: CandidatoResumen) => <Chip size="small" label={etiquetaEstado(fila.estado)} />,
    },
    {
      campo: 'scoreAfinidad',
      titulo: 'Afinidad',
      ancho: 90,
      render: (fila: CandidatoResumen) =>
        fila.scoreAfinidad === null ? '—' : `${Math.round(fila.scoreAfinidad)}%`,
    },
  ]);

  return (
    <GebDataTable<CandidatoResumen>
      columnas={columnas}
      filas={respuesta?.data ?? []}
      obtenerId={(fila) => fila.jobApplicationId}
      cargando={cargando}
      onClickFila={onClickCandidato}
      paginacion={{
        pagina,
        tamanoPagina,
        totalFilas: respuesta?.meta.total ?? 0,
        onCambioPagina,
      }}
      estadoVacio={<GebEmptyState titulo="No hay candidatos en esta etapa" />}
    />
  );
}
