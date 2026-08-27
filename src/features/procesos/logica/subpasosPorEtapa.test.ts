import { describe, expect, it } from 'vitest';
import { CLAVE_ETAPA_RANKING } from './mapaEstadosPorEtapa';
import { subpasosDeEtapa } from './subpasosPorEtapa';

describe('subpasosDeEtapa', () => {
  it('la etapa de ranking incluye "Lista de filtrados" como no operativo', () => {
    const subpasos = subpasosDeEtapa(CLAVE_ETAPA_RANKING);
    const listaFiltrados = subpasos.find((paso) => paso.clave === 'LISTA_FILTRADOS');
    expect(listaFiltrados).toBeDefined();
    expect(listaFiltrados?.operativo).toBe(false);
  });

  it('la etapa de ranking tiene "Ranking" como sub-paso operativo', () => {
    const subpasos = subpasosDeEtapa(CLAVE_ETAPA_RANKING);
    expect(subpasos[0]).toMatchObject({ clave: 'RANKING', operativo: true });
  });

  it('devuelve [] para cualquier otra etapa', () => {
    expect(subpasosDeEtapa('BLUESITE')).toEqual([]);
    expect(subpasosDeEtapa(null)).toEqual([]);
  });
});
