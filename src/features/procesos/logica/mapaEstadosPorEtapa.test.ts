import { describe, expect, it } from 'vitest';
import {
  CLAVE_ETAPA_RANKING,
  esEtapaOperativa,
  esPasoAnonimizacion,
  esPasoBluesite,
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
    expect(estadosDeEtapa('COSINTE')).toEqual([]);
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

  it('traduce el paso de Bluesite a los estados de las pruebas psicotécnicas', () => {
    expect(estadosDeEtapa('BLUESITE')).toEqual([
      'EN_PRUEBAS_BLUESITE',
      'RESULTADO_PRUEBAS_BLUESITE',
      'APROBO_PRUEBAS_BLUESITE',
      'DESCARTADO_PRUEBAS_BLUESITE',
    ]);
  });
});

describe('esEtapaOperativa', () => {
  it('Selecta, el listado de filtrados, la anonimización y Bluesite son operativos; el resto no', () => {
    expect(esEtapaOperativa(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esEtapaOperativa('LISTA_FILTRADOS')).toBe(true);
    expect(esEtapaOperativa('ANONIMIZACION')).toBe(true);
    expect(esEtapaOperativa('BLUESITE')).toBe(true);
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

describe('esPasoBluesite', () => {
  it('solo es cierto para el paso de Bluesite', () => {
    expect(esPasoBluesite('BLUESITE')).toBe(true);
    expect(esPasoBluesite('ANONIMIZACION')).toBe(false);
    expect(esPasoBluesite('COSINTE')).toBe(false);
    expect(esPasoBluesite(null)).toBe(false);
  });
});

describe('tipoPanelPaso', () => {
  it('discrimina el panel derecho por tipo de paso', () => {
    expect(tipoPanelPaso('SELECTA')).toBe('SELECTA');
    expect(tipoPanelPaso('LISTA_FILTRADOS')).toBe('PREFILTRO');
    expect(tipoPanelPaso('ANONIMIZACION')).toBe('ANONIMIZACION');
    expect(tipoPanelPaso('BLUESITE')).toBe('BLUESITE');
    expect(tipoPanelPaso('COSINTE')).toBeNull();
    expect(tipoPanelPaso(null)).toBeNull();
  });
});
