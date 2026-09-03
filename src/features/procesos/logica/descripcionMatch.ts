/**
 * Texto de apoyo para el porcentaje de afinidad (match) generado por IA.
 * Los umbrales (95 / 90 / 85) replican los del panel de resultado, con
 * redacción en español neutro.
 */
export function descripcionMatch(porcentaje: number | null): string {
  if (porcentaje === null || Number.isNaN(porcentaje)) {
    return 'Este candidato todavía no tiene un porcentaje de afinidad calculado.';
  }
  if (porcentaje >= 95) {
    return 'Afinidad muy alta: el perfil calza casi por completo con los requisitos de la vacante.';
  }
  if (porcentaje >= 90) {
    return 'Afinidad alta: el perfil cubre la mayoría de los requisitos de la vacante.';
  }
  if (porcentaje >= 85) {
    return 'Afinidad aceptable: el perfil cumple con los requisitos clave, con algunas brechas.';
  }
  return 'Afinidad baja: el perfil presenta brechas relevantes frente a los requisitos de la vacante.';
}
