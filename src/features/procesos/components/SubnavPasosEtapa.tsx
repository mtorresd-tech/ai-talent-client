import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { subpasosDeEtapa } from '../logica/subpasosPorEtapa';

export interface SubnavPasosEtapaProps {
  etapaClave: string | null;
  subPasoActivo: string | null;
  onSeleccionarSubPaso: (clave: string) => void;
}

/**
 * Subnavegación de los sub-pasos visuales de la etapa activa. Hoy solo la
 * etapa de ranking tiene sub-pasos ("Ranking" y "Lista de filtrados"); para el
 * resto de etapas no se renderiza nada.
 */
export function SubnavPasosEtapa({
  etapaClave,
  subPasoActivo,
  onSeleccionarSubPaso,
}: SubnavPasosEtapaProps) {
  const subpasos = subpasosDeEtapa(etapaClave);
  if (subpasos.length === 0) return null;

  const valor = subPasoActivo ?? subpasos[0]?.clave ?? false;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={valor}
        onChange={(_, nuevo: string) => onSeleccionarSubPaso(nuevo)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {subpasos.map((subpaso) => (
          <Tab key={subpaso.clave} value={subpaso.clave} label={subpaso.nombre} />
        ))}
      </Tabs>
    </Box>
  );
}
