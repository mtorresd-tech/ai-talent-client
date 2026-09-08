import type { Proveedor } from '../../../shared/tipos/dominio';
import type { SeguimientoIntegracion } from '../../integraciones';

/** Valor del cruce por candidato para el badge "Requiere atención" de la lista. */
export interface AtencionCandidato {
  requiereAtencion: boolean;
  diasTranscurridos: number;
}

/**
 * Cruza la respuesta de `GET /vacantes/{id}/integraciones?proveedor=...` por
 * `jobApplicationId`, quedándose con la integración del proveedor pedido de
 * cada candidato. Se arma un `Map` en vez de fusionar dos arreglos porque este
 * dato solo enriquece filas que ya existen en la lista por su estado (no
 * decide quién aparece) y solo aplica al paso activo: fusionarlo en
 * `CandidatoResumen` obligaría a cargar ese campo también en los demás pasos
 * del pipeline, que nunca lo usan. Con `integraciones: null` (la petición no
 * resolvió o falló) devuelve un `Map` vacío, sin lanzar.
 */
export function mapaAtencionProveedor(
  integraciones: SeguimientoIntegracion[] | null,
  proveedor: Proveedor,
): Map<string, AtencionCandidato> {
  const mapa = new Map<string, AtencionCandidato>();
  if (!integraciones) return mapa;

  for (const candidato of integraciones) {
    const integracionProveedor = candidato.integraciones.find((i) => i.proveedor === proveedor);
    if (!integracionProveedor) continue;
    mapa.set(candidato.jobApplicationId, {
      requiereAtencion: integracionProveedor.requiereAtencion,
      diasTranscurridos: integracionProveedor.diasTranscurridos,
    });
  }

  return mapa;
}
