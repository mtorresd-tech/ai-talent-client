/**
 * Pipeline del portal del reclutador: el rail de dos niveles con el que se
 * navega el proceso de selección.
 *
 *   - `FASES_SAP`: las fases de referencia del proceso en SuccessFactors. Algunas
 *     no tienen soporte en IA Talento (`pasos: []`) y solo muestran una nota.
 *   - `PASOS_PIPELINE`: los pasos internos de IA Talento, anidados dentro de la
 *     fase SAP que les corresponde. Son los navegables.
 *
 * Qué estados carga cada paso lo resuelve `ESTADOS_POR_ETAPA`
 * (`mapaEstadosPorEtapa.ts`), no este módulo.
 */

export interface PasoPipeline {
  clave: string;
  nombre: string;
}

export interface FaseSap {
  clave: string;
  nombre: string;
  /** Claves de `PASOS_PIPELINE` anidadas en esta fase. Vacío = fase sin soporte en IA Talento. */
  pasos: string[];
  /** Nota que se muestra en las fases sin pasos (fuera de IA Talento, portal del líder, …). */
  nota?: string;
  /** `true` si la fase ocurre fuera de la plataforma (se pinta con borde punteado). */
  externa?: boolean;
}

/** Pasos internos de IA Talento, en orden. `CLAVE_PASO_SELECTA` es el primero. */
export const PASOS_PIPELINE: readonly PasoPipeline[] = [
  { clave: 'SELECTA', nombre: 'Selecta' },
  { clave: 'LISTA_FILTRADOS', nombre: 'Listado de filtrados' },
  { clave: 'ANONIMIZACION', nombre: 'Anonimización' },
  { clave: 'BLUESITE', nombre: 'Bluesite' },
  { clave: 'COSINTE', nombre: 'Cosinte' },
  { clave: 'MEDILABORAL', nombre: 'Medilaboral' },
  { clave: 'OFERTA', nombre: 'Oferta' },
];

/** Paso activo por defecto al abrir una vacante. */
export const PASO_INICIAL = PASOS_PIPELINE[0].clave;

/** Fases de referencia de SuccessFactors, con los pasos internos anidados. */
export const FASES_SAP: readonly FaseSap[] = [
  { clave: 'POSTULANTES', nombre: 'Postulantes', pasos: ['SELECTA'] },
  {
    clave: 'PREFILTRO_TELEFONICO',
    nombre: 'Prefiltro telefónico',
    pasos: ['LISTA_FILTRADOS', 'ANONIMIZACION'],
  },
  { clave: 'PSICOTECNICAS', nombre: 'Pruebas psicotécnicas', pasos: ['BLUESITE'] },
  {
    clave: 'PRUEBA_TECNICA',
    nombre: 'Prueba técnica o assessment',
    pasos: [],
    nota: 'Fuera de IA Talento',
    externa: true,
  },
  {
    clave: 'ENTREVISTA_COMPETENCIAS',
    nombre: 'Entrevista por competencias',
    pasos: [],
    nota: 'Fuera de IA Talento',
    externa: true,
  },
  {
    clave: 'ENTREVISTA_JEFE',
    nombre: 'Entrevista jefe inmediato',
    pasos: [],
    nota: 'Portal del líder · formulario',
  },
  {
    clave: 'SEGUNDA_ENTREVISTA',
    nombre: 'Segunda entrevista del área',
    pasos: [],
    nota: 'Portal del líder · formulario',
  },
  {
    clave: 'MATRIZ_SELECCION',
    nombre: 'Matriz de selección',
    pasos: [],
    nota: 'IA Talento ordena y envía a los mejores',
  },
  {
    clave: 'SEGURIDAD_MEDICO',
    nombre: 'Estudio de seguridad y examen médico',
    pasos: ['COSINTE', 'MEDILABORAL'],
  },
  { clave: 'OFERTA', nombre: 'Oferta', pasos: ['OFERTA'] },
];

/** Nombre visible de un paso interno a partir de su clave. */
export function nombrePaso(clave: string | null | undefined): string | null {
  return PASOS_PIPELINE.find((paso) => paso.clave === clave)?.nombre ?? null;
}
