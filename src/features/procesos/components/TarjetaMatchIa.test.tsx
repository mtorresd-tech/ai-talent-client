import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { DesgloseAfinidad } from '../api/candidatos';
import { TarjetaMatchIa } from './TarjetaMatchIa';

const desglose: DesgloseAfinidad = {
  porcentajeTotal: 74.53,
  versionRubrica: '1.0',
  elegible: true,
  motivosNoElegible: [],
  componentes: [
    {
      componente: 'HABILIDADES_OBLIGATORIAS',
      peso: 0.3,
      obtenido: 0.7504,
      aporte: 22.51,
      brecha: 7.49,
    },
    { componente: 'EXPERIENCIA', peso: 0.25, obtenido: 0.9817, aporte: 24.54, brecha: 0.46 },
    {
      componente: 'HABILIDADES_DESEABLES',
      peso: 0.15,
      obtenido: 0.2723,
      aporte: 4.08,
      brecha: 10.92,
    },
    { componente: 'FORMACION', peso: 0.15, obtenido: 0.9213, aporte: 13.82, brecha: 1.18 },
    { componente: 'SEMANTICO', peso: 0.15, obtenido: 0.6388, aporte: 9.58, brecha: 5.42 },
  ],
  calidad: { confianza: 0.71, requiereRevision: false, provisional: false, alertas: [] },
  aniosTotales: 4.14,
  aniosRelevantes: 3.8,
  sectorPredominante: 'energetico',
  comentarios: 'Cumple parcialmente; revisar las brechas antes de avanzar.',
};

describe('TarjetaMatchIa', () => {
  it('con el payload real de APP-00046 muestra el mismo resultado que ResultadoSelecta (misma pieza de datos)', () => {
    render(<TarjetaMatchIa desglose={desglose} scoreAfinidad={74.53} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/afinidad baja/i)).toBeInTheDocument();
    expect(screen.getByText('Habilidades obligatorias')).toBeInTheDocument();
    expect(screen.getByText('Habilidades deseables')).toBeInTheDocument();
    expect(screen.getByText('Formación')).toBeInTheDocument();
    expect(screen.getByText('Afinidad semántica')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('sin desglose muestra el estado vacío "sin resultado de afinidad"', () => {
    render(<TarjetaMatchIa desglose={null} scoreAfinidad={null} />);

    expect(screen.getByText('Sin resultado de afinidad')).toBeInTheDocument();
  });

  it('con elegible: false muestra la alerta de no elegible y los motivos', () => {
    const desgloseNoElegible: DesgloseAfinidad = {
      ...desglose,
      elegible: false,
      motivosNoElegible: ['No cumple los años de experiencia mínimos requeridos'],
    };

    render(<TarjetaMatchIa desglose={desgloseNoElegible} scoreAfinidad={74.53} />);

    expect(screen.getByText('No cumple los criterios mínimos de la vacante')).toBeInTheDocument();
    expect(
      screen.getByText('No cumple los años de experiencia mínimos requeridos'),
    ).toBeInTheDocument();
  });

  it('con desglose.componentes ausente no crashea y omite el bloque de la rúbrica', () => {
    const desgloseSinComponentes = {
      porcentajeTotal: 50,
      comentarios: null,
    } as unknown as DesgloseAfinidad;

    render(<TarjetaMatchIa desglose={desgloseSinComponentes} scoreAfinidad={50} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.queryByText('Componentes de la rúbrica')).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });
});
