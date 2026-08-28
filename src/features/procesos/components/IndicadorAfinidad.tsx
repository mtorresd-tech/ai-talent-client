import Box from '@mui/material/Box';
import { colorAfinidad } from '../logica/afinidad';

export interface IndicadorAfinidadProps {
  /** Score 0-100; `null` si el candidato aún no tiene afinidad calculada. */
  score: number | null;
  tamano?: number;
}

/**
 * Círculo de afinidad cuyo color varía de forma continua según el score.
 * Muestra el porcentaje redondeado, sin el signo `%` para no saturar el
 * círculo.
 */
export function IndicadorAfinidad({ score, tamano = 38 }: IndicadorAfinidadProps) {
  if (score === null) {
    return (
      <Box
        aria-label="Sin afinidad calculada"
        sx={{
          width: tamano,
          height: tamano,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: 'divider',
          color: 'text.disabled',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        —
      </Box>
    );
  }

  const redondeado = Math.round(score);
  return (
    <Box
      aria-label={`Afinidad ${redondeado}%`}
      sx={{
        width: tamano,
        height: tamano,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colorAfinidad(score),
        color: '#fff',
        fontWeight: 700,
        fontSize: tamano * 0.32,
        flexShrink: 0,
      }}
    >
      {redondeado}
    </Box>
  );
}
