import { describe, expect, it } from 'vitest';
import {
  decisionMatriz,
  filaIncompleta,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import { estadoCandidatoMatriz, posicionesMatriz } from './candidatosMatriz';

const seleccionado = filaMatriz({ jobApplicationId: 'APP-1' });
const otro = filaMatriz({ jobApplicationId: 'APP-2' });
const historico = filaMatriz({ jobApplicationId: 'APP-3' });

const abierta = matrizSeleccion();
const pendiente = matrizSeleccion({
  seleccion: seleccionMatriz(),
  objeciones: [objecionMatriz({ jobApplicationId: 'APP-3' })],
});
const avalada = matrizSeleccion({
  seleccion: seleccionMatriz(),
  decisionLider: decisionMatriz({ avala: true, motivo: null }),
});
const objetada = matrizSeleccion({ seleccion: seleccionMatriz(), decisionLider: decisionMatriz() });

describe('estadoCandidatoMatriz', () => {
  it('un objetado histórico con la matriz ENVIADA_PENDIENTE queda OBJETADA', () => {
    expect(estadoCandidatoMatriz(historico, pendiente, true)).toBe('OBJETADA');
  });

  it('con completa false queda INCOMPLETA', () => {
    expect(estadoCandidatoMatriz(filaIncompleta(), abierta, true)).toBe('INCOMPLETA');
  });

  it('un elegible en ABIERTA u OBJETADA queda LISTA sin borrador y BORRADOR con borrador', () => {
    expect(estadoCandidatoMatriz(otro, abierta, false)).toBe('LISTA');
    expect(estadoCandidatoMatriz(otro, abierta, true)).toBe('BORRADOR');
    expect(estadoCandidatoMatriz(otro, objetada, false)).toBe('LISTA');
    expect(estadoCandidatoMatriz(otro, objetada, true)).toBe('BORRADOR');
  });

  it('el seleccionado queda ENVIADA, AVALADA u OBJETADA según la decisión del líder', () => {
    expect(estadoCandidatoMatriz(seleccionado, pendiente, false)).toBe('ENVIADA');
    expect(estadoCandidatoMatriz(seleccionado, avalada, false)).toBe('AVALADA');
    expect(estadoCandidatoMatriz(seleccionado, objetada, false)).toBe('OBJETADA');
  });

  it('un completo no seleccionado en AVALADA o ENVIADA_PENDIENTE queda COMPLETA', () => {
    expect(estadoCandidatoMatriz(otro, avalada, true)).toBe('COMPLETA');
    expect(estadoCandidatoMatriz(otro, pendiente, false)).toBe('COMPLETA');
  });
});

describe('posicionesMatriz', () => {
  it('asigna 1..n en el orden de matriz.candidatos, sin reordenar', () => {
    const matriz = matrizSeleccion({
      candidatos: [
        filaMatriz({ jobApplicationId: 'APP-7', resultado: { total: 70 } }),
        filaMatriz({ jobApplicationId: 'APP-2', resultado: { total: 90 } }),
        filaIncompleta({ jobApplicationId: 'APP-5' }),
      ],
    });
    expect([...posicionesMatriz(matriz)]).toEqual([
      ['APP-7', 1],
      ['APP-2', 2],
      ['APP-5', 3],
    ]);
  });
});
