import { describe, expect, it } from 'vitest';
import type { SubestadoIntegracion } from '../../../shared/tipos/dominio';
import { colorSubestado, etiquetaSubestado } from './etiquetasSubestado';

const SUBESTADOS: SubestadoIntegracion[] = [
  'SOLICITUD_PENDIENTE',
  'SOLICITADA',
  'EN_CURSO',
  'RESULTADO_RECIBIDO',
  'ERROR',
  'REINTENTANDO',
  'EXPIRADA',
  'CANCELADA',
];

describe('etiquetasSubestado', () => {
  it('define etiqueta en español y color para los 8 subestados', () => {
    for (const subestado of SUBESTADOS) {
      expect(etiquetaSubestado(subestado)).not.toMatch(/_/);
      expect(etiquetaSubestado(subestado).length).toBeGreaterThan(0);
      expect(['default', 'info', 'success', 'warning', 'error']).toContain(
        colorSubestado(subestado),
      );
    }
  });

  it('degrada a Title Case / default para un subestado desconocido o nulo', () => {
    expect(etiquetaSubestado('OTRO_VALOR')).toBe('Otro Valor');
    expect(etiquetaSubestado(null)).toBe('Sin subestado');
    expect(colorSubestado(null)).toBe('default');
  });

  it('asigna colores coherentes a los subestados clave', () => {
    expect(colorSubestado('RESULTADO_RECIBIDO')).toBe('success');
    expect(colorSubestado('ERROR')).toBe('error');
  });
});
