import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SincronizacionSfsf } from '../../../shared/tipos/dominio';
import { formatearFechaHora } from '../logica/formatoFecha';

export interface EstadoSincronizacionSfsfProps {
  sincronizacion: SincronizacionSfsf;
}

const TEXTO_ESTADO: Record<SincronizacionSfsf['estado'], string> = {
  SINCRONIZADO: 'Sincronizado con SuccessFactors',
  PENDIENTE: 'Sincronización con SuccessFactors en curso.',
  FALLIDA: 'La sincronización con SuccessFactors falló.',
};

/**
 * Bloque informativo del estado de proyección del candidato hacia SuccessFactors:
 * estado, última sincronización e intentos. Si la sincronización falló, añade un
 * aviso con el detalle del error. No ofrece reintento manual: lo reintenta el
 * consumidor de la cola en el backend.
 */
export function EstadoSincronizacionSfsf({ sincronizacion }: EstadoSincronizacionSfsfProps) {
  const { estado, ultimaSincronizacion, intentos, ultimoError } = sincronizacion;
  const textoIntentos = `${intentos} ${intentos === 1 ? 'intento' : 'intentos'}`;
  const fechaTexto = ultimaSincronizacion ? formatearFechaHora(ultimaSincronizacion) : 'Sin fecha';

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Sincronización con SuccessFactors
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {TEXTO_ESTADO[estado] ?? 'Estado de sincronización desconocido.'}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
        Última sincronización: {fechaTexto} · Intentos: {intentos}
      </Typography>
      {estado === 'FALLIDA' && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {`La sincronización con SuccessFactors falló.${
            ultimoError ? ` ${ultimoError}.` : ''
          } ${textoIntentos}.`}
        </Alert>
      )}
    </Box>
  );
}
