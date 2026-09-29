import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponenteAfinidad } from '../api/candidatos';
import { ListaTexto, Metrica, PiezaComponentesRubrica } from './PiezasAfinidad';

describe('Metrica', () => {
  it('con valor undefined renderiza "—", no "NaN%"', () => {
    render(<Metrica etiqueta="Fortalezas" valor={undefined} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('con valor null renderiza "—" (sin regresión)', () => {
    render(<Metrica etiqueta="Fortalezas" valor={null} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('con valor numérico redondea y agrega "%"', () => {
    render(<Metrica etiqueta="Fortalezas" valor={73.6} />);

    expect(screen.getByText('74%')).toBeInTheDocument();
  });
});

describe('ListaTexto', () => {
  it('con valores undefined no renderiza nada ni lanza excepción', () => {
    const { container } = render(<ListaTexto titulo="Motivos" valores={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('con valores vacíos no renderiza nada', () => {
    const { container } = render(<ListaTexto titulo="Motivos" valores={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('con valores muestra el título y cada elemento', () => {
    render(<ListaTexto titulo="Motivos" valores={['No cumple experiencia mínima']} />);

    expect(screen.getByText('Motivos')).toBeInTheDocument();
    expect(screen.getByText('No cumple experiencia mínima')).toBeInTheDocument();
  });
});

const componentes: ComponenteAfinidad[] = [
  {
    componente: 'HABILIDADES_OBLIGATORIAS',
    peso: 0.3,
    obtenido: 0.7504,
    aporte: 22.51,
    brecha: 7.49,
  },
  { componente: 'EXPERIENCIA', peso: 0.25, obtenido: 0.9817, aporte: 24.54, brecha: 0.46 },
];

describe('PiezaComponentesRubrica', () => {
  it('con componentes: [] no renderiza filas ni lanza excepción', () => {
    const { container } = render(<PiezaComponentesRubrica componentes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('con componentes undefined no renderiza filas ni lanza excepción', () => {
    const { container } = render(<PiezaComponentesRubrica componentes={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('con componentes muestra la etiqueta legible y el aporte de cada uno', () => {
    render(<PiezaComponentesRubrica componentes={componentes} />);

    expect(screen.getByText('Habilidades obligatorias')).toBeInTheDocument();
    expect(screen.getByText('23%')).toBeInTheDocument();
    expect(screen.getByText('Experiencia')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
