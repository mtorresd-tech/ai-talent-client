import type { SubestadoIntegracion } from '../../../shared/tipos/dominio';

/** Color de `Chip` de MUI para el subestado de una integración. */
export type ColorSubestado = 'default' | 'info' | 'success' | 'warning' | 'error';

interface DescriptorSubestado {
  etiqueta: string;
  color: ColorSubestado;
}

const DESCRIPTORES: Record<SubestadoIntegracion, DescriptorSubestado> = {
  SOLICITUD_PENDIENTE: { etiqueta: 'Solicitud pendiente', color: 'default' },
  SOLICITADA: { etiqueta: 'Solicitada', color: 'info' },
  EN_CURSO: { etiqueta: 'En curso', color: 'info' },
  RESULTADO_RECIBIDO: { etiqueta: 'Resultado recibido', color: 'success' },
  ERROR: { etiqueta: 'Con error', color: 'error' },
  REINTENTANDO: { etiqueta: 'Reintentando', color: 'warning' },
  EXPIRADA: { etiqueta: 'Expirada', color: 'warning' },
  CANCELADA: { etiqueta: 'Cancelada', color: 'default' },
};

/** Normaliza `SOLICITUD_PENDIENTE` → `Solicitud Pendiente` como respaldo. */
function aTitleCase(valor: string): string {
  return valor
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/** Etiqueta en español de un subestado, con respaldo en Title Case. */
export function etiquetaSubestado(subestado: string | null | undefined): string {
  if (!subestado) return 'Sin subestado';
  return DESCRIPTORES[subestado as SubestadoIntegracion]?.etiqueta ?? aTitleCase(subestado);
}

/** Color de chip de un subestado; `default` para cualquiera sin color asignado. */
export function colorSubestado(subestado: string | null | undefined): ColorSubestado {
  if (!subestado) return 'default';
  return DESCRIPTORES[subestado as SubestadoIntegracion]?.color ?? 'default';
}
