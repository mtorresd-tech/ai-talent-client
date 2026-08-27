export interface PruebaBluesite {
  tipoPrueba: string;
  respondida: boolean;
  fechaEnvio: string | null;
  fechaRespuesta: string | null;
  competencias: { nombre: string; puntaje: number }[];
}

export interface ResultadoBluesite {
  tipo: 'BLUESITE';
  pruebas: PruebaBluesite[];
}
