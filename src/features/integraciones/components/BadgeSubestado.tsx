import Chip from '@mui/material/Chip';
import { colorSubestado, etiquetaSubestado } from '../logica/etiquetasSubestado';

export interface BadgeSubestadoProps {
  subestado: string | null | undefined;
}

/** Chip de color con la etiqueta en español del subestado de una integración. */
export function BadgeSubestado({ subestado }: BadgeSubestadoProps) {
  return (
    <Chip
      size="small"
      color={colorSubestado(subestado)}
      label={etiquetaSubestado(subestado)}
      sx={{ fontSize: '0.6875rem', height: 22 }}
    />
  );
}
