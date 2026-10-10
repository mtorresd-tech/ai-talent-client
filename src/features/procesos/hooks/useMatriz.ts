import { useCallback, useState } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerMatriz, type MatrizSeleccion } from '../api/matriz';
import { usePeticion, type EstadoPeticion } from './usePeticion';

export interface EstadoMatriz extends EstadoPeticion<MatrizSeleccion> {
  /** Muestra la matriz devuelta por una mutación sin volver a pedirla. */
  reemplazar: (matriz: MatrizSeleccion) => void;
}

interface Reemplazo {
  /** Datos de la petición sobre los que se aplicó el reemplazo. */
  base: MatrizSeleccion | null;
  matriz: MatrizSeleccion;
}

/**
 * Matriz de selección de la vacante activa (`GET /vacantes/{id}/matriz`).
 * Deshabilitado mientras no haya vacante activa. Un reemplazo deja de
 * aplicarse en cuanto llega una respuesta nueva del backend (recarga o
 * cambio de vacante).
 */
export function useMatriz(clienteApi: GebApiClient, jobRequisitionId: string | null): EstadoMatriz {
  const ejecutor = useCallback(
    (signal: AbortSignal) => obtenerMatriz(clienteApi, jobRequisitionId as string, { signal }),
    [clienteApi, jobRequisitionId],
  );

  const peticion = usePeticion(ejecutor, [ejecutor], jobRequisitionId !== null);
  const [reemplazo, setReemplazo] = useState<Reemplazo | null>(null);

  const datosPeticion = peticion.datos;
  const reemplazar = useCallback(
    (matriz: MatrizSeleccion) => setReemplazo({ base: datosPeticion, matriz }),
    [datosPeticion],
  );

  const reemplazoVigente =
    reemplazo !== null &&
    reemplazo.base === datosPeticion &&
    reemplazo.matriz.jobRequisitionId === jobRequisitionId;

  return {
    ...peticion,
    datos: reemplazoVigente ? reemplazo.matriz : datosPeticion,
    reemplazar,
  };
}
