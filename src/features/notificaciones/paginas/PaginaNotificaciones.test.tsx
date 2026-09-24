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
  return <div data-testid="ubicacion">{ubicacion.pathname}</div>;
}

function renderPagina(roles: string[]) {
  return renderConTema(
    <GebAuthContext.Provider value={auth(roles)}>
      <MemoryRouter initialEntries={['/notificaciones']}>
        <MostrarUbicacion />
        <Routes>
          <Route path="/notificaciones" element={<PaginaNotificaciones />} />
          <Route
            path="/procesos/candidato/:jobApplicationId"
            element={<div>Detalle del candidato</div>}
          />
        </Routes>
      </MemoryRouter>
    </GebAuthContext.Provider>,
  );
}

function notificacion(
  id: string,
  overrides: Partial<{
    tipo: 'INFORME_SELECTA_LISTO' | 'INFORME_ANONIMIZACION_LISTO';
    leida: boolean;
    mensaje: string;
  }> = {},
) {
  return {
    id,
    jobApplicationId: `ja_${id}`,
    tipo: overrides.tipo ?? 'INFORME_SELECTA_LISTO',
    mensaje: overrides.mensaje ?? `Notificación ${id}`,
    creadaEn: '2026-09-12T14:30:00Z',
    leida: overrides.leida ?? false,
  };
}

beforeEach(() => {
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
});

describe('PaginaNotificaciones · Reclutador', () => {
  it('clic en INFORME_ANONIMIZACION_LISTO marca como leída y navega al detalle del candidato', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_RECLUTADOR]);

    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent('/procesos/candidato/ja_1'),
    );
  });

  it('clic en una notificación ya leída no llama al POST y navega directo', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { leida: true })]);

    renderPagina([ROL_RECLUTADOR]);

    await usuario.click(await screen.findByText('Notificación 1'));

    expect(cliente.post).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent('/procesos/candidato/ja_1'),
    );
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
  it('clic en cualquier ítem marca como leída pero nunca navega', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockResolvedValue([notificacion('1', { tipo: 'INFORME_ANONIMIZACION_LISTO' })]);
    cliente.post.mockResolvedValue({ ...notificacion('1'), leida: true });

    renderPagina([ROL_LIDER]);
    await usuario.click(await screen.findByText('Notificación 1'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida'));
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });
});
