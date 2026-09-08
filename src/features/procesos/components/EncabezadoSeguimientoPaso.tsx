import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverColorEstado, resolverEtiquetaEstado } from '../logica/etiquetasEstado';
import { DistintivoTipoCandidato } from './DistintivoTipoCandidato';

export interface EncabezadoSeguimientoPasoProps {
  nombre: string;
  estado: EstadoProceso | string;
  catalogo?: EstadoCatalogo[] | null;
  tipoCandidato: TipoCandidato | null;
}

/**
 * Encabezado común de los paneles de seguimiento de un paso: nombre del
 * candidato, chip de estado (etiqueta y color del catálogo) y el distintivo
 * interno/externo.
 */
export function EncabezadoSeguimientoPaso({
  nombre,
  estado,
  catalogo,
  tipoCandidato,
}: EncabezadoSeguimientoPasoProps) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {nombre}
      </Typography>
      <Stack direction="row" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
        <Chip
          size="small"
          color={resolverColorEstado(catalogo, estado)}
          label={resolverEtiquetaEstado(catalogo, estado)}
        />
        <DistintivoTipoCandidato tipo={tipoCandidato} />
      </Stack>
    </>
  );
}
