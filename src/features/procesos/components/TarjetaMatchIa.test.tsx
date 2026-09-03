import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { DesgloseAfinidad } from '../api/candidatos';
import { TarjetaMatchIa } from './TarjetaMatchIa';

const desglose: DesgloseAfinidad = {
  porcentajeTotal: 92,
  porcentajeFortalezas: 90,
  porcentajeExperiencia: 88,
  porcentajeEstudios: 70,
  fortalezas: ['Comunicación'],
  debilidades: ['Inglés'],
  comentarios: 'Buen perfil',
};

describe('TarjetaMatchIa', () => {
  it('muestra el porcentaje total, la descripción y las dimensiones', () => {
    render(<TarjetaMatchIa desglose={desglose} scoreAfinidad={92} />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText(/afinidad alta/i)).toBeInTheDocument();
    expect(screen.getByText('Comunicación')).toBeInTheDocument();
  });

  it('sin desglose muestra el estado vacío "sin resultado de afinidad"', () => {
    render(<TarjetaMatchIa desglose={null} scoreAfinidad={null} />);

    expect(screen.getByText('Sin resultado de afinidad')).toBeInTheDocument();
  });
});
