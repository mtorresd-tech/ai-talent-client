import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { limpiarCacheCatalogoEstados } from '../hooks/useCatalogoEstados';
import { PaginaDetalleCandidato } from './PaginaDetalleCandidato';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

const detalleCandidato = {
  jobApplicationId: 'APP-1',
  jobRequisitionId: 'REQ-1',
  alias: 'Candidato 1',
  nombre: 'Ana Pérez',
  numeroDocumento: '123',
  estado: 'RANKING_SELECTA',
  estadoDesde: '2026-01-01T00:00:00Z',
  estadoSfsf: null,
  fechaPostulacion: '2026-01-02T00:00:00Z',
  origenPostulacion: 'LinkedIn',
  scoreAfinidad: 80,
  rankingPosicion: 1,
  esperandoDecision: true,
  compuertaPendiente: 'RANKING',
  desgloseAfinidad: {
    porcentajeTotal: 80,
    versionRubrica: '1.0',
    elegible: true,
    motivosNoElegible: [],
    componentes: [
      { componente: 'HABILIDADES_OBLIGATORIAS', peso: 0.3, obtenido: 0.7, aporte: 21, brecha: 9 },
    ],
    calidad: { confianza: 0.7, requiereRevision: false, provisional: false, alertas: [] },
    comentarios: null,
  },
  integraciones: [],
  identidadRevelada: true,
  sincronizacionSfsf: {
    estado: 'PENDIENTE',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

function renderRuta() {
  return render(
    <MemoryRouter initialEntries={['/procesos/candidato/APP-1?vacante=REQ-1&paso=SELECTA']}>
      <Routes>
        <Route path="/procesos/candidato/:jobApplicationId" element={<PaginaDetalleCandidato />} />
        <Route path="/procesos" element={<div>Listado de procesos</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  limpiarCacheCatalogoEstados();
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('PaginaDetalleCandidato', () => {
  it('con 404 del candidato muestra el mensaje y el enlace a Procesos, sin las demás regiones', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/candidatos/APP-1') return Promise.reject(errorApi(404));
      return Promise.resolve([]);
    });

    renderRuta();

    expect(await screen.findByText('No encontramos este candidato')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver a Procesos/i })).toBeInTheDocument();
    expect(screen.queryByText('Evaluaciones de terceros')).not.toBeInTheDocument();
  });

  it('con el historial en error aísla esa región y deja visible el resto', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/candidatos/APP-1') return Promise.resolve(detalleCandidato);
      if (url === '/candidatos/APP-1/historial') return Promise.reject(errorApi(500));
      if (url === '/candidatos/APP-1/prefiltro') return Promise.reject(errorApi(404));
      if (url === '/vacantes/REQ-1') return Promise.resolve({ titulo: 'Analista de Datos' });
      if (url === '/vacantes/REQ-1/pipeline') return Promise.resolve([]);
      if (url === '/catalogos/estados-candidato') return Promise.resolve([]);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    renderRuta();

    expect(await screen.findByText('Match generado por IA')).toBeInTheDocument();
    expect(screen.getByText('Analista de Datos')).toBeInTheDocument();
    expect(screen.getByText('Sin prefiltro')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument(),
    );
  });
});
