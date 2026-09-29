import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CandidatoDetalle } from '../api/candidatos';
import { ResultadoSelecta } from './ResultadoSelecta';

const candidatoConDesglose = {
  nombre: 'Ana Pérez',
  alias: 'Candidato 1',
  identidadRevelada: true,
  desgloseAfinidad: {
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
  },
} as unknown as CandidatoDetalle;

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

describe('ResultadoSelecta', () => {
  it('sin candidato muestra el estado vacío "Selecciona un candidato"', () => {
    render(<ResultadoSelecta {...base} candidato={null} />);

    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('con el payload real de APP-00046 pinta afinidad total y las 5 filas de componentes, sin alerta ni crash', () => {
    render(<ResultadoSelecta {...base} candidato={candidatoConDesglose} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Componentes de la rúbrica')).toBeInTheDocument();
    expect(screen.getByText('Habilidades obligatorias')).toBeInTheDocument();
    expect(screen.getByText('Experiencia')).toBeInTheDocument();
    expect(screen.getByText('Habilidades deseables')).toBeInTheDocument();
    expect(screen.getByText('Formación')).toBeInTheDocument();
    expect(screen.getByText('Afinidad semántica')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('con calidad.requiereRevision muestra la alerta con el texto de la primera alerta', () => {
    const candidato = {
      nombre: 'Ana Pérez',
      alias: 'Candidato 1',
      desgloseAfinidad: {
        porcentajeTotal: 68,
        versionRubrica: '1.0',
        elegible: true,
        motivosNoElegible: [],
        componentes: [],
        calidad: {
          confianza: 0.4,
          requiereRevision: true,
          provisional: false,
          alertas: [
            'No se identificó una sección de experiencia. El cálculo de años se hizo sobre el texto completo y puede ser impreciso.',
          ],
        },
        comentarios: null,
      },
    } as unknown as CandidatoDetalle;

    render(<ResultadoSelecta {...base} candidato={candidato} />);

    expect(screen.getByText(/No se identificó una sección de experiencia/)).toBeInTheDocument();
  });

  it('con elegible: false muestra la alerta de no elegible y los motivos', () => {
    const candidato = {
      nombre: 'Ana Pérez',
      alias: 'Candidato 1',
      desgloseAfinidad: {
        porcentajeTotal: 40,
        versionRubrica: '1.0',
        elegible: false,
        motivosNoElegible: ['No cumple los años de experiencia mínimos requeridos'],
        componentes: [],
        calidad: { confianza: 0.5, requiereRevision: false, provisional: false, alertas: [] },
        comentarios: null,
      },
    } as unknown as CandidatoDetalle;

    render(<ResultadoSelecta {...base} candidato={candidato} />);

    expect(screen.getByText('No cumple los criterios mínimos de la vacante')).toBeInTheDocument();
    expect(
      screen.getByText('No cumple los años de experiencia mínimos requeridos'),
    ).toBeInTheDocument();
  });

  it('con desglose.componentes ausente no crashea y omite el bloque de la rúbrica', () => {
    const candidato = {
      nombre: 'Ana Pérez',
      alias: 'Candidato 1',
      desgloseAfinidad: {
        porcentajeTotal: 50,
        comentarios: null,
      },
    } as unknown as CandidatoDetalle;

    render(<ResultadoSelecta {...base} candidato={candidato} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.queryByText('Componentes de la rúbrica')).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('sin onVerDetalleCompleto no renderiza el enlace "Ver detalle completo"', () => {
    render(<ResultadoSelecta {...base} candidato={candidatoConDesglose} />);

    expect(screen.queryByText('Ver detalle completo')).not.toBeInTheDocument();
  });

  it('invoca onVerDetalleCompleto al pulsar el enlace', async () => {
    const usuario = userEvent.setup();
    const onVerDetalleCompleto = vi.fn();
    render(
      <ResultadoSelecta
        {...base}
        candidato={candidatoConDesglose}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );

    await usuario.click(screen.getByText('Ver detalle completo'));
    expect(onVerDetalleCompleto).toHaveBeenCalledTimes(1);
  });
});
