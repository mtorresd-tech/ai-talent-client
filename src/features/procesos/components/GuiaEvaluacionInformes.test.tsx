import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuiaEvaluacionInformes } from './GuiaEvaluacionInformes';

const TITULO_POPOVER = 'Cómo evaluar cada informe';

describe('GuiaEvaluacionInformes', () => {
  it('abre el popover con los cuatro puntos al pulsar el botón', async () => {
    const usuario = userEvent.setup();
    render(<GuiaEvaluacionInformes />);

    expect(screen.queryByText(TITULO_POPOVER)).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Guía de evaluación/ }));

    expect(screen.getByText(TITULO_POPOVER)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Lea atentamente el perfil completo de cada persona candidata antes de decidir.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Evalúe un máximo de 8 informes por sesión para mantener un criterio consistente.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Base su decisión en habilidades y evaluaciones, no en la redacción del informe.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Use el campo de comentarios para justificar su decisión ante el equipo de selección.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('cierra el popover con la tecla Escape', async () => {
    const usuario = userEvent.setup();
    render(<GuiaEvaluacionInformes />);

    await usuario.click(screen.getByRole('button', { name: /Guía de evaluación/ }));
    expect(screen.getByText(TITULO_POPOVER)).toBeInTheDocument();

    await usuario.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText(TITULO_POPOVER)).not.toBeInTheDocument());
  });

  it('cierra el popover al hacer clic fuera', async () => {
    const usuario = userEvent.setup();
    render(<GuiaEvaluacionInformes />);

    await usuario.click(screen.getByRole('button', { name: /Guía de evaluación/ }));
    expect(screen.getByText(TITULO_POPOVER)).toBeInTheDocument();

    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).not.toBeNull();
    await usuario.click(backdrop as Element);
    await waitFor(() => expect(screen.queryByText(TITULO_POPOVER)).not.toBeInTheDocument());
  });
});
