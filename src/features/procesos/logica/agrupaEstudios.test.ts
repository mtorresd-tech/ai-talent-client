import { describe, expect, it } from 'vitest';
import type { EstudioInforme } from '../api/bandejas';
import { agrupaEstudios, grupoDeNivelAcademico } from './agrupaEstudios';

describe('grupoDeNivelAcademico', () => {
  it("clasifica 'Especializacion' con nombreEstudio de gerencia como POSTGRADO", () => {
    expect(
      grupoDeNivelAcademico('Especializacion', 'Especializacion en gerencia de proyectos'),
    ).toBe('POSTGRADO');
  });

  it("clasifica 'Otros' con nombreEstudio de diplomado como DIPLOMADO (match vía nombreEstudio)", () => {
    expect(grupoDeNivelAcademico('Otros', 'Diplomado en gerencia de proyectos')).toBe('DIPLOMADO');
  });

  it("clasifica 'Otros' con nombreEstudio 'Certificación PMP' como DIPLOMADO (palabra clave certificac)", () => {
    expect(grupoDeNivelAcademico('Otros', 'Certificación PMP')).toBe('DIPLOMADO');
  });

  it("clasifica 'Titulado' con nombreEstudio 'Ingeniero de Sistemas' como PREGRADO (grupo por defecto)", () => {
    expect(grupoDeNivelAcademico('Titulado', 'Ingeniero de Sistemas')).toBe('PREGRADO');
  });

  it('detecta las palabras clave aunque tengan tilde', () => {
    expect(grupoDeNivelAcademico('Especializacion', 'Maestría en Finanzas')).toBe('POSTGRADO');
    expect(grupoDeNivelAcademico('Otros', 'Doctorado en Economía')).toBe('POSTGRADO');
  });

  it('con nombreEstudio nulo clasifica solo a partir de nivelAcademico', () => {
    expect(grupoDeNivelAcademico('Especializacion', null)).toBe('POSTGRADO');
    expect(grupoDeNivelAcademico('Titulado', null)).toBe('PREGRADO');
  });
});

describe('agrupaEstudios', () => {
  it('agrupa estudios en los tres subgrupos y conserva el dato real de cada item', () => {
    const estudios: EstudioInforme[] = [
      { nivelAcademico: 'Titulado', nombreEstudio: 'Ingeniero de Sistemas', institucion: null },
      {
        nivelAcademico: 'Especializacion',
        nombreEstudio: 'Especializacion en gerencia de proyectos',
        institucion: null,
      },
      {
        nivelAcademico: 'Otros',
        nombreEstudio: 'Diplomado en gerencia de proyectos',
        institucion: null,
      },
    ];

    const grupos = agrupaEstudios(estudios);

    expect(grupos.map((g) => g.grupo)).toEqual(['PREGRADO', 'POSTGRADO', 'DIPLOMADO']);
    expect(grupos[0].titulo).toBe('Profesión / pregrado');
    expect(grupos[0].estudios).toEqual([estudios[0]]);
    expect(grupos[1].titulo).toBe('Postgrados');
    expect(grupos[1].estudios).toEqual([estudios[1]]);
    expect(grupos[2].titulo).toBe('Diplomados');
    expect(grupos[2].estudios).toEqual([estudios[2]]);
  });

  it('omite los grupos sin estudios', () => {
    const estudios: EstudioInforme[] = [
      { nivelAcademico: 'Titulado', nombreEstudio: 'Abogado', institucion: 'Universidad Libre' },
    ];

    const grupos = agrupaEstudios(estudios);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].grupo).toBe('PREGRADO');
  });

  it('con un arreglo vacío devuelve una lista de grupos vacía', () => {
    expect(agrupaEstudios([])).toEqual([]);
  });
});
