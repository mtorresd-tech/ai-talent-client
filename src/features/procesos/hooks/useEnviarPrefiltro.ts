import { useCallback, useState } from 'react';
import { ApiError, type GebApiClient } from '@geb/api-client';
import { registrarDecision } from '../api/bandejas';

/** Un fallo concreto dentro del lote de envío a prefiltro. */
export interface FalloPrefiltro {
  id: string;
  motivo: string;
  correlationId?: string;
}

export interface ResultadoEnvioPrefiltro {
  exitosos: string[];
  fallidos: FalloPrefiltro[];
}

export interface ProgresoEnvio {
  procesados: number;
  total: number;
}

export interface EnvioPrefiltro {
  enviando: boolean;
  progreso: ProgresoEnvio | null;
  resultado: ResultadoEnvioPrefiltro | null;
  /**
   * Aprueba la compuerta RANKING de cada candidato de forma secuencial. Cada
   * `POST` lleva su propio `Idempotency-Key` (un reintento con la misma clave
   * es no-op en el backend). Un `409` marca ese candidato como fallido y el
   * lote continúa.
   */
  enviar: (ids: string[]) => Promise<ResultadoEnvioPrefiltro>;
  reiniciar: () => void;
}

function nuevaClaveIdempotencia(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * No existe un endpoint de decisión masiva: se hacen N `POST` secuenciales y se
 * consolida el resultado (éxitos y fallos con motivo + id de correlación). Al
 * terminar, el consumidor recarga la lista de la etapa.
 */
export function useEnviarPrefiltro(clienteApi: GebApiClient): EnvioPrefiltro {
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState<ProgresoEnvio | null>(null);
  const [resultado, setResultado] = useState<ResultadoEnvioPrefiltro | null>(null);

  const reiniciar = useCallback(() => {
    setEnviando(false);
    setProgreso(null);
    setResultado(null);
  }, []);

  const enviar = useCallback(
    async (ids: string[]): Promise<ResultadoEnvioPrefiltro> => {
      setEnviando(true);
      setResultado(null);
      setProgreso({ procesados: 0, total: ids.length });

      const exitosos: string[] = [];
      const fallidos: FalloPrefiltro[] = [];

      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i];
        try {
          await registrarDecision(
            clienteApi,
            id,
            { compuerta: 'RANKING', decision: 'APRUEBA' },
            { idempotencyKey: nuevaClaveIdempotencia() },
          );
          exitosos.push(id);
        } catch (problema: unknown) {
          const apiError =
            problema instanceof ApiError
              ? problema
              : new ApiError({ title: 'Error inesperado', status: 0 }, 'desconocido');
          fallidos.push({
            id,
            motivo: apiError.problem.title,
            correlationId: apiError.idCorrelacion,
          });
          // Fallo parcial: se registra sin datos personales y el lote continúa.
          console.warn(
            '[procesos] prefiltro fallido',
            id,
            apiError.idCorrelacion,
            apiError.problem.status,
          );
        }
        setProgreso({ procesados: i + 1, total: ids.length });
      }

      const consolidado: ResultadoEnvioPrefiltro = { exitosos, fallidos };
      setResultado(consolidado);
      setEnviando(false);
      return consolidado;
    },
    [clienteApi],
  );

  return { enviando, progreso, resultado, enviar, reiniciar };
}
