import { useCallback, useState } from 'react';
import { ApiError, type GebApiClient } from '@geb/api-client';
import { registrarDecision, type DecisionResultado } from '../api/bandejas';
import { nuevaClaveIdempotencia } from '../logica/idempotencia';

export interface DecisionLider {
  enviando: boolean;
  error: ApiError | null;
  resultado: DecisionResultado | null;
  /** Registra la decisión del líder con una `Idempotency-Key` nueva por cada invocación. */
  decidir: (
    jobApplicationId: string,
    decision: 'APRUEBA' | 'RECHAZA',
    motivo?: string,
    comentario?: string,
  ) => Promise<DecisionResultado | null>;
}

/**
 * Registra la decisión de la compuerta LIDER para un único candidato
 * (`POST /candidatos/{jobApplicationId}/decisiones`). A diferencia de
 * `useEnviarPrefiltro`, no procesa lotes: cada llamada a `decidir` es un
 * intento independiente, con su propia `Idempotency-Key`.
 */
export function useDecisionLider(clienteApi: GebApiClient): DecisionLider {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [resultado, setResultado] = useState<DecisionResultado | null>(null);

  const decidir = useCallback(
    async (
      jobApplicationId: string,
      decision: 'APRUEBA' | 'RECHAZA',
      motivo?: string,
      comentario?: string,
    ): Promise<DecisionResultado | null> => {
      setEnviando(true);
      setError(null);
      try {
        const respuesta = await registrarDecision(
          clienteApi,
          jobApplicationId,
          { compuerta: 'LIDER', decision, motivo, comentario },
          { idempotencyKey: nuevaClaveIdempotencia() },
        );
        setResultado(respuesta);
        setEnviando(false);
        return respuesta;
      } catch (problema: unknown) {
        const apiError =
          problema instanceof ApiError
            ? problema
            : new ApiError({ title: 'Error inesperado', status: 0 }, 'desconocido');
        // Sin datos personales: solo el id de correlación y el status del error.
        console.warn(
          '[procesos] decisión de líder fallida',
          apiError.idCorrelacion,
          apiError.problem.status,
        );
        setError(apiError);
        setEnviando(false);
        return null;
      }
    },
    [clienteApi],
  );

  return { enviando, error, resultado, decidir };
}
