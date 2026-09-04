import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import { DetalleResultadoBluesite, TarjetaProveedor } from '../../integraciones';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { nombreCandidato } from '../logica/candidato';
import { resolverColorEstado, resolverEtiquetaEstado } from '../logica/etiquetasEstado';
import { formatearFecha } from '../logica/formatoFecha';
import { describirEstadoBluesite } from '../logica/seguimientoBluesite';
import { DistintivoTipoCandidato } from './DistintivoTipoCandidato';
import { EstadoError } from './EstadoError';
import { EstadoSincronizacionSfsf } from './EstadoSincronizacionSfsf';

export interface SeguimientoBluesiteProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  catalogo?: EstadoCatalogo[] | null;
  /** Si se pasa, se muestra el enlace "Ver detalle completo"; si no, se omite. */
  onVerDetalleCompleto?: () => void;
}

/**
 * Panel derecho del paso "Bluesite": estado de las pruebas psicotécnicas del
 * candidato seleccionado en lenguaje claro, distintivo interno/externo, el
 * resultado estructurado del proveedor y el estado de sincronización con
 * SuccessFactors. Es de solo consulta: no ofrece ninguna acción de escritura.
 */
export function SeguimientoBluesite({
  candidato,
  cargando,
  error,
  onReintentar,
  catalogo,
  onVerDetalleCompleto,
}: SeguimientoBluesiteProps) {
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
        descripcion="Selecciona un candidato de la lista para ver su resultado de Bluesite."
      />
    );
  }

  const resumen = describirEstadoBluesite(candidato.estado, catalogo);
  const integracionBluesite = candidato.integraciones.find((i) => i.proveedor === 'BLUESITE');

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
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {nombreCandidato(candidato)}
      </Typography>
      <Stack direction="row" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
        <Chip
          size="small"
          color={resolverColorEstado(catalogo, candidato.estado)}
          label={resolverEtiquetaEstado(catalogo, candidato.estado)}
        />
        <DistintivoTipoCandidato tipo={candidato.tipoCandidato} />
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {resumen.titulo}
        </Typography>
        {resumen.descripcion && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {resumen.descripcion}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          En este estado desde {formatearFecha(candidato.estadoDesde)}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {integracionBluesite ? (
          <TarjetaProveedor integracion={integracionBluesite}>
            <DetalleResultadoBluesite resultado={integracionBluesite.resultado} />
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
