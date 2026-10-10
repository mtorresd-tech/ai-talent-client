import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { GebAuthContext, type GebAuthContextValue } from '@geb/auth';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { renderConTema } from '../../../test/renderConTema';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';
import { PortalActivoProvider } from '../../../shared/auth/PortalActivoContext';
import type { Notificacion } from '../api/notificaciones';
import { PaginaNotificaciones } from './PaginaNotificaciones';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

function auth(roles: string[]): GebAuthContextValue {
  return {
    estado: 'autenticado',
    usuario: { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles, tenant: 'geb' },
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout: async () => undefined,
  };
}

function MostrarUbicacion() {
  const ubicacion = useLocation();
  return <div data-testid="ubicacion">{`${ubicacion.pathname}${ubicacion.search}`}</div>;
}

function renderPagina(roles: string[]) {
  return renderConTema(
    <GebAuthContext.Provider value={auth(roles)}>
      <PortalActivoProvider>
        <MemoryRouter initialEntries={['/notificaciones']}>
          <MostrarUbicacion />
          <Routes>
            <Route path="/notificaciones" element={<PaginaNotificaciones />} />
            <Route path="/procesos" element={<div>Vista de pipeline</div>} />
          </Routes>
        </MemoryRouter>
      </PortalActivoProvider>
    </GebAuthContext.Provider>,
  );
}

function notificacion(id: string, overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id,
    jobRequisitionId: 'REQ-1',
    jobApplicationId: `ja_${id}`,
    tipo: 'INFORME_SELECTA_LISTO',
    mensaje: `Notificación ${id}`,
    creadaEn: '2026-09-12T14:30:00Z',
    leida: false,
    ...overrides,
  };
}

beforeEach(() => {
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  sessionStorage.clear();
});

describe('PaginaNotificaciones · Reclutador', () => {
  it('clic en INFORME_ANONIMIZACION_LISTO marca como leída y navega a la vista de pipeline en el paso correspondiente', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR]);

    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&paso=ANONIMIZACION&candidato=ja_1',
      ),
    );
  });

  it('clic en una notificación ya leída no llama al POST y navega directo', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { leida: true })]);

    renderPagina([ROL_RECLUTADOR]);

    await usuario.click(await screen.findByText('Notificación 1'));

    expect(cliente.post).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&paso=SELECTA&candidato=ja_1',
      ),
    );
  });

  it('clic en una notificación MATRIZ_REVISADA_POR_EL_LIDER navega al paso Matriz de selección', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'MATRIZ_REVISADA_POR_EL_LIDER' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&paso=MATRIZ_SELECCION&candidato=ja_1',
      ),
    );
  });

  it('clic en una notificación MATRIZ_ENVIADA_AL_LIDER marca como leída pero no navega', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'MATRIZ_ENVIADA_AL_LIDER' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });

  it('cambiar el filtro a "No leídas" reconsulta al servidor con leida=false', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([]);

    renderPagina([ROL_RECLUTADOR]);
    await waitFor(() => expect(cliente.get).toHaveBeenCalled());

    await usuario.click(screen.getByRole('button', { name: 'No leídas' }));

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.at(-1);
      expect(llamada?.[1].params).toEqual({ leida: false });
    });
  });

  it('sin notificaciones muestra "No tienes notificaciones"', async () => {
    cliente.get.mockResolvedValue([]);
    renderPagina([ROL_RECLUTADOR]);
    expect(await screen.findByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('filtro "No leídas" sin resultados muestra "Estás al día"', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([]);
    renderPagina([ROL_RECLUTADOR]);
    await waitFor(() => expect(cliente.get).toHaveBeenCalled());

    await usuario.click(screen.getByRole('button', { name: 'No leídas' }));

    expect(await screen.findByText('Estás al día')).toBeInTheDocument();
  });

  it('si falla el POST de marcar leída, revierte la marca y no navega', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1')]);
    cliente.post.mockRejectedValue(errorApi(500));

    renderPagina([ROL_RECLUTADOR]);
    await usuario.click(await screen.findByText('Notificación 1'));

    expect(await screen.findByText(/no se pudo marcar/i)).toBeInTheDocument();
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });
});

describe('PaginaNotificaciones · Líder', () => {
  it('clic en INFORME_ANONIMIZACION_LISTO marca como leída y navega a la vista de pipeline sin paso', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&candidato=ja_1',
      ),
    );
  });

  it('clic en INFORME_SELECTA_LISTO marca como leída pero nunca navega', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_SELECTA_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });

  it('clic en una notificación MATRIZ_REVISADA_POR_EL_LIDER marca como leída pero nunca navega', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'MATRIZ_REVISADA_POR_EL_LIDER' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });
});

describe('PaginaNotificaciones · usuario con ambos roles', () => {
  it('sigue el portal activo guardado (Líder), no el primer rol real (Reclutador)', async () => {
    sessionStorage.setItem('selecta:portal-activo', 'LIDER');
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR, ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&candidato=ja_1',
      ),
    );
  });

  it('sin preferencia guardada, el default (portal Reclutador) agrega "paso=ANONIMIZACION" a la ruta', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR, ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&paso=ANONIMIZACION&candidato=ja_1',
      ),
    );
  });
});
