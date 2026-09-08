import { describe, expect, it } from 'vitest';
import { estiloTablaListaRankingCandidatos } from './estiloTablaListaRankingCandidatos';

describe('estiloTablaListaRankingCandidatos', () => {
  it('en variante Selecta acerca el checkbox al avatar (primeras dos columnas)', () => {
    const estilo = estiloTablaListaRankingCandidatos(true) as Record<string, unknown>;
    expect(estilo).toHaveProperty('& td:first-of-type, & th:first-of-type');
    expect(estilo).toHaveProperty('& td:nth-of-type(2), & th:nth-of-type(2)');
  });

  it('en variante simple no incluye los overrides de la columna de selección', () => {
    const estilo = estiloTablaListaRankingCandidatos(false) as Record<string, unknown>;
    expect(estilo).not.toHaveProperty('& td:first-of-type, & th:first-of-type');
    expect(estilo).not.toHaveProperty('& td:nth-of-type(2), & th:nth-of-type(2)');
  });

  it('en ambas variantes mantiene el layout fijo y la paginación compacta', () => {
    for (const esSelecta of [true, false]) {
      const estilo = estiloTablaListaRankingCandidatos(esSelecta) as Record<string, unknown>;
      expect(estilo).toHaveProperty('& .MuiTable-root', { tableLayout: 'fixed', width: '100%' });
      expect(estilo).toHaveProperty('& .MuiTablePagination-toolbar');
    }
  });
});
