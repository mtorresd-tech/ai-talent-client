import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import {
  ETIQUETA_ESTADO_PROCESO,
  colorEstado,
  colorPorCategoria,
  etiquetaEstado,
  resolverColorEstado,
  resolverEtiquetaEstado,
} from './etiquetasEstado';

const catalogo: EstadoCatalogo[] = [
  {
    clave: 'RANKING_SELECTA',
    etiqueta: 'En proceso de ranking',
    descripcion: 'desc',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
];

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

describe('colorPorCategoria', () => {
  it('mapea cada categoría del catálogo a un color de chip', () => {
    expect(colorPorCategoria('EN_CURSO')).toBe('info');
    expect(colorPorCategoria('APROBADO')).toBe('success');
    expect(colorPorCategoria('DESCARTADO')).toBe('error');
    expect(colorPorCategoria('EXCEPCION')).toBe('warning');
    expect(colorPorCategoria(null)).toBe('default');
  });
});

describe('resolverEtiquetaEstado', () => {
  it('usa la etiqueta del catálogo cuando la clave está presente', () => {
    expect(resolverEtiquetaEstado(catalogo, 'RANKING_SELECTA')).toBe('En proceso de ranking');
  });

  it('cae al fallback Title Case cuando la clave no está en el catálogo', () => {
    expect(resolverEtiquetaEstado(catalogo, 'DESCARTADO_ENTREVISTA_JEFE')).toBe(
      'Descartado Entrevista Jefe',
    );
    expect(resolverEtiquetaEstado(null, 'RANKING_SELECTA')).toBe('En ranking');
  });
});

describe('resolverColorEstado', () => {
  it('deriva el color de la categoría del catálogo', () => {
    expect(resolverColorEstado(catalogo, 'RANKING_SELECTA')).toBe('info');
  });

  it('cae al mapa local si el catálogo no tiene la clave', () => {
    expect(resolverColorEstado(catalogo, 'PREFILTRO_PENDIENTE')).toBe('warning');
  });
});
