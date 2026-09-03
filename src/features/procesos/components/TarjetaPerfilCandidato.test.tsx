import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CandidatoDetalle } from '../api/candidatos';
import { TarjetaPerfilCandidato } from './TarjetaPerfilCandidato';

const base = {
  jobApplicationId: 'APP-1',
  jobRequisitionId: 'REQ-1',
  alias: 'Candidato 7',
  nombre: 'Ana Pérez',
  numeroDocumento: '1020304050',
  estado: 'RANKING_SELECTA',
  estadoDesde: '2026-01-01T00:00:00Z',
  estadoSfsf: null,
  fechaPostulacion: '2026-01-02T00:00:00Z',
  origenPostulacion: 'LinkedIn',
  scoreAfinidad: 88,
  rankingPosicion: 1,
  esperandoDecision: true,
  compuertaPendiente: 'RANKING',
  desgloseAfinidad: null,
  integraciones: [],
  identidadRevelada: true,
  sincronizacionSfsf: {
    estado: 'PENDIENTE',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
} as unknown as CandidatoDetalle;

describe('TarjetaPerfilCandidato', () => {
  it('muestra nombre, documento y cargo al que aplica', () => {
    render(
      <TarjetaPerfilCandidato candidato={base} catalogo={null} tituloVacante="Analista de Datos" />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('1020304050')).toBeInTheDocument();
    expect(screen.getByText('Analista de Datos')).toBeInTheDocument();
  });

  it('usa el alias si no hay nombre y omite la fila de documento si falta', () => {
    render(
      <TarjetaPerfilCandidato
        candidato={{ ...base, nombre: null, numeroDocumento: null }}
        catalogo={null}
        tituloVacante={null}
      />,
    );

    expect(screen.getByText('Candidato 7')).toBeInTheDocument();
    expect(screen.queryByText('Documento')).not.toBeInTheDocument();
  });
});
