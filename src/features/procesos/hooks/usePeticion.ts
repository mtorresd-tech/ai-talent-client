import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@geb/api-client';

/**
 * Estado uniforme de una región de datos de la pantalla de Procesos.
 * Cada hook de datos (vacantes, detalle, pipeline, candidatos, ...) expone
 * esta misma forma para que la página pinte carga/error/vacío por región sin
 * tumbar el resto.
 */
export interface EstadoPeticion<T> {
  datos: T | null;
  cargando: boolean;
  error: ApiError | null;
  /** Vuelve a ejecutar la petición con las mismas entradas. */
  recargar: () => void;
}

interface EstadoInterno<T> {
  datos: T | null;
  cargando: boolean;
  error: ApiError | null;
}

const REPOSO = { datos: null, cargando: false, error: null } as const;

/**
 * Ejecuta `ejecutor` cada vez que cambia alguno de sus `dependencias` y cancela
 * la petición anterior con `AbortController` — si el usuario cambia de vacante,
 * etapa, página o candidato mientras una respuesta viaja, esa respuesta
 * obsoleta se descarta y no se pinta.
 *
 * El disparo se controla por `dependencias` (valores primitivos que resumen las
 * entradas), no por la identidad de `ejecutor`: así el consumidor puede pasar
 * una función nueva en cada render sin provocar un bucle de recargas. `ejecutor`
 * recibe el `AbortSignal` y debe pasarlo al cliente HTTP
 * (`clienteApi.get(url, { signal })`).
 *
 * Si `habilitado` es `false` no se dispara ninguna petición y el estado queda
 * en reposo (se usa para las etapas no operativas del pipeline, que no llaman
 * al backend).
 */
export function usePeticion<T>(
  ejecutor: (signal: AbortSignal) => Promise<T>,
  dependencias: readonly unknown[],
  habilitado = true,
): EstadoPeticion<T> {
  const [estado, setEstado] = useState<EstadoInterno<T>>(REPOSO);
  const [contadorRecarga, setContadorRecarga] = useState(0);

  const recargar = useCallback(() => setContadorRecarga((n) => n + 1), []);

  useEffect(() => {
    if (!habilitado) return;

    const controlador = new AbortController();
    let activo = true;

    const cargar = async (): Promise<void> => {
      // Conserva `datos` mientras carga, para no colapsar la región a un
      // estado vacío y evitar el salto de layout.
      setEstado((previo) => ({ datos: previo.datos, cargando: true, error: null }));
      try {
        const respuesta = await ejecutor(controlador.signal);
        if (!activo || controlador.signal.aborted) return;
        setEstado({ datos: respuesta, cargando: false, error: null });
      } catch (problema: unknown) {
        if (!activo || controlador.signal.aborted) return;
        const apiError =
          problema instanceof ApiError
            ? problema
            : new ApiError(
                { title: 'No se pudo completar la solicitud', status: 0 },
                'desconocido',
              );
        // Contexto mínimo para soporte, sin volcar el payload ni datos personales.
        console.error('[procesos] fallo de carga', apiError.idCorrelacion, apiError.problem.status);
        setEstado({ datos: null, cargando: false, error: apiError });
      }
    };

    void cargar();

    return () => {
      activo = false;
      controlador.abort();
    };
    // `ejecutor` se invoca con la versión vigente en cada disparo; el disparo lo
    // gobiernan `dependencias`, no su identidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, contadorRecarga, ...dependencias]);

  return {
    datos: habilitado ? estado.datos : null,
    cargando: habilitado ? estado.cargando : false,
    error: habilitado ? estado.error : null,
    recargar,
  };
}
