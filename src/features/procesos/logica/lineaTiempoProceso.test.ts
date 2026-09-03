import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import type { EventoHistorial } from '../api/candidatos';
import { construirLineaTiempo } from './lineaTiempoProceso';

const catalogo: EstadoCatalogo[] = [
  {
    clave: 'RANKING_SELECTA',
    etiqueta: 'En ranking',
    descripcion: 'Candidato en el ranking de afinidad',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'RANKING',
    compuertaEtiqueta: 'Ranking',
    transicionesPermitidas: [],
  },
  {
    clave: 'PRESELECCIONADO',
    etiqueta: 'Preseleccionado',
    descripcion: 'Candidato preseleccionado tras el prefiltro',
    categoria: 'APROBADO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
];

function evento(parcial: Partial<EventoHistorial>): EventoHistorial {
  return {
    fecha: '2026-01-01T00:00:00Z',
    tipo: 'TRANSICION',
    estadoAnterior: null,
    estadoNuevo: null,
    disparador: 'JOB',
    actor: null,
    detalle: null,
    ...parcial,
  };
}

describe('construirLineaTiempo', () => {
  it('ordena por fecha ascendente y marca el último hito como actual', () => {
    const historial = [
      evento({ fecha: '2026-03-10T10:00:00Z', estadoNuevo: 'PRESELECCIONADO' }),
      evento({ fecha: '2026-01-05T08:00:00Z', estadoNuevo: 'RANKING_SELECTA' }),
    ];

    const hitos = construirLineaTiempo(historial, catalogo);

    expect(hitos.map((h) => h.clave)).toEqual(['RANKING_SELECTA', 'PRESELECCIONADO']);
    expect(hitos[0].estadoVisual).toBe('completado');
    expect(hitos[1].estadoVisual).toBe('actual');
    expect(hitos[0].titulo).toBe('En ranking');
    expect(hitos[0].descripcion).toBe('Candidato en el ranking de afinidad');
    expect(hitos[0].categoria).toBe('EN_CURSO');
  });

  it('cae a Title Case cuando el catálogo está vacío y no lanza', () => {
    const historial = [evento({ estadoNuevo: 'RANKING_SELECTA' })];
    expect(() => construirLineaTiempo(historial, [])).not.toThrow();
    expect(construirLineaTiempo(historial, [])[0].titulo).toBe('En ranking');
    expect(construirLineaTiempo(historial, null)[0].categoria).toBeNull();
  });

  it('incluye los eventos NOTIFICACION conservando el orden', () => {
    const historial = [
      evento({ fecha: '2026-01-01T00:00:00Z', estadoNuevo: 'RANKING_SELECTA' }),
      evento({ fecha: '2026-01-02T00:00:00Z', tipo: 'NOTIFICACION', detalle: 'Correo enviado' }),
      evento({ fecha: '2026-01-03T00:00:00Z', estadoNuevo: 'PRESELECCIONADO' }),
    ];

    const hitos = construirLineaTiempo(historial, catalogo);

    expect(hitos).toHaveLength(3);
    expect(hitos[1].tipoEvento).toBe('NOTIFICACION');
    expect(hitos[1].descripcion).toBe('Correo enviado');
    expect(hitos.map((h) => h.fechaIso)).toEqual([
      '2026-01-01T00:00:00Z',
      '2026-01-02T00:00:00Z',
      '2026-01-03T00:00:00Z',
    ]);
  });

  it('traduce actor y disparador en el subtítulo', () => {
    const historial = [
      evento({
        estadoNuevo: 'PRESELECCIONADO',
        disparador: 'MANUAL',
        actor: { tipo: 'HUMANO', upn: 'ana@geb.com.co', rol: 'RECLUTADOR' },
      }),
    ];

    expect(construirLineaTiempo(historial, catalogo)[0].actorTexto).toBe(
      'ana@geb.com.co · acción manual',
    );
  });

  it('devuelve una lista vacía para historial vacío o nulo', () => {
    expect(construirLineaTiempo([], catalogo)).toEqual([]);
    expect(construirLineaTiempo(null, catalogo)).toEqual([]);
  });
});
