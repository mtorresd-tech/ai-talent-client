import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EventoHistorial } from '../api/candidatos';
import { LineaTiempoProceso } from './LineaTiempoProceso';

const evento: EventoHistorial = {
  fecha: '2026-01-01T00:00:00Z',
  tipo: 'TRANSICION',
  estadoAnterior: null,
  estadoNuevo: 'RANKING_SELECTA',
  disparador: 'JOB',
  actor: null,
  detalle: null,
};

describe('LineaTiempoProceso', () => {
  it('con historial vacío muestra el vacío informativo', () => {
    render(
      <LineaTiempoProceso
        historial={[]}
        catalogo={null}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    );

    expect(screen.getByText('Sin eventos')).toBeInTheDocument();
  });

  it('con error muestra el estado de error con botón de reintento', () => {
    const onReintentar = vi.fn();
    render(
      <LineaTiempoProceso
        historial={null}
        catalogo={null}
        cargando={false}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('renderiza un hito por evento con su etiqueta', () => {
    render(
      <LineaTiempoProceso
        historial={[evento]}
        catalogo={null}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    );

    expect(screen.getByText('En ranking')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
  });
});
