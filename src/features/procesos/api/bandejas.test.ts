import { describe, expect, it } from 'vitest';
import type { InformeIncognito } from './bandejas';
import type { DesgloseAfinidad } from './candidatos';

/**
 * El tipo `InformeIncognito` quedó alineado al contrato: `estudios` y
 * `desgloseAfinidad` presentes, `experiencia`/`estudios` tipados según el
 * contrato y los campos con `default: []` opcionales. `DesgloseAfinidad` se
 * importa de `api/candidatos.ts`, no se redefine.
 */
describe('InformeIncognito (tipo alineado al contrato)', () => {
  it('acepta el informe completo del endpoint de lista', () => {
    const desglose: DesgloseAfinidad = {
      porcentajeTotal: 77.7,
      versionRubrica: '1.0',
      elegible: true,
      motivosNoElegible: [],
      componentes: [
        { componente: 'EXPERIENCIA', peso: 0.25, obtenido: 0.89, aporte: 22.25, brecha: 2.75 },
      ],
      calidad: { confianza: 0.8, requiereRevision: false, provisional: false, alertas: [] },
      aniosTotales: null,
      aniosRelevantes: null,
      sectorPredominante: null,
      comentarios: 'Cumple parcialmente.',
    };

    const informe: InformeIncognito = {
      alias: 'Candidato 100',
      generadoEn: '2026-08-14T00:00:00Z',
      aniosExperienciaTotal: 6.9,
      nivelAcademicoMaximo: 'Especialización',
      experiencia: [
        {
          cargo: 'Analista',
          compania: 'Grupo Energía Bogotá',
          funciones: 'Soporte a datos',
          fechaInicio: '2022-01-01',
          fechaFin: null,
        },
      ],
      estudios: [
        {
          nivelAcademico: 'Titulado',
          nombreEstudio: 'Ingeniero de Sistemas',
          institucion: 'Universidad Nacional',
        },
      ],
      competencias: ['SQL', 'Python'],
      desgloseAfinidad: desglose,
    };

    expect(informe.desgloseAfinidad).toBe(desglose);
    expect(informe.estudios).toHaveLength(1);
  });

  it('acepta el informe mínimo, con los campos de `default: []` ausentes', () => {
    const informe: InformeIncognito = {
      alias: 'Candidato 7',
      generadoEn: '2026-08-14T00:00:00Z',
      aniosExperienciaTotal: null,
      nivelAcademicoMaximo: null,
      desgloseAfinidad: null,
    };

    expect(informe.experiencia).toBeUndefined();
    expect(informe.estudios).toBeUndefined();
    expect(informe.competencias).toBeUndefined();
  });
});
