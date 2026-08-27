import { etiquetaEstado } from './etiquetasEstado';

/**
 * La tabla de vacantes muestra una columna de "resumen de etapa" derivada de
 * `VacanteResumen.conteoPorEstado` (`Record<estado, número>`). Se toman los uno
 * o dos estados con mayor conteo y se traducen a su etiqueta en español, p. ej.
 * "En ranking (12) · Prefiltro pendiente (3)".
 */
export function resumenEtapaVacante(
  conteoPorEstado: Record<string, number> | null | undefined,
): string {
  if (!conteoPorEstado) return '—';
  const entradas = Object.entries(conteoPorEstado)
    .filter(([, cantidad]) => cantidad > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  if (entradas.length === 0) return '—';

  return entradas
    .map(([estado, cantidad]) => `${etiquetaEstado(estado)} (${cantidad})`)
    .join(' · ');
}

/** Etiqueta de estado de la vacante en la tabla. */
export function etiquetaEstadoVacante(cerrada: boolean): string {
  return cerrada ? 'Cerrada' : 'En proceso';
}
