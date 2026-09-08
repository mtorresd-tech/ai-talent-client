import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EstadoIntegracion } from '../api/integracionesApi';
import { formatearFechaHora } from '../logica/formatoFecha';
import { nombreProveedor } from '../logica/nombreProveedor';
import { BadgeSubestado } from './BadgeSubestado';

export interface TarjetaProveedorProps {
  integracion: EstadoIntegracion;
  /** Resumen del resultado ya parseado; si se omite, la tarjeta solo muestra subestado y fechas. */
  children?: ReactNode;
}

function Fecha({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2" noWrap>
        {formatearFechaHora(valor)}
      </Typography>
    </Box>
  );
}

/**
 * Tarjeta de solo lectura de una evaluación de proveedor externo: encabezado
 * con el nombre del proveedor y el badge de subestado, fechas de solicitud /
 * resultado / expiración y un espacio para el resumen del resultado.
 */
export function TarjetaProveedor({ integracion, children }: TarjetaProveedorProps) {
  const nombre = nombreProveedor(integracion.proveedor);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {nombre}
        </Typography>
        <BadgeSubestado subestado={integracion.subestado} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1,
          mt: 1.5,
        }}
      >
        <Fecha etiqueta="Solicitud" valor={integracion.fechaSolicitud} />
        <Fecha etiqueta="Resultado" valor={integracion.fechaResultado} />
        <Fecha etiqueta="Expiración" valor={integracion.fechaExpiracion} />
      </Box>

      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
        {children ?? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sin resultado estructurado
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
