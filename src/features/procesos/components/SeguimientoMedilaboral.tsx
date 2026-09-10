import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import { DetalleResultadoMedilaboral, TarjetaProveedor } from '../../integraciones';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { nombreCandidato } from '../logica/candidato';
import { describirEstadoMedilaboral } from '../logica/seguimientoMedilaboral';
import { EncabezadoSeguimientoPaso } from './EncabezadoSeguimientoPaso';
import { EstadoError } from './EstadoError';
import { EstadoSincronizacionSfsf } from './EstadoSincronizacionSfsf';
import { ResumenEstadoPaso } from './ResumenEstadoPaso';

export interface SeguimientoMedilaboralProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  catalogo?: EstadoCatalogo[] | null;
  /** Si se pasa, se muestra el enlace "Ver detalle completo"; si no, se omite. */
  onVerDetalleCompleto?: () => void;
}

/**
 * Panel derecho del paso "Medilaboral": estado de los exámenes médicos del
 * candidato seleccionado en lenguaje claro, distintivo interno/externo, el
 * resultado estructurado del proveedor y el estado de sincronización con
 * SuccessFactors. Es de solo consulta: no ofrece ninguna acción de escritura.
 */
export function SeguimientoMedilaboral({
  candidato,
  cargando,
  error,
  onReintentar,
  catalogo,
  onVerDetalleCompleto,
}: SeguimientoMedilaboralProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !candidato) {
    return <LinearProgress aria-label="Cargando seguimiento" />;
  }

  if (!candidato) {
    return (
      <GebEmptyState
        titulo="Selecciona un candidato"
        descripcion="Selecciona un candidato de la lista para ver su resultado de Medilaboral."
      />
    );
  }

  const resumen = describirEstadoMedilaboral(candidato.estado, catalogo);
  const integracionMedilaboral = candidato.integraciones.find((i) => i.proveedor === 'MEDILABORAL');

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        minWidth: 0,
      }}
    >
      <EncabezadoSeguimientoPaso
        nombre={nombreCandidato(candidato)}
        estado={candidato.estado}
        catalogo={catalogo}
        tipoCandidato={candidato.tipoCandidato}
      />

      <ResumenEstadoPaso
        titulo={resumen.titulo}
        descripcion={resumen.descripcion}
        estadoDesde={candidato.estadoDesde}
      />

      <Box sx={{ mt: 2 }}>
        {integracionMedilaboral ? (
          <TarjetaProveedor integracion={integracionMedilaboral}>
            <DetalleResultadoMedilaboral resultado={integracionMedilaboral.resultado} />
          </TarjetaProveedor>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sin información del proveedor todavía.
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <EstadoSincronizacionSfsf sincronizacion={candidato.sincronizacionSfsf} />
      </Box>

      {onVerDetalleCompleto && (
        <Box sx={{ mt: 3 }}>
          <Link component="button" type="button" underline="hover" onClick={onVerDetalleCompleto}>
            Ver detalle completo
          </Link>
        </Box>
      )}
    </Box>
  );
}
