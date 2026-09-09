import { describe, expect, it } from 'vitest';
import { nombreProveedor } from './nombreProveedor';

describe('nombreProveedor', () => {
  it('resuelve el nombre visible de los tres proveedores', () => {
    expect(nombreProveedor('BLUESITE')).toBe('Bluesite');
    expect(nombreProveedor('COSINTE')).toBe('Cosinte');
    expect(nombreProveedor('MEDILABORAL')).toBe('Medilaboral');
  });

  it('un valor no reconocido cae al propio string, sin romper', () => {
    expect(nombreProveedor('OTRO')).toBe('OTRO');
  });
});
