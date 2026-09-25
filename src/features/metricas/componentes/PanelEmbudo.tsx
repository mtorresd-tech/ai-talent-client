import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ApiError } from '@geb/api-client';
import type { EmbudoSelecta } from '../api/metricas';
import { calcularConversion } from '../logica/calcularConversion';
import { EstadoError } from '../../procesos/components/EstadoError';

export interface PanelEmbudoProps {
  datos: EmbudoSelecta | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

interface Bloque {
  etiqueta: string;
  valor: number;
}

function Conversion({ desde, hasta }: { desde: number; hasta: number }) {
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1 }}>
      {calcularConversion(hasta, desde)} de conversión
    </Typography>
  );
}

/** Cascada del embudo temprano de Selecta, con el porcentaje de conversión entre cada par de bloques. */
export function PanelEmbudo({ datos, cargando, error, onReintentar }: PanelEmbudoProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !datos) {
    return <Skeleton variant="rounded" height={160} />;
  }

  const bloques: Bloque[] = [
    { etiqueta: 'Propuestos por Selecta', valor: datos?.propuestosSelecta ?? 0 },
    { etiqueta: 'Llegaron a prefiltro telefónico', valor: datos?.llegaronPrefiltroTelefonico ?? 0 },
    { etiqueta: 'Enviados a prefiltro manual', valor: datos?.enviadosPrefiltroManual ?? 0 },
  ];

  return (
    <Stack spacing={1}>
      {bloques.map((bloque, indice) => (
        <Box key={bloque.etiqueta}>
          {indice > 0 && <Conversion desde={bloques[indice - 1].valor} hasta={bloque.valor} />}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {bloque.valor}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {bloque.etiqueta}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
