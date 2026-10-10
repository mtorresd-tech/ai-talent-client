import { describe, expect, it } from 'vitest';
import { ApiError } from '@geb/api-client';
import * as erroresMatriz from './erroresMatriz';
import { MENSAJE_DESEMPATE, interpretarErrorSeleccion } from './erroresMatriz';

function error(status: number, title: string, detail?: string): ApiError {
  return new ApiError({ status, title, detail }, `corr-${status}`);
}

describe('interpretarErrorSeleccion', () => {
  it('422 por falta de criterio de desempate se asocia al campo y pide recargar', () => {
    expect(interpretarErrorSeleccion(error(422, 'Falta el criterio de desempate'))).toEqual({
      mensaje: MENSAJE_DESEMPATE,
      campo: 'criterioDesempate',
      recargar: true,
      idCorrelacion: 'corr-422',
    });
  });

  it.each(['El candidato no esta en la matriz', 'Calificacion incompleta'])(
    '409 "%s" indica que el candidato ya no tiene la calificación completa',
    (title) => {
      const resultado = interpretarErrorSeleccion(error(409, title));
      expect(resultado.mensaje).toMatch(/ya no tiene la calificación completa/);
      expect(resultado.campo).toBeNull();
      expect(resultado.recargar).toBe(true);
    },
  );

  it('409 de reenvío sin objeción explica que solo se puede elegir otro si el líder objeta', () => {
    const resultado = interpretarErrorSeleccion(
      error(409, 'La eleccion enviada al lider no fue objetada'),
    );
    expect(resultado.mensaje).toMatch(
      /solo se puede volver a elegir si el líder objeta la elección/,
    );
    expect(resultado.recargar).toBe(true);
  });

  it('409 de candidato ya objetado ya no tiene mensaje propio: cae al detail del backend', () => {
    const resultado = interpretarErrorSeleccion(
      error(409, 'El lider ya objeto a este candidato', 'Detalle del backend'),
    );
    expect(resultado.mensaje).toBe('Detalle del backend');
    expect(resultado.recargar).toBe(true);
  });

  it('reconoce el title aunque venga con tildes o mayúsculas distintas', () => {
    const resultado = interpretarErrorSeleccion(error(409, 'Calificación Incompleta'));
    expect(resultado.mensaje).toMatch(/ya no tiene la calificación completa/);
  });

  it('un 409 no reconocido devuelve el detail del backend y pide recargar', () => {
    const resultado = interpretarErrorSeleccion(
      error(409, 'Otro conflicto', 'Detalle del backend'),
    );
    expect(resultado.mensaje).toBe('Detalle del backend');
    expect(resultado.recargar).toBe(true);
  });

  it('un 500 sin detail devuelve el title y no pide recargar', () => {
    const resultado = interpretarErrorSeleccion(error(500, 'Error inesperado'));
    expect(resultado).toEqual({
      mensaje: 'Error inesperado',
      campo: null,
      recargar: false,
      idCorrelacion: 'corr-500',
    });
  });
});

describe('módulo erroresMatriz', () => {
  it('solo exporta el intérprete de errores de la selección, sin uno de configuración', () => {
    expect(Object.keys(erroresMatriz).sort()).toEqual([
      'MENSAJE_DESEMPATE',
      'interpretarErrorSeleccion',
    ]);
  });
});
