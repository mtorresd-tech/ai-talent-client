import type { GebApiClient } from '@geb/api-client';
import type { Compuerta, PoliticaCompuerta } from '../../../shared/tipos/dominio';

export interface ReglaDecision {
  tipo: 'SCORE_MINIMO' | 'NIVEL_RIESGO_MAXIMO' | 'CONCEPTO_APTITUD' | 'EXPRESION';
  zonaGris?: string[] | null;
  scoreMinimo?: number | null;
  nivelRiesgoMaximo?: 'Alto' | 'Medio' | 'Bajo' | null;
  conceptosAptos?: string[] | null;
  expresion?: string | null;
  descripcion?: string | null;
}

export interface PoliticaCompuertaResumen {
  compuerta: Compuerta;
  politica: PoliticaCompuerta;
  regla: ReglaDecision | null;
  actualizadaEn: string | null;
  actualizadaPor: string | null;
}

export function listarPoliticas(clienteApi: GebApiClient) {
  return clienteApi.get<PoliticaCompuertaResumen[]>('/politicas');
}

/** Requiere rol administrador. Cambiar a AUTOMATICA exige `regla` definida (422 si falta). */
export function actualizarPolitica(
  clienteApi: GebApiClient,
  compuerta: Compuerta,
  politica: PoliticaCompuerta,
  regla?: ReglaDecision,
) {
  return clienteApi.put<PoliticaCompuertaResumen>(`/politicas/${compuerta}`, { politica, regla });
}
