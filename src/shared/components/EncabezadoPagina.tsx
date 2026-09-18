import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface EncabezadoPaginaProps {
  /** Texto corto en mayúsculas, encima del título, como acento de marca. */
  eyebrow?: string;
  /** Título de la página; se renderiza como `<h1>` semántico. */
  titulo: string;
  /** Párrafo descriptivo debajo del título. */
  subtitulo?: string;
}

/**
 * Encabezado consistente para las páginas del portal: eyebrow opcional,
 * título semántico (`<h1>`) y subtítulo descriptivo con ancho máximo para no
 * estirarse en pantallas anchas.
 */
export function EncabezadoPagina({ eyebrow, titulo, subtitulo }: EncabezadoPaginaProps) {
  return (
    <Stack spacing={0.5}>
      {eyebrow && (
        <Typography variant="overline" sx={{ color: 'primary.main' }}>
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h2" component="h1">
        {titulo}
      </Typography>
      {subtitulo && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', maxWidth: { xs: '100%', sm: 640 } }}
        >
          {subtitulo}
        </Typography>
      )}
    </Stack>
  );
}
