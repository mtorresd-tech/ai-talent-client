import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { establecerAnchoViewport } from '../../../test/matchMedia';
import { LayoutPasoPipeline } from './LayoutPasoPipeline';

describe('LayoutPasoPipeline', () => {
  it('en escritorio (>= md) renderiza ambos slots y las props master–detail no alteran el render', () => {
    render(
      <LayoutPasoPipeline
        izquierda={<div>Lista de candidatos</div>}
        derecha={<div>Resultado Selecta</div>}
        haySeleccion={false}
        onVolver={vi.fn()}
      />,
    );

    expect(screen.getByText('Lista de candidatos')).toBeInTheDocument();
    expect(screen.getByText('Resultado Selecta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a la lista/ })).not.toBeInTheDocument();
  });

  it('por debajo de md sin selección muestra solo la lista', () => {
    establecerAnchoViewport(400);
    render(
      <LayoutPasoPipeline
        izquierda={<div>Lista de candidatos</div>}
        derecha={<div>Resultado Selecta</div>}
        haySeleccion={false}
        onVolver={vi.fn()}
      />,
    );

    expect(screen.getByText('Lista de candidatos')).toBeInTheDocument();
    expect(screen.queryByText('Resultado Selecta')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a la lista/ })).not.toBeInTheDocument();
  });

  it('por debajo de md con selección muestra el detalle y el botón "Volver a la lista"', async () => {
    const onVolver = vi.fn();
    establecerAnchoViewport(400);
    render(
      <LayoutPasoPipeline
        izquierda={<div>Lista de candidatos</div>}
        derecha={<div>Resultado Selecta</div>}
        haySeleccion
        onVolver={onVolver}
      />,
    );

    expect(screen.getByText('Resultado Selecta')).toBeInTheDocument();
    expect(screen.queryByText('Lista de candidatos')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Volver a la lista/ }));
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('por debajo de md sin props master–detail cae a mostrar la lista sin romperse', () => {
    establecerAnchoViewport(400);
    render(
      <LayoutPasoPipeline
        izquierda={<div>Lista de candidatos</div>}
        derecha={<div>Resultado Selecta</div>}
      />,
    );

    expect(screen.getByText('Lista de candidatos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a la lista/ })).not.toBeInTheDocument();
  });

  it('con selección pero sin onVolver no renderiza la barra de volver', () => {
    establecerAnchoViewport(400);
    render(
      <LayoutPasoPipeline izquierda={<div>Lista</div>} derecha={<div>Detalle</div>} haySeleccion />,
    );

    expect(screen.getByText('Detalle')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a la lista/ })).not.toBeInTheDocument();
  });
});
