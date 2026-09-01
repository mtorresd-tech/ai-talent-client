import { describe, expect, it } from 'vitest';
import { ETIQUETA_ESTADO_PROCESO, colorEstado, etiquetaEstado } from './etiquetasEstado';

describe('etiquetaEstado', () => {
  it('devuelve la etiqueta fija en español para un estado conocido', () => {
    expect(etiquetaEstado('RANKING_SELECTA')).toBe('En ranking');
    expect(etiquetaEstado('PREFILTRO_PENDIENTE')).toBe('Prefiltro pendiente');
  });

  it('normaliza a Title Case un estado no listado', () => {
    expect(etiquetaEstado('DESCARTADO_ENTREVISTA_JEFE')).toBe('Descartado Entrevista Jefe');
  });

  it('maneja null/undefined', () => {
    expect(etiquetaEstado(null)).toBe('Sin estado');
  });
});

describe('ETIQUETA_ESTADO_PROCESO', () => {
  it('expone las etiquetas fijas y un fallback en Title Case', () => {
    expect(ETIQUETA_ESTADO_PROCESO['RANKING_SELECTA']).toBe('En ranking');
    expect(ETIQUETA_ESTADO_PROCESO['ESTADO_NUEVO_SIN_MAPEAR']).toBe('Estado Nuevo Sin Mapear');
  });
});

describe('colorEstado', () => {
  it('distingue los tres estados del listado de filtrados', () => {
    expect(colorEstado('PREFILTRO_PENDIENTE')).toBe('warning');
    expect(colorEstado('PREFILTRO_COMPLETADO')).toBe('info');
    expect(colorEstado('PRESELECCIONADO')).toBe('success');
  });

  it('devuelve "default" para cualquier otro estado o nulo', () => {
    expect(colorEstado('RANKING_SELECTA')).toBe('default');
    expect(colorEstado(null)).toBe('default');
  });
});
