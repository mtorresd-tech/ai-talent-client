import { describe, expect, it } from 'vitest';
import type { Notificacion } from '../api/notificaciones';
import { rutaNotificacion } from './rutaNotificacion';

function notificacion(tipo: Notificacion['tipo']): Notificacion {
  return {
    id: 'ntf_1',
    jobRequisitionId: 'REQ-1',
    jobApplicationId: 'ja_1',
    tipo,
    mensaje: 'mensaje',
    creadaEn: '2026-09-12T14:30:00Z',
    leida: false,
  };
}

describe('rutaNotificacion', () => {
  it('para Reclutador con INFORME_ANONIMIZACION_LISTO devuelve la vista de pipeline con paso ANONIMIZACION', () => {
    expect(rutaNotificacion(notificacion('INFORME_ANONIMIZACION_LISTO'), true)).toBe(
      '/procesos?vacante=REQ-1&paso=ANONIMIZACION&candidato=ja_1',
    );
  });

  it('para Reclutador con INFORME_SELECTA_LISTO devuelve la vista de pipeline con paso SELECTA', () => {
    expect(rutaNotificacion(notificacion('INFORME_SELECTA_LISTO'), true)).toBe(
      '/procesos?vacante=REQ-1&paso=SELECTA&candidato=ja_1',
    );
  });

  it('para Reclutador con MATRIZ_REVISADA_POR_EL_LIDER devuelve la vista de pipeline con paso MATRIZ_SELECCION', () => {
    expect(rutaNotificacion(notificacion('MATRIZ_REVISADA_POR_EL_LIDER'), true)).toBe(
      '/procesos?vacante=REQ-1&paso=MATRIZ_SELECCION&candidato=ja_1',
    );
  });

  it('para Reclutador con MATRIZ_ENVIADA_AL_LIDER devuelve null (sin mapeo a paso)', () => {
    expect(rutaNotificacion(notificacion('MATRIZ_ENVIADA_AL_LIDER'), true)).toBeNull();
  });

  it('para Líder con INFORME_ANONIMIZACION_LISTO devuelve la vista de pipeline sin paso', () => {
    expect(rutaNotificacion(notificacion('INFORME_ANONIMIZACION_LISTO'), false)).toBe(
      '/procesos?vacante=REQ-1&candidato=ja_1',
    );
  });

  it('para Líder con INFORME_SELECTA_LISTO devuelve null (el Líder no revisa el informe de Selecta)', () => {
    expect(rutaNotificacion(notificacion('INFORME_SELECTA_LISTO'), false)).toBeNull();
  });

  it('para Líder con MATRIZ_ENVIADA_AL_LIDER devuelve null', () => {
    expect(rutaNotificacion(notificacion('MATRIZ_ENVIADA_AL_LIDER'), false)).toBeNull();
  });

  it('para Líder con MATRIZ_REVISADA_POR_EL_LIDER devuelve null', () => {
    expect(rutaNotificacion(notificacion('MATRIZ_REVISADA_POR_EL_LIDER'), false)).toBeNull();
  });
});
