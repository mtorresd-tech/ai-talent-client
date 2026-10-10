import type {
  DecisionMatriz,
  FilaMatriz,
  MatrizSeleccion,
  ObjecionMatriz,
  SeleccionMatriz,
} from '../features/procesos/api/matriz';

/** Fila de la matriz completa por defecto; `overrides.resultado` se mezcla con el resultado base. */
export function filaMatriz(
  overrides: Partial<Omit<FilaMatriz, 'resultado'>> & {
    resultado?: Partial<FilaMatriz['resultado']>;
  } = {},
): FilaMatriz {
  const { resultado, ...resto } = overrides;
  return {
    jobApplicationId: 'APP-1',
    alias: 'Candidato 1',
    nombre: 'Ana Pérez',
    tipoCandidato: 'EXTERNO',
    calificacion: {
      competencias: {
        TRABAJO_COLABORATIVO: 80,
        MOVILIZADOR_DE_CAMBIO: 85,
        INNOVACION_Y_PENSAMIENTO_DIGITAL: 78,
        PASION_POR_EL_LOGRO: 90,
        DESARROLLO_PROPIO_Y_DE_OTROS: 82,
      },
      pruebaTecnica: null,
      talentoHumano: 85,
      entrevistasJefe: [88, 92],
      desempenoUltimoAnio: null,
      tiempoVinculacion: null,
    },
    ...resto,
    resultado: {
      medianaCompetencias: 82,
      resultadoCompetencias: 24.6,
      resultadoPruebaTecnica: 0,
      resultadoTalentoHumano: 25.5,
      conceptoArea: 90,
      resultadoConceptoArea: 36,
      bonoDesempeno: 0,
      bonoVinculacion: 0,
      total: 86.1,
      completa: true,
      ...resultado,
    },
  };
}

/** Fila incompleta (sin total). */
export function filaIncompleta(overrides: Partial<FilaMatriz> = {}): FilaMatriz {
  return filaMatriz({
    jobApplicationId: 'APP-9',
    alias: 'Candidato 9',
    nombre: 'Iván Ríos',
    ...overrides,
    resultado: { total: null, completa: false, medianaCompetencias: null },
  });
}

export function seleccionMatriz(overrides: Partial<SeleccionMatriz> = {}): SeleccionMatriz {
  return {
    jobApplicationId: 'APP-1',
    puntajeFinal: 86.1,
    fortalezas: 'Alta orientación a resultados.',
    oportunidadesDesarrollo: null,
    criterioDesempate: null,
    equivalenciasAplicadas: null,
    observaciones: null,
    seleccionadaPor: { tipo: 'HUMANO', upn: 'reclutador@geb.com.co', rol: 'RECLUTADOR' },
    seleccionadaEn: '2026-11-10T15:00:00Z',
    ...overrides,
  };
}

export function decisionMatriz(overrides: Partial<DecisionMatriz> = {}): DecisionMatriz {
  return {
    avala: false,
    motivo: 'El concepto del área no alcanza para el cargo.',
    decididaPor: { tipo: 'HUMANO', upn: 'lider@geb.com.co', rol: 'LIDER' },
    decididaEn: '2026-11-11T09:00:00Z',
    ...overrides,
  };
}

export function objecionMatriz(overrides: Partial<ObjecionMatriz> = {}): ObjecionMatriz {
  return {
    jobApplicationId: 'APP-3',
    motivo: 'Le falta experiencia en el sector.',
    decididaPor: { tipo: 'HUMANO', upn: 'lider@geb.com.co', rol: 'LIDER' },
    decididaEn: '2026-11-05T09:00:00Z',
    ...overrides,
  };
}

/** Matriz abierta, sin candidatos por defecto. */
export function matrizSeleccion(overrides: Partial<MatrizSeleccion> = {}): MatrizSeleccion {
  return {
    jobRequisitionId: 'REQ-1',
    configuracion: { requierePruebaTecnica: false, entrevistasArea: 2 },
    pesos: { competencias: 0.3, pruebaTecnica: 0, talentoHumano: 0.3, conceptoArea: 0.4 },
    candidatos: [],
    seleccion: null,
    decisionLider: null,
    plazoDecisionHasta: null,
    objeciones: [],
    ...overrides,
  };
}

/** Matriz de un cargo que requiere una sola entrevista del área. */
export function matrizUnaEntrevista(overrides: Partial<MatrizSeleccion> = {}): MatrizSeleccion {
  const base = filaMatriz();
  return matrizSeleccion({
    configuracion: { requierePruebaTecnica: false, entrevistasArea: 1 },
    candidatos: [{ ...base, calificacion: { ...base.calificacion, entrevistasJefe: [88] } }],
    ...overrides,
  });
}

/** Matriz cuya configuración pide prueba técnica o assessment center. */
export function matrizConPruebaTecnica(overrides: Partial<MatrizSeleccion> = {}): MatrizSeleccion {
  return matrizSeleccion({
    configuracion: { requierePruebaTecnica: true, entrevistasArea: 2 },
    candidatos: [filaMatriz({ calificacion: { ...filaMatriz().calificacion, pruebaTecnica: 70 } })],
    ...overrides,
  });
}
