import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type ValorFiltroLeidas = 'todas' | 'no-leidas' | 'leidas';

export interface FiltroLeidasProps {
  valor: ValorFiltroLeidas;
  onCambio: (valor: ValorFiltroLeidas) => void;
}

/** Filtro de 3 opciones mapeado a `leida` sin valor / `false` / `true` en la consulta al backend. */
export function FiltroLeidas({ valor, onCambio }: FiltroLeidasProps) {
  return (
    <ToggleButtonGroup
      value={valor}
      exclusive
      size="small"
      onChange={(_evento, nuevoValor: ValorFiltroLeidas | null) => {
        if (nuevoValor) onCambio(nuevoValor);
      }}
      aria-label="Filtrar notificaciones"
      sx={{ flexWrap: 'wrap' }}
    >
      <ToggleButton value="todas">Todas</ToggleButton>
      <ToggleButton value="no-leidas">No leídas</ToggleButton>
      <ToggleButton value="leidas">Leídas</ToggleButton>
    </ToggleButtonGroup>
  );
}
