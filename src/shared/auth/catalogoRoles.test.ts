import { describe, expect, it } from 'vitest';
import { ROL_LIDER, ROL_RECLUTADOR } from '../tipos/dominio';
import { CATALOGO_ROLES_IA_TALENTO } from './catalogoRoles';

describe('CATALOGO_ROLES_IA_TALENTO', () => {
  it('mapea RECLUTADOR a "Reclutador"', () => {
    expect(CATALOGO_ROLES_IA_TALENTO.etiqueta(ROL_RECLUTADOR)).toBe('Reclutador');
  });

  it('mapea LIDER_VACANTE a "Líder de área"', () => {
    expect(CATALOGO_ROLES_IA_TALENTO.etiqueta(ROL_LIDER)).toBe('Líder de área');
  });

  it('devuelve el código tal cual si el rol no pertenece al catálogo', () => {
    expect(CATALOGO_ROLES_IA_TALENTO.etiqueta('ADMINISTRADOR')).toBe('ADMINISTRADOR');
  });

  it('filtra una lista de roles crudos al catálogo, descartando los desconocidos', () => {
    expect(CATALOGO_ROLES_IA_TALENTO.filtrar([ROL_RECLUTADOR, 'COLABORADOR'])).toEqual([
      ROL_RECLUTADOR,
    ]);
  });

  it('filtrar sin roles devuelve un arreglo vacío', () => {
    expect(CATALOGO_ROLES_IA_TALENTO.filtrar(undefined)).toEqual([]);
  });
});
