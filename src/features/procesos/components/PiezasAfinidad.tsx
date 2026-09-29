import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ComponenteAfinidad } from '../api/candidatos';
import { etiquetaComponenteRubrica } from '../logica/afinidad';

/** Métrica porcentual de una dimensión de afinidad. Puede venir ausente. */
export function Metrica({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: number | null | undefined;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: { xs: 96, sm: 120 } }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {etiqueta}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {valor === null || valor === undefined ? '—' : `${Math.round(valor)}%`}
      </Typography>
    </Box>
  );
}

/** Lista con viñetas de textos de apoyo. Puede venir ausente o vacía. */
export function ListaTexto({ titulo, valores }: { titulo: string; valores: string[] | undefined }) {
  if (!valores || valores.length === 0) return null;
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

/** Una fila del bloque "Componentes de la rúbrica": etiqueta, aporte y barra obtenido/peso. */
function FilaComponenteRubrica({ componente }: { componente: ComponenteAfinidad }) {
  const porcentajeBarra =
    componente.peso === 0
      ? 0
      : Math.min(100, Math.max(0, (componente.obtenido / componente.peso) * 100));
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
          {etiquetaComponenteRubrica(componente.componente)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {Math.round(componente.aporte)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={porcentajeBarra}
        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Brecha: {Math.round(componente.brecha)}%
      </Typography>
    </Box>
  );
}

/** Bloque "Componentes de la rúbrica": una fila por elemento de `componentes[]`. Puede venir ausente. */
export function PiezaComponentesRubrica({
  componentes,
}: {
  componentes: ComponenteAfinidad[] | undefined;
}) {
  if (!componentes || componentes.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Componentes de la rúbrica
      </Typography>
      <Stack spacing={1.5}>
        {componentes.map((componente) => (
          <FilaComponenteRubrica key={componente.componente} componente={componente} />
        ))}
      </Stack>
    </Box>
  );
}
