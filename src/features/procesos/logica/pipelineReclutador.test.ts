import { describe, expect, it } from 'vitest';
import { CLAVE_ETAPA_RANKING } from './mapaEstadosPorEtapa';
import { FASES_SAP, PASOS_PIPELINE, PASO_INICIAL, nombrePaso } from './pipelineReclutador';

describe('PASOS_PIPELINE', () => {
  it('empieza por Selecta y sigue con el listado de filtrados y la anonimización', () => {
    expect(PASOS_PIPELINE.slice(0, 3).map((p) => p.clave)).toEqual([
      'SELECTA',
      'LISTA_FILTRADOS',
      'ANONIMIZACION',
    ]);
  });

  it('el paso inicial coincide con la clave del paso de ranking', () => {
    expect(PASO_INICIAL).toBe(CLAVE_ETAPA_RANKING);
    expect(PASO_INICIAL).toBe(PASOS_PIPELINE[0].clave);
  });

  it('ubica "Matriz de selección" inmediatamente después de Bluesite y antes de Cosinte', () => {
    const claves = PASOS_PIPELINE.map((p) => p.clave);
    const indiceMatriz = claves.indexOf('MATRIZ_SELECCION');
    expect(claves[indiceMatriz - 1]).toBe('BLUESITE');
    expect(claves[indiceMatriz + 1]).toBe('COSINTE');
  });
});

describe('FASES_SAP', () => {
  it('anida el listado de filtrados y la anonimización bajo "Prefiltro telefónico"', () => {
    const prefiltro = FASES_SAP.find((f) => f.clave === 'PREFILTRO_TELEFONICO');
    expect(prefiltro?.pasos).toEqual(['LISTA_FILTRADOS', 'ANONIMIZACION']);
  });

  it('marca las fases fuera de la plataforma con nota y sin pasos', () => {
    const externas = FASES_SAP.filter((f) => f.externa);
    expect(externas.length).toBeGreaterThan(0);
    expect(externas.every((f) => f.pasos.length === 0 && f.nota)).toBe(true);
  });

  it('cada paso interno está anidado exactamente en una fase', () => {
    const anidados = FASES_SAP.flatMap((f) => f.pasos);
    expect([...anidados].sort()).toEqual([...PASOS_PIPELINE.map((p) => p.clave)].sort());
  });

  it('marca como ocultas las 7 fases sin lugar en el rail simplificado', () => {
    const clavesOcultas = [
      'PSICOTECNICAS',
      'PRUEBA_TECNICA',
      'ENTREVISTA_COMPETENCIAS',
      'ENTREVISTA_JEFE',
      'SEGUNDA_ENTREVISTA',
      'SEGURIDAD_MEDICO',
      'OFERTA',
    ];
    for (const clave of clavesOcultas) {
      expect(FASES_SAP.find((f) => f.clave === clave)?.oculta).toBe(true);
    }
  });

  it('no marca como ocultas las 3 fases visibles del rail simplificado', () => {
    const clavesVisibles = ['POSTULANTES', 'PREFILTRO_TELEFONICO', 'MATRIZ_SELECCION'];
    for (const clave of clavesVisibles) {
      expect(FASES_SAP.find((f) => f.clave === clave)?.oculta ?? false).toBe(false);
    }
  });
});

describe('nombrePaso', () => {
  it('devuelve el nombre visible del paso o null', () => {
    expect(nombrePaso('LISTA_FILTRADOS')).toBe('Listado de filtrados');
    expect(nombrePaso('MATRIZ_SELECCION')).toBe('Matriz de selección');
    expect(nombrePaso('NO_EXISTE')).toBeNull();
  });
});
