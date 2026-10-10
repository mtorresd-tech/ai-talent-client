import type { FilaMatriz } from '../api/matriz';

/**
 * `true` si el candidato `jobApplicationId` empata en `total` con otro
 * candidato con calificación completa. El backend es la fuente final de
 * verdad (devuelve 422 si falta `criterioDesempate` habiendo empate real);
 * esta función lo detecta antes de enviar, para pedir el campo en el
 * formulario sin esperar al error del servidor.
 */
export function hayEmpateDeTotal(
  candidatos: readonly FilaMatriz[],
  jobApplicationId: string,
): boolean {
  const elegido = candidatos.find((candidato) => candidato.jobApplicationId === jobApplicationId);
  if (!elegido || !elegido.resultado.completa || elegido.resultado.total === null) return false;

  return candidatos.some(
    (candidato) =>
      candidato.jobApplicationId !== jobApplicationId &&
      candidato.resultado.completa &&
      candidato.resultado.total === elegido.resultado.total,
  );
}
