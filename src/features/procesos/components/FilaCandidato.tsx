import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CandidatoResumen } from '../api/candidatos';
import { formatearFecha } from '../logica/formatoFecha';
import { nombreCandidato } from '../logica/candidato';
import { AvatarIniciales } from './AvatarIniciales';

export interface FilaCandidatoProps {
  candidato: CandidatoResumen;
}

/**
 * Bloque de identidad de la fila: posición en el ranking (solo si existe),
 * avatar con iniciales, nombre y, debajo, el origen y la fecha de postulación
 * en líneas separadas para no ensanchar la columna.
 */
export function FilaCandidato({ candidato }: FilaCandidatoProps) {
  const origen = candidato.origenPostulacion;
  const fecha = candidato.fechaPostulacion ? formatearFecha(candidato.fechaPostulacion) : null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {candidato.rankingPosicion !== null && (
        <Box
          aria-label="Posición en el ranking"
          sx={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            bgcolor: 'action.hover',
          }}
        >
          {candidato.rankingPosicion}
        </Box>
      )}
      <AvatarIniciales nombre={nombreCandidato(candidato)} tamano={30} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {nombreCandidato(candidato)}
        </Typography>
        {origen && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
            {origen}
          </Typography>
        )}
        {fecha && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
            {fecha}
          </Typography>
        )}
        {!origen && !fecha && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Sin datos de postulación
          </Typography>
        )}
      </Box>
    </Box>
  );
}
