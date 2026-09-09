import type { Proveedor } from '../../../shared/tipos/dominio';

const NOMBRE_PROVEEDOR: Record<Proveedor, string> = {
  BLUESITE: 'Bluesite',
  COSINTE: 'Cosinte',
  MEDILABORAL: 'Medilaboral',
};

/** Nombre visible de un proveedor externo; si no se reconoce, devuelve el propio valor. */
export function nombreProveedor(proveedor: Proveedor | string): string {
  return NOMBRE_PROVEEDOR[proveedor as Proveedor] ?? proveedor;
}
