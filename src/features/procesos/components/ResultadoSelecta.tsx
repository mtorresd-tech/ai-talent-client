import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { CandidatoDetalle } from '../api/candidatos';
import { nombreCandidato } from '../logica/candidato';
import { EstadoError } from './EstadoError';
import { ListaTexto, PiezaComponentesRubrica } from './PiezasAfinidad';

export interface ResultadoSelectaProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  /** Si se pasa, se muestra el enlace "Ver detalle completo"; si no, se omite. */
  onVerDetalleCompleto?: () => void;
}

/**
 * Panel derecho de la etapa de ranking: resultado de afinidad Selecta del
 * candidato seleccionado. Sin selección muestra un estado vacío. El enlace
 * "Ver detalle completo" solo se renderiza si se pasa `onVerDetalleCompleto`.
 */
export function ResultadoSelecta({
  candidato,
  cargando,
  error,
  onReintentar,
  onVerDetalleCompleto,
}: ResultadoSelectaProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !candidato) {
    return <LinearProgress aria-label="Cargando resultado" />;
  }

  if (!candidato) {
    return (
      <GebEmptyState
        titulo="Selecciona un candidato"
        descripcion="Selecciona un candidato de la lista para ver su resultado de afinidad Selecta."
      />
    );
  }

  const desglose = candidato.desgloseAfinidad;

  if (!desglose) {
    return (
      <GebEmptyState
        titulo="Sin resultado de afinidad"
        descripcion="Este candidato todavía no tiene un desglose de afinidad calculado."
      />
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {nombreCandidato(candidato)}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Afinidad total
      </Typography>
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: '2rem', sm: '3rem' } }}
      >
        {Math.round(desglose.porcentajeTotal)}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, desglose.porcentajeTotal))}
        sx={{ my: 1.5, height: 8, borderRadius: 4 }}
      />

      {(desglose.calidad?.requiereRevision || (desglose.calidad?.alertas?.length ?? 0) > 0) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {desglose.calidad?.alertas[0] ?? 'El resultado de afinidad requiere revisión manual.'}
        </Alert>
      )}

      {desglose.elegible === false && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning">No cumple los criterios mínimos de la vacante</Alert>
          <ListaTexto titulo="Motivos" valores={desglose.motivosNoElegible} />
        </Box>
      )}

      <PiezaComponentesRubrica componentes={desglose.componentes} />

      {desglose.comentarios && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Comentarios
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {desglose.comentarios}
          </Typography>
        </Box>
      )}

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
