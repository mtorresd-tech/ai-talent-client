import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { formatearFechaHora } from '../logica/formatoFecha';
import { parsearResultadoMedilaboral } from './parseoResultado';
import type { ConceptoAptitud } from './tipos';

export interface DetalleResultadoMedilaboralProps {
  resultado: unknown;
}

const ETIQUETA_MODALIDAD: Record<string, string> = {
  CITA_PREVIA: 'Cita previa',
  ORDEN_DE_LLEGADA: 'Orden de llegada',
  PROGRAMAR_CON_SERVICIO_CLIENTE: 'Programar con servicio al cliente',
};

const COLOR_CONCEPTO_APTITUD: Record<ConceptoAptitud, 'success' | 'warning' | 'error'> = {
  APTO: 'success',
  APTO_CON_OBSERVACIONES: 'warning',
  NO_APTO: 'error',
};

const ETIQUETA_CONCEPTO_APTITUD: Record<ConceptoAptitud, string> = {
  APTO: 'Apto',
  APTO_CON_OBSERVACIONES: 'Apto con observaciones',
  NO_APTO: 'No apto',
};

/**
 * Resumen del resultado de Medilaboral: orden de servicio, sede, cita,
 * modalidad y, cuando ya llegó, el concepto de aptitud como chip de color con
 * sus observaciones y la fecha en que se emitió.
 */
export function DetalleResultadoMedilaboral({ resultado }: DetalleResultadoMedilaboralProps) {
  const datos = parsearResultadoMedilaboral(resultado);
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
        Orden de servicio: <strong>{datos.idOrdenServicio}</strong>
      </Typography>
      {datos.sede && <Typography variant="body2">Sede: {datos.sede}</Typography>}
      {datos.fechaCita && (
        <Typography variant="body2">Cita: {formatearFechaHora(datos.fechaCita)}</Typography>
      )}
      {datos.modalidad && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Modalidad: {ETIQUETA_MODALIDAD[datos.modalidad] ?? datos.modalidad}
        </Typography>
      )}
      {datos.conceptoAptitud && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={ETIQUETA_CONCEPTO_APTITUD[datos.conceptoAptitud]}
            color={COLOR_CONCEPTO_APTITUD[datos.conceptoAptitud]}
            size="small"
          />
        </Box>
      )}
      {datos.observaciones && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>Observaciones: </strong>
          {datos.observaciones}
        </Typography>
      )}
      {datos.fechaConcepto && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Fecha de concepto: {formatearFechaHora(datos.fechaConcepto)}
        </Typography>
      )}
    </Box>
  );
}
