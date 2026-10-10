import { describe, expect, it } from 'vitest';
import {
  decisionMatriz,
  filaIncompleta,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import {
  esElegible,
  estadoEnvioMatriz,
  idsObjetados,
  objecionDe,
  puedeEnviar,
} from './estadoEnvioMatriz';

const abierta = matrizSeleccion();
const pendiente = matrizSeleccion({ seleccion: seleccionMatriz() });
const avalada = matrizSeleccion({
  seleccion: seleccionMatriz(),
  decisionLider: decisionMatriz({ avala: true, motivo: null }),
});
const objetada = matrizSeleccion({
  seleccion: seleccionMatriz(),
  decisionLider: decisionMatriz(),
  objeciones: [objecionMatriz({ jobApplicationId: 'APP-3' })],
});

describe('estadoEnvioMatriz', () => {
  it('ABIERTA sin selección', () => {
    expect(estadoEnvioMatriz(abierta)).toBe('ABIERTA');
  });

  it('ENVIADA_PENDIENTE con selección y sin decisión del líder', () => {
    expect(estadoEnvioMatriz(pendiente)).toBe('ENVIADA_PENDIENTE');
  });

  it('AVALADA con decisionLider.avala true', () => {
    expect(estadoEnvioMatriz(avalada)).toBe('AVALADA');
  });

  it('OBJETADA con decisionLider.avala false', () => {
    expect(estadoEnvioMatriz(objetada)).toBe('OBJETADA');
  });

  it('ENVIADA_PENDIENTE tras una reelección (decisión en null y una objeción histórica)', () => {
    const reelegida = matrizSeleccion({
      seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
      objeciones: [objecionMatriz({ jobApplicationId: 'APP-1' })],
    });
    expect(estadoEnvioMatriz(reelegida)).toBe('ENVIADA_PENDIENTE');
  });
});

describe('idsObjetados', () => {
  it('en OBJETADA incluye el seleccionado vigente y todos los de objeciones', () => {
    expect([...idsObjetados(objetada)].sort()).toEqual(['APP-1', 'APP-3']);
  });

  it('en ENVIADA_PENDIENTE incluye solo los de objeciones', () => {
    const conHistorial = { ...pendiente, objeciones: [objecionMatriz()] };
    expect([...idsObjetados(conHistorial)]).toEqual(['APP-3']);
  });

  it('trata objeciones ausente como lista vacía', () => {
    const sinCampo = { ...pendiente, objeciones: undefined };
    expect(idsObjetados(sinCampo).size).toBe(0);
  });
});

describe('objecionDe', () => {
  it('para el objetado vigente devuelve los datos de decisionLider', () => {
    expect(objecionDe(objetada, 'APP-1')).toEqual({
      motivo: 'El concepto del área no alcanza para el cargo.',
      decididaPor: decisionMatriz().decididaPor,
      decididaEn: '2026-11-11T09:00:00Z',
    });
  });

  it('para un objetado histórico devuelve los datos de objeciones', () => {
    expect(objecionDe(objetada, 'APP-3')).toEqual({
      motivo: 'Le falta experiencia en el sector.',
      decididaPor: objecionMatriz().decididaPor,
      decididaEn: '2026-11-05T09:00:00Z',
    });
  });

  it('devuelve null para un candidato no objetado', () => {
    expect(objecionDe(objetada, 'APP-2')).toBeNull();
    expect(objecionDe(pendiente, 'APP-1')).toBeNull();
  });
});

describe('esElegible y puedeEnviar', () => {
  const completo = filaMatriz({ jobApplicationId: 'APP-2' });

  it('el objetado vigente es elegible y se puede volver a enviar en OBJETADA', () => {
    const objetadoVigente = filaMatriz({ jobApplicationId: 'APP-1' });
    expect(esElegible(objetada, objetadoVigente)).toBe(true);
    expect(puedeEnviar(objetada, objetadoVigente)).toBe(true);
  });

  it('un objetado histórico es elegible y se puede enviar en OBJETADA', () => {
    const objetadoHistorico = filaMatriz({ jobApplicationId: 'APP-3' });
    expect(esElegible(objetada, objetadoHistorico)).toBe(true);
    expect(puedeEnviar(objetada, objetadoHistorico)).toBe(true);
  });

  it('un objetado histórico no se puede enviar mientras la matriz espera al líder', () => {
    const conHistorial = { ...pendiente, objeciones: [objecionMatriz()] };
    const objetadoHistorico = filaMatriz({ jobApplicationId: 'APP-3' });
    expect(esElegible(conHistorial, objetadoHistorico)).toBe(true);
    expect(puedeEnviar(conHistorial, objetadoHistorico)).toBe(false);
  });

  it('un incompleto no es elegible ni enviable', () => {
    expect(esElegible(abierta, filaIncompleta())).toBe(false);
    expect(puedeEnviar(abierta, filaIncompleta())).toBe(false);
  });

  it('un completo se puede enviar en ABIERTA y en OBJETADA', () => {
    expect(puedeEnviar(abierta, completo)).toBe(true);
    expect(puedeEnviar(objetada, completo)).toBe(true);
  });

  it('en ENVIADA_PENDIENTE y AVALADA sigue siendo elegible pero no se puede enviar', () => {
    expect(esElegible(pendiente, completo)).toBe(true);
    expect(puedeEnviar(pendiente, completo)).toBe(false);
    expect(puedeEnviar(avalada, completo)).toBe(false);
  });
});
