import { describe, expect, it } from 'vitest';
import {
  CLAVE_ETAPA_RANKING,
  esEtapaOperativa,
  esPasoAnonimizacion,
  esPasoSelecta,
  estadosDeEtapa,
  tipoPanelPaso,
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

  it('traduce el paso de anonimización a los estados de la revisión del líder', () => {
    expect(estadosDeEtapa('ANONIMIZACION')).toEqual([
      'INFORME_INCOGNITO',
      'EN_REVISION_LIDER',
      'APROBADO_LIDER_PRUEBAS',
      'RECHAZADO_LIDER',
    ]);
  });
});

describe('esEtapaOperativa', () => {
  it('Selecta, el listado de filtrados y la anonimización son operativos; el resto no', () => {
    expect(esEtapaOperativa(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esEtapaOperativa('LISTA_FILTRADOS')).toBe(true);
    expect(esEtapaOperativa('ANONIMIZACION')).toBe(true);
    expect(esEtapaOperativa('COSINTE')).toBe(false);
  });
});

describe('esPasoSelecta', () => {
  it('solo es cierto para el paso de ranking', () => {
    expect(esPasoSelecta(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esPasoSelecta('LISTA_FILTRADOS')).toBe(false);
    expect(esPasoSelecta('ANONIMIZACION')).toBe(false);
    expect(esPasoSelecta(null)).toBe(false);
  });
});

describe('esPasoAnonimizacion', () => {
  it('solo es cierto para el paso de anonimización', () => {
    expect(esPasoAnonimizacion('ANONIMIZACION')).toBe(true);
    expect(esPasoAnonimizacion(CLAVE_ETAPA_RANKING)).toBe(false);
    expect(esPasoAnonimizacion('LISTA_FILTRADOS')).toBe(false);
    expect(esPasoAnonimizacion(null)).toBe(false);
  });
});

describe('tipoPanelPaso', () => {
  it('discrimina el panel derecho por tipo de paso', () => {
    expect(tipoPanelPaso('SELECTA')).toBe('SELECTA');
    expect(tipoPanelPaso('LISTA_FILTRADOS')).toBe('PREFILTRO');
    expect(tipoPanelPaso('ANONIMIZACION')).toBe('ANONIMIZACION');
    expect(tipoPanelPaso('BLUESITE')).toBeNull();
    expect(tipoPanelPaso(null)).toBeNull();
  });
});
