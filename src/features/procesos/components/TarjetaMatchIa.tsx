import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { DesgloseAfinidad } from '../api/candidatos';
import { descripcionMatch } from '../logica/descripcionMatch';
import { IndicadorAfinidad } from './IndicadorAfinidad';
import { ListaTexto, PiezaComponentesRubrica } from './PiezasAfinidad';

export interface TarjetaMatchIaProps {
  desglose: DesgloseAfinidad | null;
  /** `CandidatoDetalle.scoreAfinidad`, respaldo del porcentaje total. */
  scoreAfinidad: number | null;
  cargando?: boolean;
}

function acotar(valor: number): number {
  return Math.min(100, Math.max(0, valor));
}

/** Tarjeta "Match generado por IA": porcentaje total, dimensiones y textos de apoyo. */
export function TarjetaMatchIa({ desglose, scoreAfinidad, cargando }: TarjetaMatchIaProps) {
  if (cargando && !desglose) {
    return <Skeleton variant="rounded" height={260} />;
  }

  if (!desglose) {
    return (
      <GebEmptyState
        titulo="Sin resultado de afinidad"
        descripcion="Este candidato todavía no tiene un desglose de afinidad calculado."
      />
    );
  }

  const total = desglose.porcentajeTotal ?? scoreAfinidad ?? null;

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
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Match generado por IA
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
        <IndicadorAfinidad score={total} tamano={72} />
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {total === null ? '—' : `${Math.round(total)}%`}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {descripcionMatch(total)}
          </Typography>
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={total === null ? 0 : acotar(total)}
        sx={{ my: 1.5, height: 8, borderRadius: 4 }}
      />

      {(desglose.calidad?.requiereRevision || (desglose.calidad?.alertas?.length ?? 0) > 0) && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {desglose.calidad?.alertas[0] ?? 'El resultado de afinidad requiere revisión manual.'}
        </Alert>
      )}

      {desglose.elegible === false && (
        <Box sx={{ mt: 1.5 }}>
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
    </Box>
  );
}
