import { describe, expect, it } from 'vitest';
import type { Notificacion } from '../api/notificaciones';
import { rutaNotificacion } from './rutaNotificacion';

function notificacion(tipo: Notificacion['tipo']): Notificacion {
  return {
    id: 'ntf_1',
    jobApplicationId: 'ja_1',
    tipo,
    mensaje: 'mensaje',
    creadaEn: '2026-09-12T14:30:00Z',
    leida: false,
  };
}

describe('rutaNotificacion', () => {
  it('devuelve la ruta del candidato para un reclutador, sin importar el tipo', () => {
    expect(rutaNotificacion(notificacion('INFORME_SELECTA_LISTO'), true)).toBe(
      '/procesos/candidato/ja_1',
    );
    expect(rutaNotificacion(notificacion('INFORME_ANONIMIZACION_LISTO'), true)).toBe(
      '/procesos/candidato/ja_1',
    );
  });

  it('devuelve null para un usuario sin rol reclutador, sin importar el tipo', () => {
    expect(rutaNotificacion(notificacion('INFORME_SELECTA_LISTO'), false)).toBeNull();
    expect(rutaNotificacion(notificacion('INFORME_ANONIMIZACION_LISTO'), false)).toBeNull();
  });
});
