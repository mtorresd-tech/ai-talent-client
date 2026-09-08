import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { parsearResultadoCosinte } from './parseoResultado';

export interface DetalleResultadoCosinteProps {
  resultado: unknown;
}

/** Resumen del resultado de Cosinte ya parseado; degrada si no calza la forma. */
export function DetalleResultadoCosinte({ resultado }: DetalleResultadoCosinteProps) {
  const datos = parsearResultadoCosinte(resultado);
  if (!datos) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Sin resultado estructurado
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75}>
      <Typography variant="body2">
        Estado del estudio: <strong>{datos.estado}</strong>
      </Typography>
      {datos.nivelRiesgo && (
        <Typography variant="body2">
          Nivel de riesgo: <strong>{datos.nivelRiesgo}</strong>
        </Typography>
      )}
      {datos.tiempos && (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {Math.round(datos.tiempos.progreso * 100)}% completado
          </Typography>
          <LinearProgress
            variant="determinate"
            value={datos.tiempos.progreso * 100}
            aria-label="Avance del estudio de seguridad"
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
          >
            {datos.tiempos.diasRestantes} de {datos.tiempos.diasHabiles} días hábiles restantes
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
