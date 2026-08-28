import { describe, expect, it } from 'vitest';
import {
  CLAVE_ETAPA_RANKING,
  esEtapaOperativa,
  esPasoSelecta,
  estadosDeEtapa,
} from './mapaEstadosPorEtapa';

describe('estadosDeEtapa', () => {
  it('traduce el paso de ranking a RANKING_SELECTA', () => {
    expect(estadosDeEtapa(CLAVE_ETAPA_RANKING)).toEqual(['RANKING_SELECTA']);
  });

  it('traduce el listado de filtrados a los estados de prefiltro y preselección', () => {
    expect(estadosDeEtapa('LISTA_FILTRADOS')).toEqual([
      'PREFILTRO_PENDIENTE',
      'PREFILTRO_COMPLETADO',
      'PRESELECCIONADO',
    ]);
  });

  it('devuelve [] para una clave no mapeada', () => {
    expect(estadosDeEtapa('BLUESITE')).toEqual([]);
    expect(estadosDeEtapa(null)).toEqual([]);
  });
});

describe('esEtapaOperativa', () => {
  it('Selecta y el listado de filtrados son operativos; el resto no', () => {
    expect(esEtapaOperativa(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esEtapaOperativa('LISTA_FILTRADOS')).toBe(true);
    expect(esEtapaOperativa('COSINTE')).toBe(false);
  });
});

describe('esPasoSelecta', () => {
  it('solo es cierto para el paso de ranking', () => {
    expect(esPasoSelecta(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esPasoSelecta('LISTA_FILTRADOS')).toBe(false);
    expect(esPasoSelecta(null)).toBe(false);
  });
});
