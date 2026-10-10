import { useCallback, useState } from 'react';
import { ApiError, type GebApiClient } from '@geb/api-client';
import {
  seleccionarCandidatoMatriz,
  type MatrizSeleccion,
  type SeleccionMatrizRequest,
} from '../api/matriz';
import { eliminarBorradoresDeVacante } from '../logica/borradorJustificacionMatriz';

/** Resultado de un envío: la matriz actualizada o el error normalizado. */
export type ResultadoSeleccionMatriz =
  { matriz: MatrizSeleccion; error: null } | { matriz: null; error: ApiError };

export interface SeleccionarCandidatoMatriz {
  enviando: boolean;
  /** Error normalizado del último envío; se traduce con `interpretarErrorSeleccion`. */
  error: ApiError | null;
  /** Matriz devuelta por el último envío exitoso; se conserva hasta `reiniciar()`. */
  resultado: MatrizSeleccion | null;
  seleccionar: (
    jobRequisitionId: string,
    datos: SeleccionMatrizRequest,
  ) => Promise<ResultadoSeleccionMatriz>;
  reiniciar: () => void;
}

/**
 * Envía un candidato al líder (`POST .../matriz/seleccion`). El puntaje no
 * viaja en el payload: sale de la matriz ya calculada. Al enviar con éxito se
 * eliminan los borradores de justificación de todos los candidatos de la
 * vacante.
 */
export function useSeleccionarCandidatoMatriz(
  clienteApi: GebApiClient,
): SeleccionarCandidatoMatriz {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [resultado, setResultado] = useState<MatrizSeleccion | null>(null);

  const reiniciar = useCallback(() => {
    setEnviando(false);
    setError(null);
    setResultado(null);
  }, []);

  const seleccionar = useCallback(
    async (
      jobRequisitionId: string,
      datos: SeleccionMatrizRequest,
    ): Promise<ResultadoSeleccionMatriz> => {
      setEnviando(true);
      setError(null);
      try {
        const respuesta = await seleccionarCandidatoMatriz(clienteApi, jobRequisitionId, datos);
        eliminarBorradoresDeVacante(jobRequisitionId);
        setResultado(respuesta);
        return { matriz: respuesta, error: null };
      } catch (problema: unknown) {
        const apiError =
          problema instanceof ApiError
            ? problema
            : new ApiError({ title: 'Error inesperado', status: 0 }, 'desconocido');
        setError(apiError);
        return { matriz: null, error: apiError };
      } finally {
        setEnviando(false);
      }
    },
    [clienteApi],
  );

  return { enviando, error, resultado, seleccionar, reiniciar };
}
