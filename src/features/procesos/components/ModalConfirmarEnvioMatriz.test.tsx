import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalConfirmarEnvioMatriz } from './ModalConfirmarEnvioMatriz';

const base = {
  abierto: true,
  posicion: 2,
  nombre: 'Candidato 7',
  total: 82.4,
  reemplazaObjetado: false,
  enviando: false,
  error: null,
  onCancelar: vi.fn(),
  onConfirmar: vi.fn(),
};

describe('ModalConfirmarEnvioMatriz', () => {
  it('muestra el candidato, su total y el aviso de que no se puede modificar', async () => {
    const onConfirmar = vi.fn();
    render(<ModalConfirmarEnvioMatriz {...base} onConfirmar={onConfirmar} />);

    expect(screen.getByText('Candidato #2 — Candidato 7')).toBeInTheDocument();
    expect(screen.getByText('Puntaje total: 82,4')).toBeInTheDocument();
    const aviso = screen.getByText(/la justificación no se puede modificar/);
    expect(aviso).toHaveTextContent(
      'Después de enviarla, la justificación no se puede modificar mientras el líder no la objete.',
    );
    expect(aviso).not.toHaveTextContent(/otro candidato/);
    expect(aviso).not.toHaveTextContent(/configuración/i);
    expect(screen.queryByText(/reemplaza la elección/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar envío' }));
    expect(onConfirmar).toHaveBeenCalled();
  });

  it('en OBJETADA indica que reemplaza al candidato objetado', () => {
    render(<ModalConfirmarEnvioMatriz {...base} reemplazaObjetado />);
    expect(
      screen.getByText('Este candidato reemplaza la elección que el líder objetó.'),
    ).toBeInTheDocument();
  });

  it('con error muestra el mensaje con el ID de correlación y permite reintentar', () => {
    render(
      <ModalConfirmarEnvioMatriz
        {...base}
        error={{
          mensaje: 'Error inesperado',
          campo: null,
          recargar: false,
          idCorrelacion: 'corr-500',
        }}
      />,
    );
    expect(
      screen.getByText(/Error inesperado \(ID de correlación: corr-500\)/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('mientras envía deshabilita las acciones', () => {
    render(<ModalConfirmarEnvioMatriz {...base} enviando />);
    expect(screen.getByRole('button', { name: 'Confirmar envío' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
