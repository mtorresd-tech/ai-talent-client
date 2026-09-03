import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { CandidatoDetalle } from '../api/candidatos';
import { PASO_INICIAL } from '../logica/pipelineReclutador';
import { useContextoOrigen } from './useContextoOrigen';

const candidato = { jobApplicationId: 'APP-1', jobRequisitionId: 'REQ-9' } as CandidatoDetalle;

function wrapperCon(entrada: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[entrada]}>
        <Routes>
          <Route path="/procesos/candidato/:jobApplicationId" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe('useContextoOrigen', () => {
  it('sin query params aplica los respaldos y arma urlVolver', () => {
    const { result } = renderHook(() => useContextoOrigen(candidato), {
      wrapper: wrapperCon('/procesos/candidato/APP-1'),
    });

    expect(result.current.jobApplicationId).toBe('APP-1');
    expect(result.current.jobRequisitionId).toBe('REQ-9');
    expect(result.current.claveEtapa).toBe(PASO_INICIAL);
    expect(result.current.urlVolver).toBe(
      `/procesos?vacante=REQ-9&paso=${PASO_INICIAL}&candidato=APP-1`,
    );
  });

  it('toma vacante y paso de los query params cuando están', () => {
    const { result } = renderHook(() => useContextoOrigen(candidato), {
      wrapper: wrapperCon('/procesos/candidato/APP-1?vacante=REQ-1&paso=BLUESITE'),
    });

    expect(result.current.jobRequisitionId).toBe('REQ-1');
    expect(result.current.claveEtapa).toBe('BLUESITE');
    expect(result.current.urlVolver).toBe('/procesos?vacante=REQ-1&paso=BLUESITE&candidato=APP-1');
  });

  it('sin candidato ni query params deja la vacante en null', () => {
    const { result } = renderHook(() => useContextoOrigen(null), {
      wrapper: wrapperCon('/procesos/candidato/APP-1'),
    });

    expect(result.current.jobRequisitionId).toBeNull();
    expect(result.current.claveEtapa).toBe(PASO_INICIAL);
  });
});
