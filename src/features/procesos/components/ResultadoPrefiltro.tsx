import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { CandidatoDetalle } from '../api/candidatos';
import type { Prefiltro } from '../api/prefiltro';
import { nombreCandidato } from '../logica/candidato';
import { colorEstado, etiquetaEstado } from '../logica/etiquetasEstado';
import { EstadoError } from './EstadoError';
import { InformacionPrefiltro } from './InformacionPrefiltro';

export interface ResultadoPrefiltroProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  prefiltro: Prefiltro | null;
  cargandoPrefiltro: boolean;
  errorPrefiltro: ApiError | null;
  onReintentarPrefiltro: () => void;
  /** Si se pasa, se muestra el enlace "Ver detalle completo"; si no, se omite. */
  onVerDetalleCompleto?: () => void;
}

/**
 * Panel derecho del paso "Lista de filtrados": en vez del resultado de afinidad
 * Selecta, muestra la información del prefiltro telefónico del candidato
 * seleccionado.
 *
 * - `PREFILTRO_COMPLETADO` / `PRESELECCIONADO` → datos del prefiltro
 *   (`GET /candidatos/{id}/prefiltro`).
 * - `PREFILTRO_PENDIENTE` → aviso de que el resultado se diligencia en SAP
 *   SuccessFactors y todavía no está registrado.
 */
export function ResultadoPrefiltro({
  candidato,
  cargando,
  error,
  onReintentar,
  prefiltro,
  cargandoPrefiltro,
  errorPrefiltro,
  onReintentarPrefiltro,
  onVerDetalleCompleto,
}: ResultadoPrefiltroProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !candidato) {
    return <LinearProgress aria-label="Cargando prefiltro" />;
  }

  if (!candidato) {
    return (
      <GebEmptyState
        titulo="Selecciona un candidato"
        descripcion="Selecciona un candidato de la lista para ver la información de su prefiltro telefónico."
      />
    );
  }

  const pendiente = candidato.estado === 'PREFILTRO_PENDIENTE';

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
      <Chip
        size="small"
        color={colorEstado(candidato.estado)}
        label={etiquetaEstado(candidato.estado)}
        sx={{ mt: 0.5 }}
      />

      <Box sx={{ mt: 2 }}>
        {pendiente ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            El resultado del prefiltro telefónico todavía no se ha diligenciado en SAP
            SuccessFactors. Una vez registrado allí, la información aparecerá en esta pantalla.
          </Typography>
        ) : errorPrefiltro ? (
          <EstadoError error={errorPrefiltro} onReintentar={onReintentarPrefiltro} />
        ) : (
          <InformacionPrefiltro
            prefiltro={prefiltro}
            cargando={cargandoPrefiltro}
            conBorde={false}
          />
        )}
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
