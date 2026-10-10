import { describe, expect, it } from 'vitest';
import type { FilaMatriz } from '../api/matriz';
import { hayEmpateDeTotal } from './empateMatriz';

function fila(overrides: Partial<FilaMatriz> = {}): FilaMatriz {
  return {
    jobApplicationId: 'APP-1',
    alias: 'Candidato 1',
    nombre: null,
    tipoCandidato: 'EXTERNO',
    calificacion: {
      competencias: {},
      pruebaTecnica: null,
      talentoHumano: null,
      entrevistasJefe: [],
      desempenoUltimoAnio: null,
      tiempoVinculacion: null,
    },
    resultado: {
      medianaCompetencias: null,
      resultadoCompetencias: null,
      resultadoPruebaTecnica: null,
      resultadoTalentoHumano: null,
      conceptoArea: null,
      resultadoConceptoArea: null,
      bonoDesempeno: 0,
      bonoVinculacion: 0,
      total: null,
      completa: false,
    },
    ...overrides,
  };
}

describe('hayEmpateDeTotal', () => {
  it('detecta el empate entre dos candidatos completos con el mismo total', () => {
    const candidatos = [
      fila({
        jobApplicationId: 'APP-1',
        resultado: { ...fila().resultado, completa: true, total: 88 },
      }),
      fila({
        jobApplicationId: 'APP-2',
        resultado: { ...fila().resultado, completa: true, total: 88 },
      }),
    ];
    expect(hayEmpateDeTotal(candidatos, 'APP-1')).toBe(true);
  });

  it('no hay empate si los totales son distintos', () => {
    const candidatos = [
      fila({
        jobApplicationId: 'APP-1',
        resultado: { ...fila().resultado, completa: true, total: 88 },
      }),
      fila({
        jobApplicationId: 'APP-2',
        resultado: { ...fila().resultado, completa: true, total: 70 },
      }),
    ];
    expect(hayEmpateDeTotal(candidatos, 'APP-1')).toBe(false);
  });

  it('no cuenta el empate con un candidato incompleto aunque comparta total', () => {
    const candidatos = [
      fila({
        jobApplicationId: 'APP-1',
        resultado: { ...fila().resultado, completa: true, total: 88 },
      }),
      fila({
        jobApplicationId: 'APP-2',
        resultado: { ...fila().resultado, completa: false, total: 88 },
      }),
    ];
    expect(hayEmpateDeTotal(candidatos, 'APP-1')).toBe(false);
  });

  it('devuelve false si el candidato elegido no existe en la lista', () => {
    expect(hayEmpateDeTotal([], 'APP-1')).toBe(false);
  });
});
