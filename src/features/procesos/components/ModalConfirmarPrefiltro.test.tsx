import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CandidatoResumen } from '../api/candidatos';
import { ModalConfirmarPrefiltro } from './ModalConfirmarPrefiltro';

function candidato(id: string, nombre: string, ranking: number): CandidatoResumen {
  return {
    jobApplicationId: id,
    jobRequisitionId: 'v1',
    alias: `Candidato ${ranking}`,
    nombre,
    numeroDocumento: null,
    estado: 'RANKING_SELECTA',
    estadoDesde: '2026-01-01',
    estadoSfsf: null,
    fechaPostulacion: null,
    origenPostulacion: null,
    scoreAfinidad: 80,
    rankingPosicion: ranking,
    esperandoDecision: true,
    compuertaPendiente: 'RANKING',
  };
}

const base = {
  abierto: true,
  seleccionados: [candidato('a', 'Ana Pérez', 1), candidato('b', 'Beto Ruiz', 2)],
  enviando: false,
  progreso: null,
  resultado: null,
  onCancelar: vi.fn(),
  onConfirmar: vi.fn(),
  onCerrar: vi.fn(),
};

describe('ModalConfirmarPrefiltro', () => {
  it('lista los candidatos seleccionados y el aviso de SAP', () => {
    render(<ModalConfirmarPrefiltro {...base} />);

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Beto Ruiz')).toBeInTheDocument();
    expect(screen.getByText(/SAP SuccessFactors/)).toBeInTheDocument();
  });

  it('"Cancelar" no dispara el envío', async () => {
    const onCancelar = vi.fn();
    const onConfirmar = vi.fn();
    render(<ModalConfirmarPrefiltro {...base} onCancelar={onCancelar} onConfirmar={onConfirmar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('"Confirmar" dispara el envío', async () => {
    const onConfirmar = vi.fn();
    render(<ModalConfirmarPrefiltro {...base} onConfirmar={onConfirmar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('muestra el progreso mientras envía', () => {
    render(<ModalConfirmarPrefiltro {...base} enviando progreso={{ procesados: 2, total: 5 }} />);

    expect(screen.getByText(/2 de 5/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('muestra el resumen de fallo parcial y solo el botón Cerrar', () => {
    render(
      <ModalConfirmarPrefiltro
        {...base}
        resultado={{
          exitosos: ['a', 'b', 'c'],
          fallidos: [{ id: 'd', motivo: 'Ya fue decidida', correlationId: 'corr-409' }],
        }}
      />,
    );

    expect(screen.getByText(/3 enviados, 1 con error/)).toBeInTheDocument();
    expect(screen.getByText('Ya fue decidida')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });
});
