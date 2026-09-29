import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { errorApi } from '../../../test/clienteApiFalso';
import type { CandidatoDetalle } from '../api/candidatos';
import type { Prefiltro } from '../api/prefiltro';
import { ResultadoPrefiltro } from './ResultadoPrefiltro';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
  cargandoPrefiltro: false,
  errorPrefiltro: null,
  onReintentarPrefiltro: vi.fn(),
};

function candidato(estado: CandidatoDetalle['estado']): CandidatoDetalle {
  return { nombre: 'Ana Pérez', alias: 'Candidato 1', estado } as unknown as CandidatoDetalle;
}

const prefiltro = {
  aspiracionSalarial: 5500000,
  disponibilidad: 'Inmediata',
  desempenoUltimoAnio: 'Sobresaliente',
  interesContinuidad: true,
  cumplePerfil: true,
  observaciones: null,
} as unknown as Prefiltro;

describe('ResultadoPrefiltro', () => {
  it('sin candidato muestra el estado vacío', () => {
    render(<ResultadoPrefiltro {...base} candidato={null} prefiltro={null} />);
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('con estado PREFILTRO_PENDIENTE avisa que se diligencia en SuccessFactors, sin el botón de ir allá', () => {
    render(
      <ResultadoPrefiltro
        {...base}
        candidato={candidato('PREFILTRO_PENDIENTE')}
        prefiltro={null}
      />,
    );

    expect(screen.getByText(/no se ha diligenciado en SAP\s+SuccessFactors/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir SuccessFactors/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Información del prefiltro')).not.toBeInTheDocument();
  });

  it('con estado PREFILTRO_COMPLETADO muestra los datos del prefiltro', () => {
    render(
      <ResultadoPrefiltro
        {...base}
        candidato={candidato('PREFILTRO_COMPLETADO')}
        prefiltro={prefiltro}
      />,
    );

    expect(screen.getByText('Información del prefiltro')).toBeInTheDocument();
    expect(screen.getByText(/5\.500\.000/)).toBeInTheDocument();
    expect(screen.getByText('Inmediata')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir SuccessFactors/i })).not.toBeInTheDocument();
  });

  it('con estado PRESELECCIONADO también muestra los datos del prefiltro', () => {
    render(
      <ResultadoPrefiltro
        {...base}
        candidato={candidato('PRESELECCIONADO')}
        prefiltro={prefiltro}
      />,
    );

    expect(screen.getByText('Información del prefiltro')).toBeInTheDocument();
  });

  it('propaga el error de la carga del prefiltro con reintento', () => {
    const onReintentarPrefiltro = vi.fn();
    render(
      <ResultadoPrefiltro
        {...base}
        candidato={candidato('PREFILTRO_COMPLETADO')}
        prefiltro={null}
        errorPrefiltro={errorApi(500)}
        onReintentarPrefiltro={onReintentarPrefiltro}
      />,
    );

    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
