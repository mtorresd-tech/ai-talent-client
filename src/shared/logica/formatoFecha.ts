/**
 * Formateo de fechas compartido (`es-CO`, `Intl`, sin librerías). Las fechas
 * de estos contratos llegan como cadenas ISO 8601 o `null`.
 */
const formateadorFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formateadorHora = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Texto que se muestra cuando la fecha no está definida. */
export const SIN_FECHA = 'Sin definir';

/** Convierte una fecha ISO en texto `es-CO` con fecha y hora, o `SIN_FECHA`. */
export function formatearFechaHora(valor: string | null | undefined): string {
  if (!valor) return SIN_FECHA;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return SIN_FECHA;
  return `${formateadorFecha.format(fecha)} · ${formateadorHora.format(fecha)}`;
}
