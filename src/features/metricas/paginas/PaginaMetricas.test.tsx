import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaginaMetricas } from './PaginaMetricas';

describe('PaginaMetricas', () => {
  it('muestra el encabezado de la página y el estado "Muy pronto" debajo', () => {
    render(<PaginaMetricas />);

    const titulo = screen.getByRole('heading', { level: 1, name: 'Métricas' });
    expect(titulo).toBeInTheDocument();
    expect(
      screen.getByText('Consulta indicadores sobre el desempeño de tus procesos de selección.'),
    ).toBeInTheDocument();

    // El `GebEmptyState` no repite el `<h1>` del encabezado: usa un título de estado.
    expect(screen.getByText('Muy pronto')).toBeInTheDocument();
    expect(
      screen.getByText('Esta sección estará disponible en una próxima entrega.'),
    ).toBeInTheDocument();
  });
});
