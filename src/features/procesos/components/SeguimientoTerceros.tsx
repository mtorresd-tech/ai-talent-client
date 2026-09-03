import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  DetalleResultadoBluesite,
  DetalleResultadoCosinte,
  DetalleResultadoMedilaboral,
  TarjetaProveedor,
  type EstadoIntegracion,
} from '../../integraciones';

export interface SeguimientoTercerosProps {
  integraciones: EstadoIntegracion[];
}

function detalleProveedor(integracion: EstadoIntegracion) {
  switch (integracion.proveedor) {
    case 'BLUESITE':
      return <DetalleResultadoBluesite resultado={integracion.resultado} />;
    case 'COSINTE':
      return <DetalleResultadoCosinte resultado={integracion.resultado} />;
    case 'MEDILABORAL':
      return <DetalleResultadoMedilaboral resultado={integracion.resultado} />;
    default:
      return null;
  }
}

/**
 * Sección "Evaluaciones de terceros": banner informativo y una tarjeta de solo
 * lectura por proveedor presente en `CandidatoDetalle.integraciones`. Sin
 * acciones de refresco ni decisión.
 */
export function SeguimientoTerceros({ integraciones }: SeguimientoTercerosProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Evaluaciones de terceros
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Estas evaluaciones las gestionan proveedores externos. La información es de solo consulta.
      </Alert>

      {integraciones.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Todavía no hay evaluaciones de terceros para este candidato.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {integraciones.map((integracion) => (
            <TarjetaProveedor key={integracion.proveedor} integracion={integracion}>
              {detalleProveedor(integracion)}
            </TarjetaProveedor>
          ))}
        </Stack>
      )}
    </Box>
  );
}
