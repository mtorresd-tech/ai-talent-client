import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GebAuthContext, type GebAuthContextValue } from '@geb/auth';
import { renderConTema } from '../../../test/renderConTema';
import {
  SesionApiContext,
  type SesionApiContextValue,
} from '../../../shared/auth/SesionApiContext';
import { PaginaSinAcceso } from './PaginaSinAcceso';

function auth(logout = vi.fn()): GebAuthContextValue {
  return {
    estado: 'autenticado',
    usuario: { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles: [], tenant: 'geb' },
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout,
  };
}

function sesionApi(sesionSinRol = false, limpiarSesionSinRol = vi.fn()): SesionApiContextValue {
  return { sesionSinRol, marcarSesionSinRol: vi.fn(), limpiarSesionSinRol };
}

function renderPagina(logout = vi.fn(), sesion: SesionApiContextValue = sesionApi()) {
  return renderConTema(
    <SesionApiContext.Provider value={sesion}>
      <GebAuthContext.Provider value={auth(logout)}>
        <PaginaSinAcceso />
      </GebAuthContext.Provider>
    </SesionApiContext.Provider>,
  );
}

describe('PaginaSinAcceso', () => {
  it('muestra el mensaje de sin rol asignado y el botón "Cerrar sesión"', () => {
    renderPagina();

    expect(screen.getByText('Tu cuenta no tiene acceso a Selecta 2.0')).toBeInTheDocument();
    expect(screen.getByText(/No tienes un rol asignado en la aplicación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('invoca logout() exactamente una vez al hacer click en "Cerrar sesión"', async () => {
    const logout = vi.fn();
    const usuario = userEvent.setup();
    renderPagina(logout);

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('con sesionSinRol=true, el click en "Cerrar sesión" invoca logout() y limpiarSesionSinRol()', async () => {
    const logout = vi.fn();
    const limpiarSesionSinRol = vi.fn();
    const usuario = userEvent.setup();
    renderPagina(logout, sesionApi(true, limpiarSesionSinRol));

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(limpiarSesionSinRol).toHaveBeenCalledTimes(1);
  });

  it('con un contexto de sesión con estado real, tras el click sesionSinRol queda en false', async () => {
    const logout = vi.fn();
    const usuario = userEvent.setup();

    function ProveedorSesionApiDePrueba({ children }: { children: ReactNode }) {
      const [sesionSinRol, setSesionSinRol] = useState(true);
      const value: SesionApiContextValue = {
        sesionSinRol,
        marcarSesionSinRol: () => setSesionSinRol(true),
        limpiarSesionSinRol: () => setSesionSinRol(false),
      };
      return (
        <SesionApiContext.Provider value={value}>
          <span>sesionSinRol: {String(sesionSinRol)}</span>
          {children}
        </SesionApiContext.Provider>
      );
    }

    renderConTema(
      <ProveedorSesionApiDePrueba>
        <GebAuthContext.Provider value={auth(logout)}>
          <PaginaSinAcceso />
        </GebAuthContext.Provider>
      </ProveedorSesionApiDePrueba>,
    );

    expect(screen.getByText('sesionSinRol: true')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(screen.getByText('sesionSinRol: false')).toBeInTheDocument();
  });
});
