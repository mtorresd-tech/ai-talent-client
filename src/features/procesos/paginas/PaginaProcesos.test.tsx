import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GebAuthContext, type GebAuthContextValue } from '@geb/auth';
import { PortalActivoProvider } from '../../../shared/auth/PortalActivoContext';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';
import { PaginaProcesos } from './PaginaProcesos';

vi.mock('./PaginaProcesosReclutador', () => ({
  PaginaProcesosReclutador: () => <div>Vista de Reclutador</div>,
}));
vi.mock('./PaginaProcesosLider', () => ({
  PaginaProcesosLider: () => <div>Vista de Líder</div>,
}));

function auth(roles: string[]): GebAuthContextValue {
  return {
    estado: 'autenticado',
    usuario: { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles, tenant: 'geb' },
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout: async () => undefined,
  };
}

function renderPagina(roles: string[]) {
  return render(
    <GebAuthContext.Provider value={auth(roles)}>
      <PortalActivoProvider>
        <PaginaProcesos />
      </PortalActivoProvider>
    </GebAuthContext.Provider>,
  );
}

describe('PaginaProcesos', () => {
  it('con portal Reclutador activo (usuario con un solo rol RECLUTADOR) renderiza la vista de reclutador', () => {
    renderPagina([ROL_RECLUTADOR]);

    expect(screen.getByText('Vista de Reclutador')).toBeInTheDocument();
    expect(screen.queryByText('Vista de Líder')).not.toBeInTheDocument();
  });

  it('con portal Líder activo (usuario con un solo rol LIDER_VACANTE) renderiza la vista de líder', () => {
    renderPagina([ROL_LIDER]);

    expect(screen.getByText('Vista de Líder')).toBeInTheDocument();
    expect(screen.queryByText('Vista de Reclutador')).not.toBeInTheDocument();
  });

  it('con ambos roles, sin preferencia guardada, el default (portal Reclutador) renderiza la vista de reclutador', () => {
    renderPagina([ROL_RECLUTADOR, ROL_LIDER]);

    expect(screen.getByText('Vista de Reclutador')).toBeInTheDocument();
  });
});
