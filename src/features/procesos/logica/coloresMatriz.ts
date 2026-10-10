import { alpha, type Theme } from '@mui/material/styles';

/** Bloques de columnas de la matriz, en el orden de la tabla. */
export type BloqueMatriz =
  'criterioI' | 'criterioII' | 'criterioIII' | 'criterioIV' | 'total' | 'adicionales';

/**
 * Nivel de intensidad dentro de un bloque: puntajes crudos, columna
 * intermedia (mediana o concepto del área), columna de resultado, cabecera
 * del grupo y cabecera de subgrupo (solo adicionales).
 */
export type NivelColorMatriz = 'cruda' | 'intermedia' | 'resultado' | 'cabecera' | 'subgrupo';

type AlfasBloque = Record<Exclude<NivelColorMatriz, 'subgrupo'>, number>;

const ALFAS: Record<'criterioI' | 'criterioII' | 'criterioIII' | 'criterioIV', AlfasBloque> = {
  criterioI: { cruda: 0.08, intermedia: 0.16, resultado: 0.28, cabecera: 0.36 },
  criterioII: { cruda: 0.12, intermedia: 0.12, resultado: 0.32, cabecera: 0.4 },
  criterioIII: { cruda: 0.1, intermedia: 0.1, resultado: 0.28, cabecera: 0.36 },
  criterioIV: { cruda: 0.08, intermedia: 0.16, resultado: 0.26, cabecera: 0.34 },
};

function colorBase(theme: Theme, bloque: keyof typeof ALFAS): string {
  switch (bloque) {
    case 'criterioI':
      return theme.palette.secondary.main;
    case 'criterioII':
      return theme.palette.primary.light;
    case 'criterioIII':
      return theme.palette.success.dark;
    case 'criterioIV':
      return theme.palette.primary.main;
  }
}

function grisAdicionales(theme: Theme, nivel: NivelColorMatriz): string {
  const { grey, mode } = theme.palette;
  if (mode === 'dark') return nivel === 'cruda' ? grey[800] : grey[700];
  if (nivel === 'cabecera') return grey[200];
  if (nivel === 'cruda' || nivel === 'intermedia') return grey[50];
  return grey[100];
}

/** Color de fondo de una celda según su bloque y nivel, derivado de la paleta del tema. */
export function colorFondoMatriz(
  theme: Theme,
  bloque: BloqueMatriz,
  nivel: NivelColorMatriz,
): string {
  if (bloque === 'total') return theme.palette.secondary.main;
  if (bloque === 'adicionales') return grisAdicionales(theme, nivel);
  const alfas = ALFAS[bloque];
  const factor = theme.palette.mode === 'dark' ? 1.5 : 1;
  const alfa = alfas[nivel === 'subgrupo' ? 'cabecera' : nivel] * factor;
  return alpha(colorBase(theme, bloque), Math.min(alfa, 1));
}

/** Color del texto de una celda: contraste del verde sólido en TOTAL, texto principal en el resto. */
export function colorTextoMatriz(theme: Theme, bloque: BloqueMatriz): string {
  return bloque === 'total' ? theme.palette.secondary.contrastText : theme.palette.text.primary;
}

/** Colores de la banda de configuración: fondo amarillo claro y celda de etiqueta más intensa. */
export interface ColoresConfiguracionMatriz {
  banda: string;
  etiqueta: string;
}

/** Tokens de la banda de configuración, derivados de `warning` con la misma intensificación en modo oscuro. */
export function coloresConfiguracionMatriz(theme: Theme): ColoresConfiguracionMatriz {
  const factor = theme.palette.mode === 'dark' ? 1.5 : 1;
  return {
    banda: alpha(theme.palette.warning.light, 0.16 * factor),
    etiqueta: alpha(theme.palette.warning.main, 0.28 * factor),
  };
}

/** Capa que se superpone a las celdas de la fila activa, sin ocultar el color de cada columna. */
export function colorFilaActiva(theme: Theme): string {
  return alpha(theme.palette.primary.main, 0.06);
}

/** Borde izquierdo que marca la fila activa. */
export function colorBordeFilaActiva(theme: Theme): string {
  return theme.palette.primary.main;
}

/** Texto atenuado de las filas de candidatos objetados. */
export function colorTextoObjetado(theme: Theme): string {
  return theme.palette.text.secondary;
}

/** Ícono de objeción del líder. */
export function colorIconoObjecion(theme: Theme): string {
  return theme.palette.error.main;
}

/** Capa permanente de la fila del candidato enviado al líder, distinta de la de la fila activa. */
export function colorFilaEnviada(theme: Theme): string {
  return alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.12);
}

/** Fondo de la fila de un candidato objetado por el líder. */
export function colorFilaObjetada(theme: Theme): string {
  return alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1);
}

/** Ícono que marca al candidato enviado al líder. */
export function colorIconoEnviado(theme: Theme): string {
  return theme.palette.success.main;
}
