import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebEmptyState, GebSelectInput, type GebOpcionSelect } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { Compuerta } from '../../../shared/tipos/dominio';
import type { EfectividadEtapa } from '../api/metricas';
import { etiquetaCompuerta } from '../logica/etiquetaCompuerta';
import { EstadoError } from '../../procesos/components/EstadoError';

const COMPUERTAS: Compuerta[] = [
  'RANKING',
  'PREFILTRO',
  'LIDER',
  'BLUESITE',
  'COSINTE',
  'ENTREVISTA_JEFE',
  'SEGUNDA_ENTREVISTA',
  'MEDILABORAL',
];

const OPCIONES: GebOpcionSelect[] = [
  { valor: '', etiqueta: 'Selecciona una etapa' },
  ...COMPUERTAS.map((compuerta) => ({ valor: compuerta, etiqueta: etiquetaCompuerta(compuerta) })),
];

export interface PanelEfectividadEtapaProps {
  etapa: Compuerta | null;
  onCambioEtapa: (etapa: Compuerta) => void;
  datos: EfectividadEtapa | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

function Desglose({
  titulo,
  internos,
  externos,
}: {
  titulo: string;
  internos: number;
  externos: number;
}) {
  return (
    <Box>
      <Typography variant="subtitle2">{titulo}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Internos: {internos}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Externos: {externos}
      </Typography>
    </Box>
  );
}

/** Efectividad (aprobados/rechazados por tipo de candidato) de la compuerta elegida por el usuario. */
export function PanelEfectividadEtapa({
  etapa,
  onCambioEtapa,
  datos,
  cargando,
  error,
  onReintentar,
}: PanelEfectividadEtapaProps) {
  return (
    <Stack spacing={2}>
      <GebSelectInput
        name="metricas-efectividad-etapa"
        label="Etapa"
        value={etapa ?? ''}
        onChange={(valor) => {
          if (valor) onCambioEtapa(valor as Compuerta);
        }}
        opciones={OPCIONES}
      />

      {error ? (
        <EstadoError error={error} onReintentar={onReintentar} />
      ) : !etapa ? (
        <GebEmptyState titulo="Elige una etapa para ver su efectividad." />
      ) : cargando && !datos ? (
        <Skeleton variant="rounded" height={120} />
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Desglose
            titulo="Aprobados"
            internos={datos?.aprobados.internos ?? 0}
            externos={datos?.aprobados.externos ?? 0}
          />
          <Desglose
            titulo="Rechazados"
            internos={datos?.rechazados.internos ?? 0}
            externos={datos?.rechazados.externos ?? 0}
          />
        </Stack>
      )}
    </Stack>
  );
}
