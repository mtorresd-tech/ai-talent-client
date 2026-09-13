import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderConTema } from '../../../test/renderConTema';
import { TablaVacantes } from './TablaVacantes';
import type { VacanteResumen } from '../api/vacantes';

function vacante(overrides: Partial<VacanteResumen> = {}): VacanteResumen {
  return {
    jobRequisitionId: 'REQ-1',
    titulo: 'Analista de Datos',
    area: 'Tecnología',
    ciudad: 'Bogotá',
    fechaPublicacion: '2026-01-10',
    totalCandidatos: 3,
    pendientesDecision: 2,
    numeroVacantes: 1,
    cerrada: false,
    conteoPorEstado: { RANKING_SELECTA: 3 },
    ...overrides,
  };
}

const propsBase = {
  cargando: false,
  error: null,
  pagina: 0,
  tamanoPagina: 10,
  vacanteSeleccionadaId: null,
  onCambioPagina: vi.fn(),
  onBuscar: vi.fn(),
  onSeleccionar: vi.fn(),
  onReintentar: vi.fn(),
};

describe('TablaVacantes', () => {
  it('muestra un badge "success" con la etiqueta "En proceso" para una vacante abierta', () => {
    renderConTema(
      <TablaVacantes
        {...propsBase}
        respuesta={{
          data: [vacante({ cerrada: false })],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        }}
      />,
    );

    const badge = screen.getByText('En proceso');
    expect(badge.closest('[data-geb="GebStatusChip"]')).toBeInTheDocument();
  });

  it('muestra un badge "neutral" con la etiqueta "Cerrada" para una vacante cerrada', () => {
    renderConTema(
      <TablaVacantes
        {...propsBase}
        respuesta={{
          data: [vacante({ cerrada: true })],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        }}
      />,
    );

    const badge = screen.getByText('Cerrada');
    expect(badge.closest('[data-geb="GebStatusChip"]')).toBeInTheDocument();
  });

  it('marca la fila seleccionada con el marcador de resalte', () => {
    renderConTema(
      <TablaVacantes
        {...propsBase}
        vacanteSeleccionadaId="REQ-1"
        respuesta={{
          data: [vacante()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        }}
      />,
    );

    const fila = screen.getByText('Analista de Datos').closest('tr');
    expect(fila?.querySelector('[data-fila-seleccionada]')).toBeInTheDocument();
  });

  it('no marca ninguna fila cuando no hay vacante seleccionada', () => {
    renderConTema(
      <TablaVacantes
        {...propsBase}
        respuesta={{
          data: [vacante()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        }}
      />,
    );

    const fila = screen.getByText('Analista de Datos').closest('tr');
    expect(fila?.querySelector('[data-fila-seleccionada]')).not.toBeInTheDocument();
  });
});
