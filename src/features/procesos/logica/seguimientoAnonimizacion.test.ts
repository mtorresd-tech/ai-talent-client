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

  it('describe la aprobación del líder', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('APROBADO_LIDER_PRUEBAS');
    expect(titulo).toBe('Aprobado por el líder');
    expect(descripcion).toMatch(/aprobó al candidato/i);
  });

  it('describe el rechazo del líder', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('RECHAZADO_LIDER');
    expect(titulo).toBe('Descartado por el líder');
    expect(descripcion).toMatch(/descartó al candidato/i);
  });

  it('para un estado fuera de la lista cae al catálogo cuando lo tiene', () => {
    const catalogo = [
      {
        clave: 'EXPIRADO_SLA_LIDER',
        etiqueta: 'Venció el plazo del líder',
        descripcion: 'La decisión humana quedó sin tomar dentro del plazo.',
        categoria: 'EXCEPCION',
        terminal: true,
        compuertaPendiente: null,
        compuertaEtiqueta: null,
        transicionesPermitidas: [],
      },
    ] as unknown as EstadoCatalogo[];

    const { titulo, descripcion } = describirEstadoRevisionLider('EXPIRADO_SLA_LIDER', catalogo);
    expect(titulo).toBe('Venció el plazo del líder');
    expect(descripcion).toBe('La decisión humana quedó sin tomar dentro del plazo.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoRevisionLider('EXPIRADO_SLA_LIDER');
    expect(titulo).toBe('Expirado Sla Lider');
    expect(descripcion).toBe('');
  });
});
