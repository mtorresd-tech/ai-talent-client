import Chip from '@mui/material/Chip';
import type { TipoCandidato } from '../../../shared/tipos/dominio';

export interface DistintivoTipoCandidatoProps {
  tipo: TipoCandidato | null | undefined;
}

const ETIQUETA: Record<TipoCandidato, string> = {
  INTERNO: 'Interno',
  EXTERNO: 'Externo',
};

/**
 * Chip que distingue a una persona candidata interna de una externa. No renderiza
 * nada si el dato no está disponible.
 */
export function DistintivoTipoCandidato({ tipo }: DistintivoTipoCandidatoProps) {
  if (tipo !== 'INTERNO' && tipo !== 'EXTERNO') return null;

  return (
    <Chip
      size="small"
      variant="outlined"
      color={tipo === 'INTERNO' ? 'primary' : 'default'}
      label={ETIQUETA[tipo]}
    />
  );
}
