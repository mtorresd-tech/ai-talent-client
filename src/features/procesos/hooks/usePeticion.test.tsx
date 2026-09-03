import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePeticion } from './usePeticion';

/** Promesa con `resolve` expuesto, para controlar el momento de la respuesta. */
function diferida<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((res) => {
    resolver = res;
  });
  return { promesa, resolver };
}

describe('usePeticion', () => {
  it('ejecuta y expone los datos', async () => {
    const ejecutor = () => Promise.resolve('ok');
    const { result } = renderHook(() => usePeticion(ejecutor, []));

    expect(result.current.cargando).toBe(true);
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toBe('ok');
    expect(result.current.error).toBeNull();
  });

  it('no dispara la petición cuando está deshabilitado', () => {
    const ejecutor = vi.fn(() => Promise.resolve('ok'));
    const { result } = renderHook(() => usePeticion(ejecutor, [], false));

    expect(ejecutor).not.toHaveBeenCalled();
    expect(result.current.datos).toBeNull();
    expect(result.current.cargando).toBe(false);
  });

  it('cancela la petición anterior y solo pinta la respuesta vigente al cambiar de entrada', async () => {
    const primera = diferida<string>();
    const segunda = diferida<string>();

    const ejecutorA = vi.fn<(senal: AbortSignal) => Promise<string>>(() => primera.promesa);
    const ejecutorB = vi.fn<(senal: AbortSignal) => Promise<string>>(() => segunda.promesa);

    const { result, rerender } = renderHook(({ ej }) => usePeticion(ej, [ej]), {
      initialProps: { ej: ejecutorA },
    });

    // Cambia la entrada antes de que la primera responda: su AbortSignal se aborta.
    rerender({ ej: ejecutorB });
    expect((ejecutorA.mock.calls[0][0] as AbortSignal).aborted).toBe(true);
    expect((ejecutorB.mock.calls[0][0] as AbortSignal).aborted).toBe(false);

    // La primera responde tarde y no debe pintarse; solo la vigente.
    primera.resolver('obsoleta');
    segunda.resolver('vigente');

    await waitFor(() => expect(result.current.datos).toBe('vigente'));
  });

  it('conserva los datos previos mientras carga la siguiente respuesta', async () => {
    const primera = diferida<string>();
    const segunda = diferida<string>();
    const ejecutor = vi.fn(() => primera.promesa).mockReturnValueOnce(primera.promesa);

    const { result, rerender } = renderHook(({ dep }) => usePeticion(ejecutor, [dep]), {
      initialProps: { dep: 'a' },
    });
    primera.resolver('inicial');
    await waitFor(() => expect(result.current.datos).toBe('inicial'));

    ejecutor.mockReturnValueOnce(segunda.promesa);
    rerender({ dep: 'b' });

    expect(result.current.cargando).toBe(true);
    expect(result.current.datos).toBe('inicial');

    segunda.resolver('siguiente');
    await waitFor(() => expect(result.current.datos).toBe('siguiente'));
  });

  it('normaliza el error y lo expone', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ejecutor = () => Promise.reject(new Error('fallo'));
    const { result } = renderHook(() => usePeticion(ejecutor, []));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.cargando).toBe(false);
    expect(result.current.error?.problem.title).toBeTruthy();
  });
});
