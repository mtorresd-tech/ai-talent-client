import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebDateInput } from '@geb/ui';

export interface FiltroRangoFechasProps {
  desde: string;
  hasta: string;
  onCambioDesde: (valorIso: string) => void;
  onCambioHasta: (valorIso: string) => void;
}

/**
 * Rango de fechas de los cuatro paneles de Métricas. El mismo rango alimenta
 * endpoints con semánticas de fecha distintas (publicación en Resumen,
 * postulación o decisión en los demás) — la nota debajo de los campos aclara
 * esa diferencia.
 */
export function FiltroRangoFechas({
  desde,
  hasta,
  onCambioDesde,
  onCambioHasta,
}: FiltroRangoFechasProps) {
  return (
    <Stack spacing={0.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 2 }}>
        <GebDateInput
          name="metricas-desde"
          label="Desde"
          value={desde}
          onChange={onCambioDesde}
          max={hasta || undefined}
        />
        <GebDateInput
          name="metricas-hasta"
          label="Hasta"
          value={hasta}
          onChange={onCambioHasta}
          min={desde || undefined}
        />
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        El rango filtra por fecha de publicación en Resumen, y por fecha de postulación o de
        decisión en los demás paneles.
      </Typography>
    </Stack>
  );
}
