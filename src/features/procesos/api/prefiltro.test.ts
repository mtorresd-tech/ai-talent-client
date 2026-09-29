import { describe, expect, it } from 'vitest';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { obtenerPrefiltro } from './prefiltro';

describe('obtenerPrefiltro', () => {
  it('normaliza `sincronizacionSfsf.intentos` ausente a 0', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      jobApplicationId: 'APP-40',
      registradoEn: '2026-08-15T00:00:00Z',
      sincronizacionSfsf: { estado: 'SINCRONIZADO', ultimaSincronizacion: null, ultimoError: null },
    });

    const prefiltro = await obtenerPrefiltro(cliente, 'APP-40');

    expect(prefiltro.sincronizacionSfsf.intentos).toBe(0);
  });

  it('conserva `sincronizacionSfsf.intentos` cuando el backend sí lo envía', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      jobApplicationId: 'APP-40',
      registradoEn: '2026-08-15T00:00:00Z',
      sincronizacionSfsf: {
        estado: 'FALLIDA',
        ultimaSincronizacion: null,
        intentos: 2,
        ultimoError: 'Timeout',
      },
    });

    const prefiltro = await obtenerPrefiltro(cliente, 'APP-40');

    expect(prefiltro.sincronizacionSfsf.intentos).toBe(2);
  });

  it('expone los 3 campos nuevos del payload real', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      jobApplicationId: 'APP-40',
      registradoEn: '2026-08-15T00:00:00Z',
      sincronizacionSfsf: {
        estado: 'SINCRONIZADO',
        ultimaSincronizacion: null,
        intentos: 0,
        ultimoError: null,
      },
      tiempoVinculacion: 'Menos de 1 año',
      sancionadoUltimoAnio: false,
      promovidoUltimoAnio: true,
    });

    const prefiltro = await obtenerPrefiltro(cliente, 'APP-40');

    expect(prefiltro.tiempoVinculacion).toBe('Menos de 1 año');
    expect(prefiltro.sancionadoUltimoAnio).toBe(false);
    expect(prefiltro.promovidoUltimoAnio).toBe(true);
  });
});
