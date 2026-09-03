import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatearFechaHora } from '../logica/formatoFecha';
import { parsearResultadoMedilaboral } from './parseoResultado';

export interface DetalleResultadoMedilaboralProps {
  resultado: unknown;
}

const ETIQUETA_MODALIDAD: Record<string, string> = {
  CITA_PREVIA: 'Cita previa',
  ORDEN_DE_LLEGADA: 'Orden de llegada',
  PROGRAMAR_CON_SERVICIO_CLIENTE: 'Programar con servicio al cliente',
};

/**
 * Resumen del resultado de Medilaboral. El proveedor solo entrega un PDF; si
 * el `resultado` trae datos, se muestran orden de servicio, sede y cita.
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
    </Box>
  );
}
