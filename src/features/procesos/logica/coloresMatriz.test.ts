import { describe, expect, it } from 'vitest';
import { alpha, createTheme } from '@mui/material/styles';
import {
  colorBordeFilaActiva,
  colorFilaActiva,
  colorFilaEnviada,
  colorFilaObjetada,
  colorIconoEnviado,
  colorFondoMatriz,
  colorIconoObjecion,
  colorTextoMatriz,
  colorTextoObjetado,
  coloresConfiguracionMatriz,
} from './coloresMatriz';

const claro = createTheme();
const oscuro = createTheme({ palette: { mode: 'dark' } });

describe('coloresMatriz', () => {
  it('deriva los colores de cada criterio de la paleta con alpha', () => {
    expect(colorFondoMatriz(claro, 'criterioI', 'cruda')).toBe(
      alpha(claro.palette.secondary.main, 0.08),
    );
    expect(colorFondoMatriz(claro, 'criterioI', 'intermedia')).toBe(
      alpha(claro.palette.secondary.main, 0.16),
    );
    expect(colorFondoMatriz(claro, 'criterioII', 'resultado')).toBe(
      alpha(claro.palette.primary.light, 0.32),
    );
    expect(colorFondoMatriz(claro, 'criterioIII', 'cabecera')).toBe(
      alpha(claro.palette.success.dark, 0.36),
    );
    expect(colorFondoMatriz(claro, 'criterioIV', 'resultado')).toBe(
      alpha(claro.palette.primary.main, 0.26),
    );
  });

  it('TOTAL usa secondary.main sólido con secondary.contrastText', () => {
    expect(colorFondoMatriz(claro, 'total', 'resultado')).toBe(claro.palette.secondary.main);
    expect(colorTextoMatriz(claro, 'total')).toBe(claro.palette.secondary.contrastText);
    expect(colorTextoMatriz(claro, 'criterioI')).toBe(claro.palette.text.primary);
  });

  it('los adicionales usan la escala de grises', () => {
    expect(colorFondoMatriz(claro, 'adicionales', 'cruda')).toBe(claro.palette.grey[50]);
    expect(colorFondoMatriz(claro, 'adicionales', 'resultado')).toBe(claro.palette.grey[100]);
    expect(colorFondoMatriz(claro, 'adicionales', 'subgrupo')).toBe(claro.palette.grey[100]);
    expect(colorFondoMatriz(claro, 'adicionales', 'cabecera')).toBe(claro.palette.grey[200]);
  });

  it('en modo oscuro intensifica las alfas y oscurece los grises', () => {
    expect(colorFondoMatriz(oscuro, 'criterioI', 'cruda')).toBe(
      alpha(oscuro.palette.secondary.main, 0.08 * 1.5),
    );
    expect(colorFondoMatriz(oscuro, 'adicionales', 'cruda')).toBe(oscuro.palette.grey[800]);
  });

  it('deriva los tokens de la banda de configuración de warning, sin hex', () => {
    expect(coloresConfiguracionMatriz(claro)).toEqual({
      banda: alpha(claro.palette.warning.light, 0.16),
      etiqueta: alpha(claro.palette.warning.main, 0.28),
    });
    expect(coloresConfiguracionMatriz(oscuro)).toEqual({
      banda: alpha(oscuro.palette.warning.light, 0.16 * 1.5),
      etiqueta: alpha(oscuro.palette.warning.main, 0.28 * 1.5),
    });
    const { banda, etiqueta } = coloresConfiguracionMatriz(claro);
    expect(banda).not.toMatch(/^#/);
    expect(etiqueta).not.toMatch(/^#/);
  });

  it('expone los tokens de fila activa y de objeción', () => {
    expect(colorFilaActiva(claro)).toBe(alpha(claro.palette.primary.main, 0.06));
    expect(colorBordeFilaActiva(claro)).toBe(claro.palette.primary.main);
    expect(colorTextoObjetado(claro)).toBe(claro.palette.text.secondary);
    expect(colorIconoObjecion(claro)).toBe(claro.palette.error.main);
  });

  it('la fila del candidato enviado usa un tono success suave, distinto del de la fila activa', () => {
    expect(colorFilaEnviada(claro)).toBe(alpha(claro.palette.success.main, 0.12));
    expect(colorFilaEnviada(claro)).not.toBe(colorFilaActiva(claro));
    expect(colorFilaObjetada(claro)).toBe(alpha(claro.palette.error.main, 0.1));
    expect(colorIconoEnviado(claro)).toBe(claro.palette.success.main);
  });
});
