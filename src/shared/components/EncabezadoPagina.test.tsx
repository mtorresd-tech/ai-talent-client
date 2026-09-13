import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EncabezadoPagina } from './EncabezadoPagina';

describe('EncabezadoPagina', () => {
  it('renderiza solo el título cuando no recibe eyebrow ni subtítulo', () => {
    render(<EncabezadoPagina titulo="Procesos de selección activos" />);

    const titulo = screen.getByRole('heading', {
      level: 1,
      name: 'Procesos de selección activos',
    });
    expect(titulo).toBeInTheDocument();
    expect(screen.queryByText('Métricas')).not.toBeInTheDocument();
  });

  it('renderiza eyebrow, título y subtítulo en ese orden', () => {
    render(
      <EncabezadoPagina
        eyebrow="Gestión de procesos"
        titulo="Procesos de selección activos"
        subtitulo="Monitorea el avance de tus vacantes."
      />,
    );

    const eyebrow = screen.getByText('Gestión de procesos');
    const titulo = screen.getByRole('heading', {
      level: 1,
      name: 'Procesos de selección activos',
    });
    const subtitulo = screen.getByText('Monitorea el avance de tus vacantes.');

    expect(eyebrow).toBeInTheDocument();
    expect(titulo).toBeInTheDocument();
    expect(subtitulo).toBeInTheDocument();

    const posicionEyebrowVsTitulo = eyebrow.compareDocumentPosition(titulo);
    expect(posicionEyebrowVsTitulo & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const posicionTituloVsSubtitulo = titulo.compareDocumentPosition(subtitulo);
    expect(posicionTituloVsSubtitulo & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
