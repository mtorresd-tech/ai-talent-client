import { describe, expect, it } from 'vitest';
import type { InformeIncognito } from './bandejas';
import type { DesgloseAfinidad } from './candidatos';

/**
 * El tipo `InformeIncognito` quedó alineado al contrato: `estudios` y
 * `desgloseAfinidad` presentes, `experiencia`/`estudios` como objetos abiertos
 * y los campos con `default: []` opcionales. `DesgloseAfinidad` se importa de
 * `api/candidatos.ts`, no se redefine.
 */
describe('InformeIncognito (tipo alineado al contrato)', () => {
  it('acepta el informe completo del endpoint de lista', () => {
    const desglose: DesgloseAfinidad = {
      porcentajeTotal: 77.7,
      porcentajeFortalezas: 47.3,
      porcentajeExperiencia: 89.1,
      porcentajeEstudios: 92.9,
      fortalezas: ['Inglés B2'],
      debilidades: ['Disponibilidad'],
      comentarios: 'Cumple parcialmente.',
    };

    const informe: InformeIncognito = {
      alias: 'Candidato 100',
      generadoEn: '2026-08-14T00:00:00Z',
      aniosExperienciaTotal: 6.9,
      nivelAcademicoMaximo: 'Especialización',
      experiencia: [{ cargo: 'Analista', empresa: 'GEB' }],
      estudios: [{ titulo: 'Ingeniería' }],
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
