import { SIN_FECHA } from './formatoFecha';

/** Texto que se muestra cuando `fechaFin` es `null`: el candidato sigue en ese cargo. */
export const CARGO_ACTUAL = 'Actualidad';

const formateadorMesAnio = new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' });

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function formatearMesAnio(valor: string | null): string | null {
  if (!valor) return null;
  // Una fecha sin hora (`YYYY-MM-DD`) se interpreta en hora local, no UTC:
  // de lo contrario, en zonas horarias con offset negativo el mes mostrado
  // retrocede un día respecto a la fecha real del contrato.
  const fecha = new Date(SOLO_FECHA.test(valor) ? `${valor}T00:00:00` : valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return formateadorMesAnio.format(fecha);
}

/**
 * Formatea el rango de fechas de una experiencia laboral en texto legible
 * `es-CO` (p. ej. `"Desde ene. 2022 · Actualidad"`). `fechaFin: null` se
 * muestra como `"Actualidad"` — es el cargo actual del candidato.
 */
export function formatearRangoExperiencia(
  fechaInicio: string | null,
  fechaFin: string | null,
): string {
  const inicio = formatearMesAnio(fechaInicio) ?? SIN_FECHA;
  const fin = fechaFin === null ? CARGO_ACTUAL : (formatearMesAnio(fechaFin) ?? SIN_FECHA);
  return `Desde ${inicio} · ${fin}`;
}
