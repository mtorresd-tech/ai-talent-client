import { describe, expect, it } from 'vitest';
import { parsearResultadoBluesite } from './parseoResultado';

describe('parsearResultadoBluesite', () => {
  it('parsea un objeto válido al shape tipado', () => {
    const entrada = {
      tipo: 'BLUESITE',
      pruebas: [
        {
          tipoPrueba: 'Competencias',
          respondida: true,
          fechaEnvio: '2026-01-01T00:00:00Z',
          fechaRespuesta: null,
          competencias: [
            { nombre: 'Liderazgo', puntaje: 80 },
            { nombre: 'ignorada', puntaje: 'x' },
          ],
        },
      ],
    };

    const resultado = parsearResultadoBluesite(entrada);

    expect(resultado?.tipo).toBe('BLUESITE');
    expect(resultado?.pruebas).toHaveLength(1);
    expect(resultado?.pruebas[0].competencias).toEqual([{ nombre: 'Liderazgo', puntaje: 80 }]);
  });

  it('devuelve null para basura y no lanza', () => {
    expect(parsearResultadoBluesite(null)).toBeNull();
    expect(parsearResultadoBluesite('texto')).toBeNull();
    expect(parsearResultadoBluesite({ pruebas: 'no-array' })).toBeNull();
    expect(parsearResultadoBluesite({ pruebas: [{}] })).toBeNull();
  });
});
