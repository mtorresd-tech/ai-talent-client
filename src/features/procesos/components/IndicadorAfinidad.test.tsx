import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IndicadorAfinidad } from './IndicadorAfinidad';
import { colorAfinidad } from '../logica/afinidad';

describe('colorAfinidad', () => {
  it('el matiz sube con el score (rojo → verde) y acota fuera de rango', () => {
    expect(colorAfinidad(0)).toBe('hsl(0, 60%, 40%)');
    expect(colorAfinidad(50)).toBe('hsl(60, 60%, 40%)');
    expect(colorAfinidad(100)).toBe('hsl(120, 60%, 40%)');
    expect(colorAfinidad(150)).toBe('hsl(120, 60%, 40%)');
  });
});

describe('IndicadorAfinidad', () => {
  it('muestra el porcentaje redondeado sin el signo %', () => {
    render(<IndicadorAfinidad score={73.4} />);
    expect(screen.getByLabelText('Afinidad 73%')).toHaveTextContent('73');
  });

  it('muestra un guion cuando no hay score', () => {
    render(<IndicadorAfinidad score={null} />);
    expect(screen.getByLabelText('Sin afinidad calculada')).toHaveTextContent('—');
  });
});
