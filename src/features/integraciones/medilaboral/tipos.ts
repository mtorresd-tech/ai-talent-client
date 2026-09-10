/** Concepto de aptitud emitido por Medilaboral al cierre de los exámenes médicos. */
export type ConceptoAptitud = 'APTO' | 'APTO_CON_OBSERVACIONES' | 'NO_APTO';

export interface ResultadoMedilaboral {
  tipo: 'MEDILABORAL';
  idOrdenServicio: string;
  fechaCita: string | null;
  sede: string | null;
  modalidad: 'CITA_PREVIA' | 'ORDEN_DE_LLEGADA' | 'PROGRAMAR_CON_SERVICIO_CLIENTE' | null;
  conceptoAptitud: ConceptoAptitud | null;
  observaciones: string | null;
  fechaConcepto: string | null;
}
