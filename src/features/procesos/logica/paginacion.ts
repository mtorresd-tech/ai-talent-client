/**
 * Conversión de índice de página entre los dos sistemas que conviven en la
 * vista de Procesos:
 *
 * - `GebDataTable` (y `TablePagination` de MUI) usa páginas **base 0**.
 * - El contrato del backend usa el parámetro `page` **base 1** (`minimum: 1`).
 *
 * Cada adaptador de tabla convierte en ambos sentidos con estas funciones para
 * no dispersar el `+1`/`-1` por el código.
 */

/** Página de tabla (base 0) → página de servidor (base 1). */
export function aPaginaServidor(paginaBase0: number): number {
  return Math.max(0, Math.trunc(paginaBase0)) + 1;
}

/** Página de servidor (base 1) → página de tabla (base 0). */
export function aPaginaTabla(paginaBase1: number): number {
  return Math.max(1, Math.trunc(paginaBase1)) - 1;
}
