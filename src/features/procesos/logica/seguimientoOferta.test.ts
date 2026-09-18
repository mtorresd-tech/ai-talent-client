import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoOferta } from './seguimientoOferta';

const catalogoOferta = [
  {
    clave: 'OFERTA_GENERADA',
    etiqueta: 'Oferta generada',
    descripcion: 'La oferta fue generada y enviada al candidato.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'INICIAR_PROCESO_CONTRATACION',
    etiqueta: 'Iniciar proceso de contratacion',
    descripcion:
      'El candidato acepto. El proceso de seleccion termina y arranca la contratacion, que esta fuera del alcance de IA Talento.',
    categoria: 'APROBADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

describe('describirEstadoOferta', () => {
  it('resuelve título y descripción del catálogo tal cual para el candidato final real', () => {
    const { titulo, descripcion } = describirEstadoOferta(
      'INICIAR_PROCESO_CONTRATACION',
      catalogoOferta,
    );
    expect(titulo).toBe('Iniciar proceso de contratacion');
    expect(descripcion).toBe(
      'El candidato acepto. El proceso de seleccion termina y arranca la contratacion, que esta fuera del alcance de IA Talento.',
    );
  });

  it('resuelve título y descripción del catálogo para cualquier otro estado, sin copy propio', () => {
    const { titulo, descripcion } = describirEstadoOferta('OFERTA_GENERADA', catalogoOferta);
    expect(titulo).toBe('Oferta generada');
    expect(descripcion).toBe('La oferta fue generada y enviada al candidato.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoOferta('ESTADO_DESCONOCIDO', undefined);
    expect(titulo).toBe('Estado Desconocido');
    expect(descripcion).toBe('');
  });
});
