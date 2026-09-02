import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RailPipeline } from './RailPipeline';

describe('RailPipeline', () => {
  it('dibuja las fases SAP y los pasos internos', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    // Fases SAP.
    expect(screen.getByText('Postulantes')).toBeInTheDocument();
    expect(screen.getByText('Prefiltro telefónico')).toBeInTheDocument();
    expect(screen.getByText('Estudio de seguridad y examen médico')).toBeInTheDocument();
    // Pasos internos.
    expect(screen.getByRole('button', { name: /Selecta/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Listado de filtrados/ })).toBeInTheDocument();
  });

  it('muestra la nota de las fases sin soporte en IA Talento', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    expect(screen.getAllByText('Fuera de IA Talento').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Portal del líder/).length).toBeGreaterThan(0);
  });

  it('notifica el paso elegido', async () => {
    const onSeleccionarPaso = vi.fn();
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={onSeleccionarPaso} />);

    await userEvent.click(screen.getByRole('button', { name: /Listado de filtrados/ }));
    expect(onSeleccionarPaso).toHaveBeenCalledWith('LISTA_FILTRADOS');
  });

  it('marca el paso activo con aria-pressed', () => {
    render(<RailPipeline pasoActivo="LISTA_FILTRADOS" onSeleccionarPaso={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Listado de filtrados/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /^Selecta/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('desplaza el rail una fracción del ancho visible al pulsar "siguiente"', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    const rail = screen.getByRole('group', { name: 'Fases del pipeline' });
    Object.defineProperty(rail, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(rail, 'scrollWidth', { value: 2000, configurable: true });
    const scrollBy = vi.fn();
    rail.scrollBy = scrollBy as unknown as typeof rail.scrollBy;

    // Recalcula las flechas con las medidas simuladas (habilita "siguiente").
    fireEvent.scroll(rail);
    fireEvent.click(screen.getByRole('button', { name: 'Fases siguientes' }));

    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 400 }));
    expect(scrollBy).not.toHaveBeenCalledWith(expect.objectContaining({ left: 320 }));
  });

  it('deshabilita la flecha anterior en el extremo inicial', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Fases anteriores' })).toBeDisabled();
  });
});
