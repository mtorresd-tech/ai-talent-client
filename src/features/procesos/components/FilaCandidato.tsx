import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { CandidatoResumen } from '../api/candidatos';
import { formatearFecha } from '../logica/formatoFecha';
import { nombreCandidato } from '../logica/candidato';
import { AvatarIniciales } from './AvatarIniciales';

export interface FilaCandidatoProps {
  candidato: CandidatoResumen;
  /** Abre la subpágina de detalle del candidato; independiente del clic de selección de la fila. */
  onVerDetalle?: (candidato: CandidatoResumen) => void;
}

/**
 * Bloque de identidad de la fila: posición en el ranking (solo si existe),
 * avatar con iniciales, nombre y, debajo, el origen y la fecha de postulación
 * en una sola línea (`origen · fecha`) para no ensanchar ni alargar la columna.
 * Si se pasa `onVerDetalle`, añade una acción "Ver detalle" alineada con el
 * resto del texto, que no interfiere con la selección de la fila.
 *
 * El avatar y el número de ranking se alinean con la primera línea de texto
 * (`alignItems: 'flex-start'`), no al centro vertical del bloque: con el nombre
 * más el meta más el enlace la fila crece y un avatar centrado quedaba flotando.
 */
export function FilaCandidato({ candidato, onVerDetalle }: FilaCandidatoProps) {
  const origen = candidato.origenPostulacion;
  const fecha = candidato.fechaPostulacion ? formatearFecha(candidato.fechaPostulacion) : null;
  const meta = [origen, fecha].filter(Boolean).join(' · ');

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      {candidato.rankingPosicion !== null && (
        <Box
          aria-label="Posición en el ranking"
          sx={{
            flexShrink: 0,
            mt: '3px',
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
      <Box sx={{ flexShrink: 0, mt: '1px' }}>
        <AvatarIniciales nombre={nombreCandidato(candidato)} tamano={30} />
      </Box>
      <Box sx={{ minWidth: 0, textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {nombreCandidato(candidato)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
          {meta || 'Sin datos de postulación'}
        </Typography>
        {onVerDetalle && (
          <Link
            component="button"
            type="button"
            variant="caption"
            underline="hover"
            sx={{ display: 'block', mt: 0.25, p: 0, textAlign: 'left' }}
            onClick={(evento) => {
              evento.stopPropagation();
              onVerDetalle(candidato);
            }}
          >
            Ver detalle
          </Link>
        )}
      </Box>
    </Box>
  );
}
