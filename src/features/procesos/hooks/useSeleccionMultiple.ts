import { useCallback, useMemo, useState } from 'react';

export interface SeleccionMultiple {
  /** Ids seleccionados, en un `Set` para consultas O(1). */
  seleccionados: ReadonlySet<string>;
  /** Lista estable de ids seleccionados. */
  ids: string[];
  cantidad: number;
  estaSeleccionado: (id: string) => boolean;
  alternar: (id: string) => void;
  limpiar: () => void;
}

/**
 * Selección múltiple por checkbox sobre la lista de ranking. Vive fuera de
 * `GebDataTable` porque la tabla del design system no expone selección de
 * filas.
 */
export function useSeleccionMultiple(): SeleccionMultiple {
  const [seleccionados, setSeleccionados] = useState<ReadonlySet<string>>(() => new Set());

  const alternar = useCallback((id: string) => {
    setSeleccionados((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }, []);

  const limpiar = useCallback(() => setSeleccionados(new Set()), []);

  const estaSeleccionado = useCallback((id: string) => seleccionados.has(id), [seleccionados]);

  const ids = useMemo(() => [...seleccionados], [seleccionados]);

  return {
    seleccionados,
    ids,
    cantidad: seleccionados.size,
    estaSeleccionado,
    alternar,
    limpiar,
  };
}
