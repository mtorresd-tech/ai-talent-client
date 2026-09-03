import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GebAuthContext, RequireRole, type GebAuthContextValue } from '@geb/auth';
import { ROL_LIDER, ROL_RECLUTADOR } from '../shared/tipos/dominio';

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
