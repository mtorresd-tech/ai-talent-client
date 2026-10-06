import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GebAuthContext, type GebAuthContextValue, type UsuarioGeb } from '@geb/auth';
import { ROL_LIDER, ROL_RECLUTADOR } from '../tipos/dominio';
import { PortalActivoProvider, usePortalActivo } from './PortalActivoContext';

const CLAVE_PORTAL_ACTIVO = 'selecta:portal-activo';

function usuarioDe(roles: string[]): UsuarioGeb {
  return { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles, tenant: 'geb' };
}

function auth(usuario: UsuarioGeb | null): GebAuthContextValue {
  return {
    estado: usuario ? 'autenticado' : 'no-autenticado',
    usuario,
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout: async () => undefined,
  };
}

function ConsumidorPortalActivo() {
  const { portalActivo, portalesDisponibles, tieneAmbosRoles, cambiarPortal } = usePortalActivo();

  return (
    <div>
      <span>portalActivo: {portalActivo}</span>
      <span>portalesDisponibles: {portalesDisponibles.join(',')}</span>
      <span>tieneAmbosRoles: {String(tieneAmbosRoles)}</span>
      <button onClick={() => cambiarPortal('RECLUTADOR')}>Portal Reclutador</button>
      <button onClick={() => cambiarPortal('LIDER')}>Portal Líder</button>
    </div>
  );
}

function renderConUsuario(usuario: UsuarioGeb | null) {
  return render(
    <GebAuthContext.Provider value={auth(usuario)}>
      <PortalActivoProvider>
        <ConsumidorPortalActivo />
      </PortalActivoProvider>
    </GebAuthContext.Provider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('PortalActivoProvider', () => {
  it('usuario con un solo rol (RECLUTADOR): portalActivo fijo, tieneAmbosRoles=false', () => {
    renderConUsuario(usuarioDe([ROL_RECLUTADOR]));

    expect(screen.getByText('portalActivo: RECLUTADOR')).toBeInTheDocument();
    expect(screen.getByText('tieneAmbosRoles: false')).toBeInTheDocument();
    expect(screen.getByText('portalesDisponibles: RECLUTADOR')).toBeInTheDocument();
  });

  it('usuario con un solo rol (LIDER_VACANTE): portalActivo fijo a LIDER', () => {
    renderConUsuario(usuarioDe([ROL_LIDER]));

    expect(screen.getByText('portalActivo: LIDER')).toBeInTheDocument();
    expect(screen.getByText('tieneAmbosRoles: false')).toBeInTheDocument();
  });

  it('cambiarPortal no tiene efecto con un solo rol', async () => {
    const usuario = userEvent.setup();
    renderConUsuario(usuarioDe([ROL_LIDER]));

    await usuario.click(screen.getByRole('button', { name: 'Portal Reclutador' }));

    expect(screen.getByText('portalActivo: LIDER')).toBeInTheDocument();
    expect(sessionStorage.getItem(CLAVE_PORTAL_ACTIVO)).toBeNull();
  });

  it('usuario con ambos roles sin preferencia guardada: default RECLUTADOR', () => {
    renderConUsuario(usuarioDe([ROL_RECLUTADOR, ROL_LIDER]));

    expect(screen.getByText('portalActivo: RECLUTADOR')).toBeInTheDocument();
    expect(screen.getByText('tieneAmbosRoles: true')).toBeInTheDocument();
  });

  it('respeta la preferencia guardada en sessionStorage si sigue siendo válida', () => {
    sessionStorage.setItem(CLAVE_PORTAL_ACTIVO, 'LIDER');

    renderConUsuario(usuarioDe([ROL_RECLUTADOR, ROL_LIDER]));

    expect(screen.getByText('portalActivo: LIDER')).toBeInTheDocument();
  });

  it('ignora un valor inválido en sessionStorage y recalcula el default', () => {
    sessionStorage.setItem(CLAVE_PORTAL_ACTIVO, 'ALGO_INVALIDO');

    renderConUsuario(usuarioDe([ROL_RECLUTADOR, ROL_LIDER]));

    expect(screen.getByText('portalActivo: RECLUTADOR')).toBeInTheDocument();
  });

  it('ignora una preferencia guardada que no es válida para el usuario actual (p. ej. un solo rol)', () => {
    sessionStorage.setItem(CLAVE_PORTAL_ACTIVO, 'LIDER');

    renderConUsuario(usuarioDe([ROL_RECLUTADOR]));

    expect(screen.getByText('portalActivo: RECLUTADOR')).toBeInTheDocument();
  });

  it('cambiarPortal("LIDER") actualiza el estado en memoria y sessionStorage', async () => {
    const usuario = userEvent.setup();
    renderConUsuario(usuarioDe([ROL_RECLUTADOR, ROL_LIDER]));

    await usuario.click(screen.getByRole('button', { name: 'Portal Líder' }));

    expect(screen.getByText('portalActivo: LIDER')).toBeInTheDocument();
    expect(sessionStorage.getItem(CLAVE_PORTAL_ACTIVO)).toBe('LIDER');
  });

  it('limpia la clave de sessionStorage cuando el usuario pasa a null (logout)', async () => {
    const usuario = userEvent.setup();
    const { rerender } = renderConUsuario(usuarioDe([ROL_RECLUTADOR, ROL_LIDER]));

    await usuario.click(screen.getByRole('button', { name: 'Portal Líder' }));
    expect(sessionStorage.getItem(CLAVE_PORTAL_ACTIVO)).toBe('LIDER');

    rerender(
      <GebAuthContext.Provider value={auth(null)}>
        <PortalActivoProvider>
          <ConsumidorPortalActivo />
        </PortalActivoProvider>
      </GebAuthContext.Provider>,
    );

    expect(sessionStorage.getItem(CLAVE_PORTAL_ACTIVO)).toBeNull();
  });
});
