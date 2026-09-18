import { describe, expect, it } from 'vitest';
import {
  CLAVE_ETAPA_RANKING,
  esEtapaOperativa,
  esPasoAnonimizacion,
  esPasoBluesite,
  esPasoCosinte,
  esPasoMedilaboral,
  esPasoOferta,
  esPasoSelecta,
  estadosDeEtapa,
  panelTieneIntegracionProveedor,
  proveedorDePanel,
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
    expect(estadosDeEtapa('CLAVE_NO_MAPEADA')).toEqual([]);
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

  it('traduce el paso de Cosinte a los estados del estudio de seguridad', () => {
    expect(estadosDeEtapa('COSINTE')).toEqual([
      'EN_PRUEBAS_COSINTE',
      'RESULTADO_PRUEBAS_COSINTE',
      'APROBO_PRUEBAS_COSINTE',
      'DESCARTADO_PRUEBAS_COSINTE',
      'BLOQUEADO_COSINTE_6M',
    ]);
  });

  it('traduce el paso de Medilaboral a los estados de los exámenes médicos', () => {
    expect(estadosDeEtapa('MEDILABORAL')).toEqual([
      'EN_PRUEBAS_MEDILABORAL',
      'RESULTADO_PRUEBAS_MEDILABORAL',
      'APROBO_PRUEBAS_MEDILABORAL',
      'DESCARTADO_PRUEBAS_MEDILABORAL',
    ]);
  });
});

describe('esEtapaOperativa', () => {
  it('Selecta, el listado de filtrados, la anonimización, Bluesite, Cosinte y Medilaboral son operativos; el resto no', () => {
    expect(esEtapaOperativa(CLAVE_ETAPA_RANKING)).toBe(true);
    expect(esEtapaOperativa('LISTA_FILTRADOS')).toBe(true);
    expect(esEtapaOperativa('ANONIMIZACION')).toBe(true);
    expect(esEtapaOperativa('BLUESITE')).toBe(true);
    expect(esEtapaOperativa('COSINTE')).toBe(true);
    expect(esEtapaOperativa('MEDILABORAL')).toBe(true);
    expect(esEtapaOperativa('CLAVE_NO_MAPEADA')).toBe(false);
  });

  it('OFERTA devuelve false a propósito: no tiene entrada en ESTADOS_POR_ETAPA (no lista candidatos)', () => {
    expect(esEtapaOperativa('OFERTA')).toBe(false);
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

describe('esPasoCosinte', () => {
  it('solo es cierto para el paso de Cosinte', () => {
    expect(esPasoCosinte('COSINTE')).toBe(true);
    expect(esPasoCosinte('BLUESITE')).toBe(false);
    expect(esPasoCosinte('ANONIMIZACION')).toBe(false);
    expect(esPasoCosinte(null)).toBe(false);
  });
});

describe('esPasoMedilaboral', () => {
  it('solo es cierto para el paso de Medilaboral', () => {
    expect(esPasoMedilaboral('MEDILABORAL')).toBe(true);
    expect(esPasoMedilaboral('COSINTE')).toBe(false);
    expect(esPasoMedilaboral('BLUESITE')).toBe(false);
    expect(esPasoMedilaboral(null)).toBe(false);
  });
});

describe('esPasoOferta', () => {
  it('solo es cierto para el paso de Oferta', () => {
    expect(esPasoOferta('OFERTA')).toBe(true);
    expect(esPasoOferta('COSINTE')).toBe(false);
    expect(esPasoOferta('MEDILABORAL')).toBe(false);
    expect(esPasoOferta(null)).toBe(false);
  });
});

describe('tipoPanelPaso', () => {
  it('discrimina el panel derecho por tipo de paso', () => {
    expect(tipoPanelPaso('SELECTA')).toBe('SELECTA');
    expect(tipoPanelPaso('LISTA_FILTRADOS')).toBe('PREFILTRO');
    expect(tipoPanelPaso('ANONIMIZACION')).toBe('ANONIMIZACION');
    expect(tipoPanelPaso('BLUESITE')).toBe('BLUESITE');
    expect(tipoPanelPaso('COSINTE')).toBe('COSINTE');
    expect(tipoPanelPaso('MEDILABORAL')).toBe('MEDILABORAL');
    expect(tipoPanelPaso('OFERTA')).toBe('OFERTA');
    expect(tipoPanelPaso(null)).toBeNull();
  });
});

describe('panelTieneIntegracionProveedor', () => {
  it('es cierto para Bluesite, Cosinte y Medilaboral; falso para el resto', () => {
    expect(panelTieneIntegracionProveedor('BLUESITE')).toBe(true);
    expect(panelTieneIntegracionProveedor('COSINTE')).toBe(true);
    expect(panelTieneIntegracionProveedor('MEDILABORAL')).toBe(true);
    expect(panelTieneIntegracionProveedor('SELECTA')).toBe(false);
    expect(panelTieneIntegracionProveedor('ANONIMIZACION')).toBe(false);
    // Oferta no tiene proveedor propio en el enum `Proveedor`.
    expect(panelTieneIntegracionProveedor('OFERTA')).toBe(false);
    expect(panelTieneIntegracionProveedor(null)).toBe(false);
  });
});

describe('proveedorDePanel', () => {
  it('resuelve el proveedor de cada panel de integración; el resto queda indefinido', () => {
    expect(proveedorDePanel('MEDILABORAL')).toBe('MEDILABORAL');
    expect(proveedorDePanel('BLUESITE')).toBe('BLUESITE');
    expect(proveedorDePanel('COSINTE')).toBe('COSINTE');
    expect(proveedorDePanel('OFERTA')).toBeUndefined();
    expect(proveedorDePanel(null)).toBeUndefined();
  });
});
