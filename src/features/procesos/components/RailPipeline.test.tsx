import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RailPipeline } from './RailPipeline';

describe('RailPipeline', () => {
  it('dibuja las fases visibles y los pasos internos', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    // Fases visibles. "Matriz de selección" aparece dos veces: como nombre de
    // la fase y como nombre de su único paso interno homónimo.
    expect(screen.getByText('Postulantes')).toBeInTheDocument();
    expect(screen.getByText('Prefiltro telefónico')).toBeInTheDocument();
    expect(screen.getAllByText('Matriz de selección').length).toBeGreaterThan(0);
    // Fases ocultas.
    expect(screen.queryByText('Estudio de seguridad y examen médico')).not.toBeInTheDocument();
    // Pasos internos.
    expect(screen.getByRole('button', { name: /Selecta/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Listado de filtrados/ })).toBeInTheDocument();
  });

  it('muestra exactamente 3 tarjetas de fase', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    expect(screen.getByText('Postulantes')).toBeInTheDocument();
    expect(screen.getByText('Prefiltro telefónico')).toBeInTheDocument();
    expect(screen.getAllByText('Matriz de selección').length).toBeGreaterThan(0);
    [
      'Pruebas psicotécnicas',
      'Prueba técnica o assessment',
      'Entrevista por competencias',
      'Entrevista jefe inmediato',
      'Segunda entrevista del área',
      'Estudio de seguridad y examen médico',
      'Oferta',
    ].forEach((nombre) => {
      expect(screen.queryByText(nombre)).not.toBeInTheDocument();
    });
  });

  it('ya no muestra las notas de las fases sin soporte en IA Talento (ahora ocultas)', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    expect(screen.queryByText('Fuera de IA Talento')).not.toBeInTheDocument();
    expect(screen.queryByText(/Portal del líder/)).not.toBeInTheDocument();
  });

  it('usa la posición real de la fase (con huecos) como número de la tarjeta', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    expect(screen.getByTestId('numero-fase-POSTULANTES')).toHaveTextContent('1');
    expect(screen.getByTestId('numero-fase-PREFILTRO_TELEFONICO')).toHaveTextContent('2');
    expect(screen.getByTestId('numero-fase-MATRIZ_SELECCION')).toHaveTextContent('8');
  });

  it('muestra el indicador de fases ocultas entre Prefiltro telefónico y Matriz de selección', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    const separadores = screen.getAllByRole('separator');
    expect(separadores).toHaveLength(1);
    expect(separadores[0]).toHaveAttribute('aria-orientation', 'vertical');
    expect(separadores[0].getAttribute('aria-label')).toMatch(/SuccessFactors/);

    const prefiltro = screen.getByText('Prefiltro telefónico');
    // "Matriz de selección" nombra tanto la fase como su único paso interno;
    // el primer nodo en el DOM es el título de la tarjeta de fase.
    const [tituloMatriz] = screen.getAllByText('Matriz de selección');
    const posicionRelativa = prefiltro.compareDocumentPosition(separadores[0]);
    // El separador va después de "Prefiltro telefónico" (Node.DOCUMENT_POSITION_FOLLOWING = 4).
    expect(posicionRelativa & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const posicionRelativaConMatriz = separadores[0].compareDocumentPosition(tituloMatriz);
    expect(posicionRelativaConMatriz & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('no muestra indicador entre fases consecutivas (Postulantes y Prefiltro telefónico)', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    const postulantes = screen.getByText('Postulantes');
    const separador = screen.getByRole('separator');
    // El único separador va después de "Postulantes" (Node.DOCUMENT_POSITION_FOLLOWING = 4),
    // es decir, no hay ninguno entre "Postulantes" y "Prefiltro telefónico".
    const posicionRelativa = postulantes.compareDocumentPosition(separador);
    expect(posicionRelativa & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('permite navegar a "Matriz de selección" desde el rail', async () => {
    const onSeleccionarPaso = vi.fn();
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={onSeleccionarPaso} />);

    await userEvent.click(screen.getByRole('button', { name: /Matriz de selección/ }));
    expect(onSeleccionarPaso).toHaveBeenCalledWith('MATRIZ_SELECCION');
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

    const rail = screen.getByRole('group', { name: 'Fases del pipeline' });
    Object.defineProperty(rail, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(rail, 'scrollWidth', { value: 2000, configurable: true });
    fireEvent.scroll(rail);

    expect(screen.getByRole('button', { name: 'Fases anteriores' })).toBeDisabled();
  });

  it('oculta ambas flechas cuando el rail no tiene desbordamiento horizontal', () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    // jsdom no calcula layout real: `clientWidth`/`scrollWidth` quedan en 0 por
    // defecto, el mismo escenario que "todo el rail cabe en el viewport".
    expect(screen.queryByRole('button', { name: 'Fases anteriores' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fases siguientes' })).not.toBeInTheDocument();
  });

  it('muestra el tooltip del indicador de fases ocultas al pasar el mouse', async () => {
    const usuario = userEvent.setup();
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    const separador = screen.getByRole('separator');
    await usuario.hover(separador);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(/SuccessFactors/);

    await usuario.unhover(separador);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('muestra el mismo tooltip al enfocar el indicador de fases ocultas por teclado', async () => {
    render(<RailPipeline pasoActivo="SELECTA" onSeleccionarPaso={vi.fn()} />);

    const separador = screen.getByRole('separator');
    expect(separador).toHaveAttribute('tabIndex', '0');

    separador.focus();
    expect(separador).toHaveFocus();

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(/SuccessFactors/);
  });
});
