import { describe, expect, it } from 'vitest';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { obtenerCandidato } from './candidatos';

describe('obtenerCandidato', () => {
  it('normaliza `integraciones` y `sincronizacionSfsf.intentos` ausentes a sus valores por defecto', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      jobApplicationId: 'APP-1',
      desgloseAfinidad: null,
      sincronizacionSfsf: { estado: 'PENDIENTE', ultimaSincronizacion: null, ultimoError: null },
    });

    const candidato = await obtenerCandidato(cliente, 'APP-1');

    expect(candidato.integraciones).toEqual([]);
    expect(candidato.sincronizacionSfsf.intentos).toBe(0);
  });

  it('conserva `integraciones` y `sincronizacionSfsf.intentos` cuando el backend sí los envía', async () => {
    const cliente = crearClienteApiFalso();
    const integracion = { proveedor: 'BLUESITE' };
    cliente.get.mockResolvedValue({
      jobApplicationId: 'APP-1',
      desgloseAfinidad: null,
      integraciones: [integracion],
      sincronizacionSfsf: {
        estado: 'SINCRONIZADO',
        ultimaSincronizacion: null,
        intentos: 3,
        ultimoError: null,
      },
    });

    const candidato = await obtenerCandidato(cliente, 'APP-1');

    expect(candidato.integraciones).toEqual([integracion]);
    expect(candidato.sincronizacionSfsf.intentos).toBe(3);
  });
});
