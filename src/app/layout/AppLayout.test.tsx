import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GebAuthContext, type GebAuthContextValue } from '@geb/auth';
import { crearClienteApiFalso, type ClienteApiFalso } from '../../test/clienteApiFalso';
import { renderConTema } from '../../test/renderConTema';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../shared/tipos/dominio';
import { AppLayout } from './AppLayout';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

const auth: GebAuthContextValue = {
  estado: 'autenticado',
  usuario: {
    id: 'u1',
    nombre: 'Ana',
    correo: 'ana@geb.com.co',
    roles: [ROL_RECLUTADOR],
    tenant: 'geb',
  },
  obtenerToken: async () => 'token',
  login: async () => undefined,
  logout: async () => undefined,
};

function renderAppLayout(rutaInicial = '/procesos') {
  return renderConTema(
    <GebAuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[rutaInicial]}>
        <AppLayout>
          <div>Contenido</div>
        </AppLayout>
      </MemoryRouter>
    </GebAuthContext.Provider>,
  );
}

function renderAppLayoutConRoles(roles: string[]) {
  const authConRoles: GebAuthContextValue = {
    ...auth,
    usuario: { ...auth.usuario!, roles },
  };
  return renderConTema(
    <GebAuthContext.Provider value={authConRoles}>
      <MemoryRouter initialEntries={['/procesos']}>
        <AppLayout>
          <div>Contenido</div>
        </AppLayout>
      </MemoryRouter>
    </GebAuthContext.Provider>,
  );
}

function estaVisibleElPuntoDeCampana(): boolean {
  const boton = screen.getByRole('button', { name: 'Notificaciones' });
  const punto = boton.querySelector('.MuiBadge-badge');
  return !punto?.className.includes('MuiBadge-invisible');
}

describe('AppLayout', () => {
  it('al montar consulta las notificaciones sin leer y refleja el conteo en el badge de la campana', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([{ id: '1' }, { id: '2' }]);
    contenedorMock.cliente = cliente;

    renderAppLayout();

    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(1));
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/notificaciones');
    expect(config.params).toEqual({ leida: false });

    await waitFor(() => expect(estaVisibleElPuntoDeCampana()).toBe(true));
  });

  it('sin notificaciones sin leer, el badge de la campana queda apagado', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([]);
    contenedorMock.cliente = cliente;

    renderAppLayout();

    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(1));
    expect(estaVisibleElPuntoDeCampana()).toBe(false);
  });

  it('al cambiar de ruta dispara una segunda consulta de notificaciones sin leer', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([{ id: '1' }]);
    contenedorMock.cliente = cliente;

    renderAppLayout('/metricas');

    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(1));

    await usuario.click(screen.getByRole('link', { name: 'Procesos' }));

    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(2));
  });

  it('muestra la etiqueta de rol "Reclutador" en el menú de usuario con ROL_RECLUTADOR', () => {
    contenedorMock.cliente = crearClienteApiFalso();
    renderAppLayoutConRoles([ROL_RECLUTADOR]);

    expect(screen.getByText('Reclutador')).toBeInTheDocument();
  });

  it('muestra la etiqueta de rol "Líder de área" en el menú de usuario con ROL_LIDER', () => {
    contenedorMock.cliente = crearClienteApiFalso();
    renderAppLayoutConRoles([ROL_LIDER]);

    expect(screen.getByText('Líder de área')).toBeInTheDocument();
  });
});
