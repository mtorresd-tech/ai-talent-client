import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GebAuthContext, RequireRole, type GebAuthContextValue } from '@geb/auth';
import { crearClienteApiFalso, type ClienteApiFalso } from '../test/clienteApiFalso';
import { renderConTema } from '../test/renderConTema';
import { ROL_LIDER, ROL_RECLUTADOR } from '../shared/tipos/dominio';
import { SesionApiContext, type SesionApiContextValue } from '../shared/auth/SesionApiContext';
import { AppRouter } from './router';

function sesionApi(sesionSinRol = false): SesionApiContextValue {
  return { sesionSinRol, marcarSesionSinRol: vi.fn(), limpiarSesionSinRol: vi.fn() };
}

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

/**
 * La subpágina de detalle del candidato se monta en `router.tsx` envuelta en
 * `<RequireRole roles={[ROL_RECLUTADOR]}>`. Aquí se verifica esa composición
 * de guard + ruta con `:jobApplicationId`, sin montar todo el `AppLayout`.
 */
function auth(roles: string[]): GebAuthContextValue {
  return {
    estado: 'autenticado',
    usuario: { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles, tenant: 'geb' },
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout: async () => undefined,
  };
}

function renderRutaGuardada(roles: string[]): void {
  const contenido: ReactNode = (
    <GebAuthContext.Provider value={auth(roles)}>
      <MemoryRouter initialEntries={['/procesos/candidato/APP-1?vacante=REQ-1&paso=SELECTA']}>
        <Routes>
          <Route
            path="/procesos/candidato/:jobApplicationId"
            element={
              <RequireRole roles={[ROL_RECLUTADOR]}>
                <div>Detalle del candidato APP-1</div>
              </RequireRole>
            }
          />
        </Routes>
      </MemoryRouter>
    </GebAuthContext.Provider>
  );
  render(contenido);
}

describe('guard de /procesos/candidato/:jobApplicationId', () => {
  it('bloquea a un usuario con rol LIDER', () => {
    renderRutaGuardada([ROL_LIDER]);

    expect(screen.queryByText('Detalle del candidato APP-1')).not.toBeInTheDocument();
    expect(screen.getByText(/No tienes permisos/i)).toBeInTheDocument();
  });

  it('deja pasar a un usuario con rol RECLUTADOR', () => {
    renderRutaGuardada([ROL_RECLUTADOR]);

    expect(screen.getByText('Detalle del candidato APP-1')).toBeInTheDocument();
  });
});

/** Construye un `GebAuthContextValue` con el `estado` y los roles pedidos. */
function authConEstado(
  estado: GebAuthContextValue['estado'],
  roles: string[],
): GebAuthContextValue {
  return {
    estado,
    usuario:
      estado === 'autenticado'
        ? { id: 'u1', nombre: 'Ana', correo: 'ana@geb.com.co', roles, tenant: 'geb' }
        : null,
    obtenerToken: async () => 'token',
    login: async () => undefined,
    logout: async () => undefined,
  };
}

function renderAppRouter(
  estado: GebAuthContextValue['estado'],
  roles: string[] = [],
  sesionSinRol = false,
): void {
  renderConTema(
    <SesionApiContext.Provider value={sesionApi(sesionSinRol)}>
      <GebAuthContext.Provider value={authConEstado(estado, roles)}>
        <MemoryRouter initialEntries={['/procesos']}>
          <AppRouter />
        </MemoryRouter>
      </GebAuthContext.Provider>
    </SesionApiContext.Provider>,
  );
}

describe('AppRouter — estados de sesión', () => {
  it('con estado "cargando" renderiza PantallaCargaSesion en vez de null', () => {
    const { container } = render(
      <SesionApiContext.Provider value={sesionApi()}>
        <GebAuthContext.Provider value={authConEstado('cargando', [])}>
          <MemoryRouter>
            <AppRouter />
          </MemoryRouter>
        </GebAuthContext.Provider>
      </SesionApiContext.Provider>,
    );

    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Cargando tu sesión…')).toBeInTheDocument();
  });

  it('con estado "autenticado" y rol RECLUTADOR monta AppLayout con la vista de reclutador', async () => {
    contenedorMock.cliente = crearClienteApiFalso();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderAppRouter('autenticado', [ROL_RECLUTADOR]);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Procesos de selección activos' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tu cuenta no tiene acceso a IA Talento')).not.toBeInTheDocument();
  });

  it('con estado "autenticado" y rol LIDER_VACANTE monta AppLayout con la vista de líder', async () => {
    contenedorMock.cliente = crearClienteApiFalso();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderAppRouter('autenticado', [ROL_LIDER]);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Informe Incógnito' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tu cuenta no tiene acceso a IA Talento')).not.toBeInTheDocument();
  });

  it('con estado "autenticado" y sin RECLUTADOR ni LIDER_VACANTE renderiza PaginaSinAcceso', () => {
    renderAppRouter('autenticado', []);

    expect(screen.getByText('Tu cuenta no tiene acceso a IA Talento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Procesos de selección activos' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Informe Incógnito' }),
    ).not.toBeInTheDocument();
  });

  it('con rol RECLUTADOR válido pero sesionSinRol=true renderiza PaginaSinAcceso', () => {
    renderAppRouter('autenticado', [ROL_RECLUTADOR], true);

    expect(screen.getByText('Tu cuenta no tiene acceso a IA Talento')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Procesos de selección activos' }),
    ).not.toBeInTheDocument();
  });

  it('con rol RECLUTADOR válido y sesionSinRol=false monta AppLayout con normalidad', async () => {
    contenedorMock.cliente = crearClienteApiFalso();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderAppRouter('autenticado', [ROL_RECLUTADOR], false);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Procesos de selección activos' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tu cuenta no tiene acceso a IA Talento')).not.toBeInTheDocument();
  });
});
