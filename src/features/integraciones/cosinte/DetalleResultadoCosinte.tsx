import Box from '@mui/material/Box';
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
    <Box>
      <Typography variant="body2">
        Estado del estudio: <strong>{datos.estado}</strong>
      </Typography>
      {datos.nivelRiesgo && (
        <Typography variant="body2">
          Nivel de riesgo: <strong>{datos.nivelRiesgo}</strong>
        </Typography>
      )}
      {datos.tiempos && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {datos.tiempos.diasRestantes} de {datos.tiempos.diasHabiles} días hábiles restantes
        </Typography>
      )}
    </Box>
  );
}
