import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { VacanteResumen } from '../api/vacantes';
import { TablaVacantesLider } from './TablaVacantesLider';

function vacante(overrides: Partial<VacanteResumen> = {}): VacanteResumen {
  return {
    jobRequisitionId: 'REQ-1',
    titulo: 'Analista de Datos',
    area: 'Tecnología',
    ciudad: 'Bogotá',
    fechaPublicacion: '2026-08-01',
    totalCandidatos: 10,
    pendientesDecision: 0,
    numeroVacantes: 1,
    cerrada: false,
    conteoPorEstado: {},
    ...overrides,
  };
}

function respuesta(vacantes: VacanteResumen[]): RespuestaPaginada<VacanteResumen> {
  return {
    data: vacantes,
    meta: { page: 1, pageSize: 5, total: vacantes.length, totalPages: 1 },
  };
}

const props = {
  cargando: false,
  error: null,
  pagina: 0,
  tamanoPagina: 5,
  vacanteSeleccionadaId: null,
  onCambioPagina: vi.fn(),
  onBuscar: vi.fn(),
  onSeleccionar: vi.fn(),
  onReintentar: vi.fn(),
};

/** Localiza la celda "Por revisar" de la fila de una vacante por su título. */
function celdaPorRevisar(titulo: string): HTMLElement {
  const fila = screen.getByText(titulo).closest('tr') as HTMLElement;
  return within(fila).getAllByRole('cell').at(-1) as HTMLElement;
}

describe('TablaVacantesLider · columna "Por revisar"', () => {
  it('muestra 0 cuando conteoPorEstado no trae EN_REVISION_LIDER', () => {
    render(
      <TablaVacantesLider
        {...props}
        respuesta={respuesta([vacante({ conteoPorEstado: { RECIBIDO: 4 } })])}
      />,
    );

    expect(within(celdaPorRevisar('Analista de Datos')).getByText('0')).toBeInTheDocument();
  });

  it('muestra solo EN_REVISION_LIDER, sin sumar INFORME_INCOGNITO', () => {
    render(
      <TablaVacantesLider
        {...props}
        respuesta={respuesta([
          vacante({ conteoPorEstado: { EN_REVISION_LIDER: 3, INFORME_INCOGNITO: 2 } }),
        ])}
      />,
    );

    const celda = celdaPorRevisar('Analista de Datos');
    expect(within(celda).getByText('3')).toBeInTheDocument();
    expect(within(celda).queryByText('5')).not.toBeInTheDocument();
  });
});

describe('TablaVacantesLider · buscador', () => {
  it('emite el texto tecleado a onBuscar tras el debounce', async () => {
    const onBuscar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <TablaVacantesLider {...props} onBuscar={onBuscar} respuesta={respuesta([vacante()])} />,
    );

    await usuario.type(screen.getByPlaceholderText(/Buscar/), 'analista');

    await waitFor(() => expect(onBuscar).toHaveBeenLastCalledWith('analista'));
  });
});
