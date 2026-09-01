import type { CandidatoResumen } from '../api/candidatos';

/** Iniciales a partir de la primera y última palabra del nombre. */
export function calcularIniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '?';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
}

/** Nombre visible del candidato (la vista del reclutador no es anonimizada). */
export function nombreCandidato(candidato: Pick<CandidatoResumen, 'nombre' | 'alias'>): string {
  return candidato.nombre ?? candidato.alias;
}

/** Un candidato solo es seleccionable para prefiltro si tiene pendiente la compuerta RANKING. */
export function esSeleccionablePrefiltro(
  candidato: Pick<CandidatoResumen, 'esperandoDecision' | 'compuertaPendiente'>,
): boolean {
  return candidato.esperandoDecision && candidato.compuertaPendiente === 'RANKING';
}
