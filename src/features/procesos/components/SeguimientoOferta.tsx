import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoOferta } from '../logica/seguimientoOferta';
import { EstadoError } from './EstadoError';
import { EstadoSincronizacionSfsf } from './EstadoSincronizacionSfsf';
import { ResumenEstadoPaso } from './ResumenEstadoPaso';
import { TarjetaPerfilCandidato } from './TarjetaPerfilCandidato';

export interface SeguimientoOfertaProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  catalogo?: EstadoCatalogo[] | null;
  /** `VacanteDetalle.titulo`; se pasa a `TarjetaPerfilCandidato`. */
  tituloVacante: string | null;
  /** Si se pasa, se muestra el enlace "Ver detalle completo"; si no, se omite. */
  onVerDetalleCompleto?: () => void;
}

/**
 * Panel del paso "Oferta": detalle de solo consulta del candidato final de la
 * vacante (identidad, tipo interno/externo, estado en lenguaje claro y
 * sincronización con SuccessFactors). A diferencia de los demás pasos del
 * pipeline, no hay lista de candidatos: un único recurso por vacante, así que
 * el panel se renderiza a ancho completo sin maestro-detalle.
 */
export function SeguimientoOferta({
  candidato,
  cargando,
  error,
  onReintentar,
  catalogo,
  tituloVacante,
  onVerDetalleCompleto,
}: SeguimientoOfertaProps) {
  if (error?.problem.status === 404) {
    return (
      <GebEmptyState
        titulo="Sin candidato final todavía"
        descripcion="Esta vacante todavía no tiene un candidato final."
      />
    );
  }

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !candidato) {
    return <LinearProgress aria-label="Cargando candidato final" />;
  }

  if (!candidato) {
    return <LinearProgress aria-label="Cargando candidato final" />;
  }

  const resumen = describirEstadoOferta(candidato.estado, catalogo);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <TarjetaPerfilCandidato
          candidato={candidato}
          catalogo={catalogo ?? null}
          tituloVacante={tituloVacante}
          tipoCandidato={candidato.tipoCandidato}
        />

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            minWidth: 0,
          }}
        >
          <ResumenEstadoPaso
            titulo={resumen.titulo}
            descripcion={resumen.descripcion}
            estadoDesde={candidato.estadoDesde}
          />
          {onVerDetalleCompleto && (
            <Box sx={{ mt: 2 }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={onVerDetalleCompleto}
              >
                Ver detalle completo
              </Link>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            minWidth: 0,
            gridColumn: { md: '1 / -1' },
          }}
        >
          <EstadoSincronizacionSfsf sincronizacion={candidato.sincronizacionSfsf} />
        </Box>
      </Box>
    </Box>
  );
}
