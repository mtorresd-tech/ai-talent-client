import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EstadoCatalogo } from '../api/catalogos';
import type { CandidatoDetalle } from '../api/candidatos';
import { nombreCandidato } from '../logica/candidato';
import { resolverColorEstado, resolverEtiquetaEstado } from '../logica/etiquetasEstado';
import { formatearFecha } from '../logica/formatoFecha';
import { AvatarIniciales } from './AvatarIniciales';

export interface TarjetaPerfilCandidatoProps {
  candidato: CandidatoDetalle | null;
  catalogo: EstadoCatalogo[] | null;
  /** `VacanteDetalle.titulo`; se omite la fila si no está disponible. */
  tituloVacante: string | null;
  cargando?: boolean;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor}</Typography>
    </Box>
  );
}

/** Tarjeta de identidad del candidato: avatar, nombre, estado y datos de postulación. */
export function TarjetaPerfilCandidato({
  candidato,
  catalogo,
  tituloVacante,
  cargando,
}: TarjetaPerfilCandidatoProps) {
  if (cargando && !candidato) {
    return <Skeleton variant="rounded" height={220} />;
  }
  if (!candidato) return null;

  const nombre = nombreCandidato(candidato);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <AvatarIniciales nombre={nombre} tamano={48} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {nombre}
          </Typography>
          <Chip
            size="small"
            color={resolverColorEstado(catalogo, candidato.estado)}
            label={resolverEtiquetaEstado(catalogo, candidato.estado)}
            sx={{ mt: 0.5, fontSize: '0.6875rem', height: 22 }}
          />
        </Box>
      </Box>

      <Stack spacing={1.25} sx={{ mt: 2 }}>
        <Fila etiqueta="Documento" valor={candidato.numeroDocumento} />
        <Fila
          etiqueta="Fecha de postulación"
          valor={candidato.fechaPostulacion ? formatearFecha(candidato.fechaPostulacion) : null}
        />
        <Fila etiqueta="Origen de la postulación" valor={candidato.origenPostulacion} />
        <Fila etiqueta="Cargo al que aplica" valor={tituloVacante} />
      </Stack>
    </Box>
  );
}
