export interface ResultadoMedilaboral {
  tipo: 'MEDILABORAL';
  idOrdenServicio: string;
  fechaCita: string | null;
  sede: string | null;
  modalidad: 'CITA_PREVIA' | 'ORDEN_DE_LLEGADA' | 'PROGRAMAR_CON_SERVICIO_CLIENTE' | null;
}
