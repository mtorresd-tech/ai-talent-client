import { describe, expect, it } from 'vitest';
import { paramsSerializerEstado } from './serializacion';

describe('paramsSerializerEstado', () => {
  it('une los arrays con coma (form, sin explode)', () => {
    expect(paramsSerializerEstado({ estado: ['RANKING_SELECTA', 'PREFILTRO_PENDIENTE'] })).toBe(
      'estado=RANKING_SELECTA,PREFILTRO_PENDIENTE',
    );
  });

  it('no serializa el array como estado[]=A&estado[]=B', () => {
    const query = paramsSerializerEstado({ estado: ['A', 'B'] });
    expect(query).toBe('estado=A,B');
    expect(query).not.toContain('estado[]');
  });

  it('mantiene los escalares y omite null/undefined', () => {
    expect(paramsSerializerEstado({ page: 1, pageSize: 20, q: undefined, estado: null })).toBe(
      'page=1&pageSize=20',
    );
  });

  it('omite los arrays vacíos', () => {
    expect(paramsSerializerEstado({ estado: [], page: 2 })).toBe('page=2');
  });
});
