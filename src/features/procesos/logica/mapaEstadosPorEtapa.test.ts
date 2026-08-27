import { describe, expect, it } from 'vitest';
import type { EtapaPipeline } from '../api/vacantes';
import {
  CLAVE_ETAPA_RANKING,
  esEtapaOperativa,
  estadosDeEtapa,
  resolverEtapaOperativa,
} from './mapaEstadosPorEtapa';

function etapa(clave: string, orden: number): EtapaPipeline {
  return { clave, nombre: clave, orden, total: 0, pendientesDecision: 0, automatica: false };
}

describe('estadosDeEtapa', () => {
  it('traduce la etapa de ranking a RANKING_SELECTA', () => {
    expect(estadosDeEtapa(CLAVE_ETAPA_RANKING)).toEqual(['RANKING_SELECTA']);
  });

  it('devuelve [] para una clave no mapeada', () => {
    expect(estadosDeEtapa('BLUESITE')).toEqual([]);
    expect(estadosDeEtapa(null)).toEqual([]);
  });
});

describe('esEtapaOperativa', () => {
  it('solo la etapa de ranking es operativa', () => {
    expect(esEtapaOperativa(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esEtapaOperativa('COSINTE')).toBe(false);
  });
});

describe('resolverEtapaOperativa', () => {
  it('devuelve la etapa cuya clave coincide con CLAVE_ETAPA_RANKING', () => {
    const pipeline = [etapa('COSINTE', 3), etapa(CLAVE_ETAPA_RANKING, 1), etapa('OFERTA', 5)];
    expect(resolverEtapaOperativa(pipeline)?.clave).toBe(CLAVE_ETAPA_RANKING);
  });

  it('sin coincidencia devuelve la primera etapa por orden', () => {
    const pipeline = [etapa('OFERTA', 5), etapa('COSINTE', 2)];
    expect(resolverEtapaOperativa(pipeline)?.clave).toBe('COSINTE');
  });

  it('devuelve null si el pipeline está vacío', () => {
    expect(resolverEtapaOperativa([])).toBeNull();
    expect(resolverEtapaOperativa(null)).toBeNull();
  });
});
