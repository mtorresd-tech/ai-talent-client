export interface ResultadoCosinte {
  tipo: 'COSINTE';
  estado: 'Solicitado' | 'En proceso' | 'Finalizado';
  nivelRiesgo: 'Alto' | 'Medio' | 'Bajo' | null;
  fechaSolicitud: string | null;
  tiempos: { diasHabiles: number; diasRestantes: number; progreso: number } | null;
}
