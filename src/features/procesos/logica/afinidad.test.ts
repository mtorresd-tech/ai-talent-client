import { describe, expect, it } from 'vitest';
import { etiquetaComponenteRubrica } from './afinidad';

describe('etiquetaComponenteRubrica', () => {
  it('devuelve la etiqueta legible de un componente conocido', () => {
    expect(etiquetaComponenteRubrica('HABILIDADES_OBLIGATORIAS')).toBe('Habilidades obligatorias');
  });

  it('con un componente desconocido devuelve el valor crudo como respaldo', () => {
    expect(etiquetaComponenteRubrica('COMPONENTE_DESCONOCIDO')).toBe('COMPONENTE_DESCONOCIDO');
  });
});
