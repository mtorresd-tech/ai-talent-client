import { describe, expect, it } from 'vitest';
import { etiquetaCompuerta } from './etiquetaCompuerta';

describe('etiquetaCompuerta', () => {
  it('devuelve la etiqueta legible mapeada', () => {
    expect(etiquetaCompuerta('LIDER')).toBe('Revisión del líder');
  });

  it('devuelve el propio valor recibido cuando no reconoce la compuerta', () => {
    expect(etiquetaCompuerta('VALOR_INEXISTENTE')).toBe('VALOR_INEXISTENTE');
  });
});
