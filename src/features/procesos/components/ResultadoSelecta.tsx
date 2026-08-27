import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { CandidatoDetalle } from '../api/candidatos';
import { nombreCandidato } from '../logica/candidato';
import { EstadoError } from './EstadoError';

export interface ResultadoSelectaProps {
  candidato: CandidatoDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: number | null }) {
  return (
    <Box sx={{ flex: 1, minWidth: 120 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {etiqueta}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {valor === null ? '—' : `${Math.round(valor)}%`}
      </Typography>
    </Box>
  );
}

function ListaTexto({ titulo, valores }: { titulo: string; valores: string[] }) {
  if (valores.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {titulo}
      </Typography>
      <List dense disablePadding>
        {valores.map((valor) => (
          <ListItem key={valor} disablePadding sx={{ display: 'list-item', ml: 3 }}>
            <ListItemText primary={valor} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

/**
 * Panel derecho de la etapa de ranking: resultado de afinidad Selecta del
 * candidato seleccionado. Sin selección muestra un estado vacío; el link "Ver
 * detalle completo" es un stub en esta entrega.
 */
export function ResultadoSelecta({
  candidato,
  cargando,
  error,
  onReintentar,
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

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 3,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {nombreCandidato(candidato)}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Afinidad total
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
        {Math.round(desglose.porcentajeTotal)}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, desglose.porcentajeTotal))}
        sx={{ my: 1.5, height: 8, borderRadius: 4 }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <Metrica etiqueta="Fortalezas" valor={desglose.porcentajeFortalezas} />
        <Metrica etiqueta="Experiencia" valor={desglose.porcentajeExperiencia} />
        <Metrica etiqueta="Estudios" valor={desglose.porcentajeEstudios} />
      </Box>

      <ListaTexto titulo="Fortalezas" valores={desglose.fortalezas} />
      <ListaTexto titulo="Debilidades" valores={desglose.debilidades} />

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

      <Box sx={{ mt: 3 }}>
        {/* TODO: enlazar a la subpágina de detalle completo del candidato cuando exista. */}
        <Link component="button" type="button" underline="hover" onClick={() => undefined}>
          Ver detalle completo
        </Link>
      </Box>
    </Box>
  );
}
