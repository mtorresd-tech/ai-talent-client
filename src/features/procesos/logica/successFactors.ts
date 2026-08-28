/**
 * Redirección a SAP SuccessFactors para diligenciar el prefiltro telefónico:
 * el modal de prefiltro solo aprueba la compuerta `RANKING`, y el resultado
 * real de la llamada (cumple perfil, interés, aspiración salarial, …) se
 * registra en SuccessFactors, así que al confirmar se abre SuccessFactors en
 * otra pestaña.
 *
 * La URL se configura por entorno (`VITE_URL_SUCCESSFACTORS`). Si no está
 * definida, no se abre nada.
 */
export const URL_SUCCESSFACTORS: string = import.meta.env.VITE_URL_SUCCESSFACTORS?.trim() ?? '';

/** Abre SuccessFactors en otra pestaña si hay URL configurada. */
export function abrirSuccessFactors(): void {
  if (!URL_SUCCESSFACTORS) return;
  window.open(URL_SUCCESSFACTORS, '_blank', 'noopener,noreferrer');
}
