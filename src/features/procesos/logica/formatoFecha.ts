/**
 * Formateo de fechas para la vista de Procesos. El contrato entrega fechas
 * como cadenas ISO 8601 (o `null` cuando el dato no aplica todavía, p. ej. una
 * vacante abierta sin fecha de cierre). Se usa la configuración regional de
 * Colombia sin depender de librerías externas.
 */

const formateador = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Texto que se muestra cuando la fecha no está definida. */
export const SIN_FECHA = 'Sin definir';

/**
 * Convierte una fecha ISO en texto legible `es-CO`. Devuelve `SIN_FECHA` para
 * `null`/`undefined`/cadena vacía y para valores que no son fechas válidas.
 */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return SIN_FECHA;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return SIN_FECHA;
  return formateador.format(fecha);
}
