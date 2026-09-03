import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

/** Métrica porcentual de una dimensión de afinidad (fortalezas / experiencia / estudios). */
export function Metrica({ etiqueta, valor }: { etiqueta: string; valor: number | null }) {
  return (
    <Box sx={{ flex: 1, minWidth: { xs: 96, sm: 120 } }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {etiqueta}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {valor === null ? '—' : `${Math.round(valor)}%`}
      </Typography>
    </Box>
  );
}

/** Lista con viñetas de textos de apoyo (fortalezas / debilidades). Nada si está vacía. */
export function ListaTexto({ titulo, valores }: { titulo: string; valores: string[] }) {
  if (valores.length === 0) return null;
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
