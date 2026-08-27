import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EtapaPipeline } from '../api/vacantes';
import { RailPipeline } from './RailPipeline';

function etapa(clave: string, orden: number): EtapaPipeline {
  return { clave, nombre: clave, orden, total: orden, pendientesDecision: 0, automatica: false };
}

const pipeline = [etapa('SELECTA', 1), etapa('BLUESITE', 2), etapa('OFERTA', 3)];

const props = {
  pipeline,
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

describe('RailPipeline', () => {
  it('deshabilita la flecha anterior en la primera etapa', () => {
    render(<RailPipeline {...props} etapaActivaClave="SELECTA" onSeleccionarEtapa={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Etapa siguiente' })).toBeEnabled();
  });

  it('deshabilita la flecha siguiente en la última etapa', () => {
    render(<RailPipeline {...props} etapaActivaClave="OFERTA" onSeleccionarEtapa={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Etapa siguiente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeEnabled();
  });

  it('notifica la etapa elegida', async () => {
    const onSeleccionarEtapa = vi.fn();
    render(
      <RailPipeline
        {...props}
        etapaActivaClave="SELECTA"
        onSeleccionarEtapa={onSeleccionarEtapa}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /BLUESITE/ }));
    expect(onSeleccionarEtapa).toHaveBeenCalledWith(expect.objectContaining({ clave: 'BLUESITE' }));
  });
});
