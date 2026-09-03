import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { CandidatoDetalle } from '../api/candidatos';
import { SeguimientoAnonimizacion } from './SeguimientoAnonimizacion';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

function candidato(
  estado: EstadoProceso,
  overrides: Partial<CandidatoDetalle> = {},
): CandidatoDetalle {
  return {
    jobApplicationId: 'APP-1',
    jobRequisitionId: 'REQ-1',
    alias: 'Candidato 1',
    nombre: 'Ana Pérez',
    numeroDocumento: '123',
    estado,
    estadoDesde: '2026-01-12T00:00:00Z',
    estadoSfsf: null,
    fechaPostulacion: '2026-01-11T00:00:00Z',
    origenPostulacion: 'LinkedIn',
    scoreAfinidad: null,
    rankingPosicion: null,
    esperandoDecision: false,
    compuertaPendiente: null,
    desgloseAfinidad: null,
    integraciones: [],
    identidadRevelada: true,
    tipoCandidato: 'INTERNO' as TipoCandidato,
    sincronizacionSfsf: {
      estado: 'SINCRONIZADO',
      ultimaSincronizacion: null,
      intentos: 0,
      ultimoError: null,
    },
    ...overrides,
  };
}

describe('SeguimientoAnonimizacion', () => {
  it('sin candidato muestra el estado vacío', () => {
    render(<SeguimientoAnonimizacion {...base} candidato={null} />);
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('cargando y sin candidato previo muestra la barra de progreso', () => {
    render(<SeguimientoAnonimizacion {...base} candidato={null} cargando />);
    expect(screen.getByLabelText('Cargando seguimiento')).toBeInTheDocument();
  });

  it('con error muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoAnonimizacion
        {...base}
        candidato={null}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });

  it('con candidato en revisión muestra nombre, frase de espera, antigüedad y distintivo', () => {
    render(
      <SeguimientoAnonimizacion
        {...base}
        candidato={candidato('EN_REVISION_LIDER', { tipoCandidato: 'EXTERNO' })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('En revisión del líder')).toBeInTheDocument();
    expect(screen.getByText(/Esperando su decisión/i)).toBeInTheDocument();
    expect(screen.getByText(/En este estado desde/i)).toBeInTheDocument();
    expect(screen.getByText('Externo')).toBeInTheDocument();
    expect(screen.getByText(/envío al líder son automáticos/i)).toBeInTheDocument();
  });

  it('con candidato rechazado por el líder muestra la frase de descarte', () => {
    render(<SeguimientoAnonimizacion {...base} candidato={candidato('RECHAZADO_LIDER')} />);
    expect(screen.getByText(/El líder descartó al candidato/i)).toBeInTheDocument();
  });

  it('muestra el aviso de sincronización fallida cuando aplica', () => {
    render(
      <SeguimientoAnonimizacion
        {...base}
        candidato={candidato('EN_REVISION_LIDER', {
          sincronizacionSfsf: {
            estado: 'FALLIDA',
            ultimaSincronizacion: null,
            intentos: 2,
            ultimoError: 'error de red',
          },
        })}
      />,
    );

    expect(
      screen.getByText(/La sincronización con SuccessFactors falló\. error de red/),
    ).toBeInTheDocument();
  });

  it('renderiza el enlace "Ver detalle completo" solo si se pasa el callback', async () => {
    const onVerDetalleCompleto = vi.fn();
    const usuario = userEvent.setup();
    const { rerender } = render(
      <SeguimientoAnonimizacion {...base} candidato={candidato('INFORME_INCOGNITO')} />,
    );
    expect(screen.queryByRole('button', { name: 'Ver detalle completo' })).not.toBeInTheDocument();

    rerender(
      <SeguimientoAnonimizacion
        {...base}
        candidato={candidato('INFORME_INCOGNITO')}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );
    await usuario.click(screen.getByRole('button', { name: 'Ver detalle completo' }));
    expect(onVerDetalleCompleto).toHaveBeenCalledOnce();
  });
});
