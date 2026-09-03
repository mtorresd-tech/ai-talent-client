import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { parsearResultadoBluesite } from './parseoResultado';

export interface DetalleResultadoBluesiteProps {
  resultado: unknown;
}

/** Resumen del resultado de Bluesite ya parseado; degrada si no calza la forma. */
export function DetalleResultadoBluesite({ resultado }: DetalleResultadoBluesiteProps) {
  const datos = parsearResultadoBluesite(resultado);
  if (!datos) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Sin resultado estructurado
      </Typography>
    );
  }

  return (
    <Box>
      {datos.pruebas.map((prueba) => (
        <Box key={prueba.tipoPrueba} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {prueba.tipoPrueba}
            {prueba.respondida ? ' · respondida' : ' · pendiente'}
          </Typography>
          {prueba.competencias.map((competencia) => (
            <Typography
              key={competencia.nombre}
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {competencia.nombre}: {Math.round(competencia.puntaje)}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}
