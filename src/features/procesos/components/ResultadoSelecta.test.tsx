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
    porcentajeTotal: 73,
    porcentajeFortalezas: 91,
    porcentajeExperiencia: 64,
    porcentajeEstudios: 52,
    fortalezas: ['Comunicación'],
    debilidades: ['Inglés'],
    comentarios: 'Buen perfil',
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

  it('con desglose muestra el porcentaje de afinidad y las métricas', () => {
    const candidato = {
      nombre: 'Ana Pérez',
      alias: 'Candidato 1',
      identidadRevelada: true,
      desgloseAfinidad: {
        porcentajeTotal: 73,
        porcentajeFortalezas: 91,
        porcentajeExperiencia: 64,
        porcentajeEstudios: 52,
        fortalezas: ['Comunicación'],
        debilidades: ['Inglés'],
        comentarios: 'Buen perfil',
      },
    } as unknown as CandidatoDetalle;

    render(<ResultadoSelecta {...base} candidato={candidato} />);

    expect(screen.getByText('73%')).toBeInTheDocument();
    expect(screen.getAllByText('Fortalezas').length).toBeGreaterThan(0);
    expect(screen.getByText('Comunicación')).toBeInTheDocument();
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
