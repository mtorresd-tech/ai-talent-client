import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoRevisionLider } from './seguimientoAnonimizacion';

describe('describirEstadoRevisionLider', () => {
  it('describe el informe incógnito recién enviado', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('INFORME_INCOGNITO');
    expect(titulo).toBe('Enviado al líder');
    expect(descripcion).toMatch(/anonimizada y enviada al líder/i);
  });

  it('describe la revisión en curso mencionando que se espera la decisión', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('EN_REVISION_LIDER');
    expect(titulo).toBe('En revisión del líder');
    expect(descripcion).toMatch(/Esperando su decisión/i);
  });

  it('describe el rechazo del líder', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('RECHAZADO_LIDER');
    expect(titulo).toBe('Descartado por el líder');
    expect(descripcion).toMatch(/descartó al candidato/i);
  });

  it('para un estado fuera de la lista cae al catálogo cuando lo tiene', () => {
    const catalogo = [
      {
        clave: 'APROBADO_LIDER_PRUEBAS',
        etiqueta: 'Aprobado por el líder',
        descripcion: 'El líder aprobó al candidato para pruebas.',
        categoria: 'APROBADO',
        terminal: false,
        compuertaPendiente: null,
        compuertaEtiqueta: null,
        transicionesPermitidas: [],
      },
    ] as unknown as EstadoCatalogo[];

    const { titulo, descripcion } = describirEstadoRevisionLider(
      'APROBADO_LIDER_PRUEBAS',
      catalogo,
    );
    expect(titulo).toBe('Aprobado por el líder');
    expect(descripcion).toBe('El líder aprobó al candidato para pruebas.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('APROBADO_LIDER_PRUEBAS');
    expect(titulo).toBe('Aprobado Lider Pruebas');
    expect(descripcion).toBe('');
  });
});
