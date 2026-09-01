import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSeleccionMultiple } from './useSeleccionMultiple';

describe('useSeleccionMultiple', () => {
  it('alterna ids dentro y fuera del set', () => {
    const { result } = renderHook(() => useSeleccionMultiple());

    act(() => result.current.alternar('a'));
    expect(result.current.estaSeleccionado('a')).toBe(true);
    expect(result.current.cantidad).toBe(1);

    act(() => result.current.alternar('b'));
    expect(result.current.ids.sort()).toEqual(['a', 'b']);

    act(() => result.current.alternar('a'));
    expect(result.current.estaSeleccionado('a')).toBe(false);
    expect(result.current.cantidad).toBe(1);
  });

  it('limpiar vacía la selección', () => {
    const { result } = renderHook(() => useSeleccionMultiple());

    act(() => {
      result.current.alternar('a');
      result.current.alternar('b');
    });
    act(() => result.current.limpiar());

    expect(result.current.cantidad).toBe(0);
    expect(result.current.ids).toEqual([]);
  });
});
