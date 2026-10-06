import { beforeEach, describe, expect, it } from 'vitest';
import { guardarRutaDestino, leerYLimpiarRutaDestino } from './rutaDestinoLogin';

const CLAVE_RUTA_DESTINO = 'selecta:ruta-destino-login';

beforeEach(() => {
  sessionStorage.clear();
});

describe('rutaDestinoLogin', () => {
  it('guardarRutaDestino escribe la ruta en sessionStorage', () => {
    guardarRutaDestino('/procesos/candidato/123?vacante=REQ-1');

    expect(sessionStorage.getItem(CLAVE_RUTA_DESTINO)).toBe(
      '/procesos/candidato/123?vacante=REQ-1',
    );
  });

  it('leerYLimpiarRutaDestino devuelve la ruta guardada y la elimina (lectura de un solo uso)', () => {
    guardarRutaDestino('/procesos/candidato/123');

    expect(leerYLimpiarRutaDestino()).toBe('/procesos/candidato/123');
    expect(sessionStorage.getItem(CLAVE_RUTA_DESTINO)).toBeNull();
    expect(leerYLimpiarRutaDestino()).toBeNull();
  });

  it('leerYLimpiarRutaDestino devuelve null si no hay ninguna ruta guardada', () => {
    expect(leerYLimpiarRutaDestino()).toBeNull();
  });
});
