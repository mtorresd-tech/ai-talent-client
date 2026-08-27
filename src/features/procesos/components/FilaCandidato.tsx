import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CandidatoResumen } from '../api/candidatos';
import { formatearFecha } from '../logica/formatoFecha';
import { nombreCandidato } from '../logica/candidato';
import { AvatarIniciales } from './AvatarIniciales';

export interface FilaCandidatoProps {
  candidato: CandidatoResumen;
}

function subtitulo(candidato: CandidatoResumen): string {
  const partes: string[] = [];
  if (candidato.origenPostulacion) partes.push(candidato.origenPostulacion);
  if (candidato.fechaPostulacion) partes.push(formatearFecha(candidato.fechaPostulacion));
  return partes.join(' · ') || 'Sin datos de postulación';
}

/**
 * Bloque de identidad de la fila de ranking: posición, avatar con iniciales,
 * nombre y subtítulo (origen + fecha de postulación — el contrato no trae un
 * campo de experiencia para esta vista).
 */
export function FilaCandidato({ candidato }: FilaCandidatoProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        aria-label="Posición en el ranking"
        sx={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          bgcolor: 'action.hover',
        }}
      >
        {candidato.rankingPosicion ?? '—'}
      </Box>
      <AvatarIniciales nombre={nombreCandidato(candidato)} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {nombreCandidato(candidato)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
          {subtitulo(candidato)}
        </Typography>
      </Box>
    </Box>
  );
}
