/**
 * Redirección a SAP SuccessFactors, donde se diligencia el resultado real del
 * prefiltro telefónico (cumple perfil, interés, aspiración salarial, …).
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
