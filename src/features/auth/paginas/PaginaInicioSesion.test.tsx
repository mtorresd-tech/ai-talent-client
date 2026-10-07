import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { GebAuthContext, type GebAuthContextValue, type EstadoSesion } from '@geb/auth';
import { DevAuthContext, type DevAuthContextValue } from '../../../shared/auth/DevAuthContext';
import { PaginaInicioSesion } from './PaginaInicioSesion';

const CLAVE_RUTA_DESTINO = 'selecta:ruta-destino-login';

function auth(estado: EstadoSesion, login = vi.fn()): GebAuthContextValue {
  return {
    estado,
    usuario: null,
    obtenerToken: async () => 'token',
    login,
    logout: async () => undefined,
  };
}

/** Expone la ruta actual del router, para verificar navegaciones disparadas desde dentro de la página. */
function MostrarUbicacion() {
  const ubicacion = useLocation();
  return <div data-testid="ubicacion">{`${ubicacion.pathname}${ubicacion.search}`}</div>;
}

function renderPagina(
  estado: EstadoSesion,
  devAuth: DevAuthContextValue | null,
  login = vi.fn(),
  rutaInicial = '/',
): void {
  const contenido: ReactNode = (
    <GebAuthContext.Provider value={auth(estado, login)}>
      <DevAuthContext.Provider value={devAuth}>
        <MemoryRouter initialEntries={[rutaInicial]}>
          <PaginaInicioSesion />
          <MostrarUbicacion />
        </MemoryRouter>
      </DevAuthContext.Provider>
    </GebAuthContext.Provider>
  );
  render(contenido);
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('PaginaInicioSesion — modo real', () => {
  it('renderiza título, subtítulo, botón de Entra ID y pie de contacto en estado no-autenticado', () => {
    renderPagina('no-autenticado', null);

    // "Selecta 2.0" va en un `<span>` propio dentro del `<h2>` (coloreado en
    // azul de marca); se verifica el texto combinado del heading en vez de
    // buscar la cadena exacta, que podría fallar por cómo se parte el markup.
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Bienvenido a Selecta 2.0');
    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('¿No tienes acceso? Contacta al administrador de tu empresa.'),
    ).toBeInTheDocument();
  });

  it('renderiza el mensaje de error con role="alert" en estado error', () => {
    renderPagina('error', null);

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('No se pudo iniciar sesión. Intenta de nuevo.');
  });

  it('deshabilita el botón y muestra un spinner en estado cargando', () => {
    renderPagina('cargando', null);

    const boton = screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' });
    expect(boton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('invoca login() exactamente una vez al hacer click en el botón de Entra ID', async () => {
    const login = vi.fn();
    const usuario = userEvent.setup();
    renderPagina('no-autenticado', null, login);

    await usuario.click(
      screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    );

    expect(login).toHaveBeenCalledTimes(1);
  });

  it('si el login se dispara ya desde "/", no guarda ninguna ruta destino ni navega', async () => {
    const login = vi.fn();
    const usuario = userEvent.setup();
    renderPagina('no-autenticado', null, login, '/');

    await usuario.click(
      screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    );

    expect(sessionStorage.getItem(CLAVE_RUTA_DESTINO)).toBeNull();
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/');
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('si el login se dispara desde una ruta profunda, la guarda y navega a "/" antes de llamar login()', async () => {
    const login = vi.fn();
    const usuario = userEvent.setup();
    renderPagina('no-autenticado', null, login, '/procesos/candidato/123?vacante=REQ-1');

    await usuario.click(
      screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    );

    expect(sessionStorage.getItem(CLAVE_RUTA_DESTINO)).toBe(
      '/procesos/candidato/123?vacante=REQ-1',
    );
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/');
    expect(login).toHaveBeenCalledTimes(1);
  });
});

describe('PaginaInicioSesion — modo desarrollo', () => {
  function devAuth(iniciarSesion = vi.fn()): DevAuthContextValue {
    return { iniciarSesion };
  }

  it('renderiza el formulario de correo/contraseña, los checkboxes de rol y el Alert de advertencia', () => {
    renderPagina('no-autenticado', devAuth());

    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Reclutador' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Líder de área' })).toBeInTheDocument();
    expect(
      screen.getByText(/Modo desarrollo: no hay app registration de Entra ID configurado/),
    ).toBeInTheDocument();
  });

  it('arranca con "Reclutador" marcado e inicia sesión solo con ese rol', async () => {
    const usuario = userEvent.setup();
    const iniciarSesion = vi.fn();
    renderPagina('no-autenticado', devAuth(iniciarSesion));

    expect(screen.getByRole('checkbox', { name: 'Reclutador' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Líder de área' })).not.toBeChecked();

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@geb.com.co');
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(iniciarSesion).toHaveBeenCalledWith('ana@geb.com.co', ['RECLUTADOR']);
  });

  it('permite marcar ambos checkboxes a la vez e inicia sesión con los dos roles', async () => {
    const usuario = userEvent.setup();
    const iniciarSesion = vi.fn();
    renderPagina('no-autenticado', devAuth(iniciarSesion));

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@geb.com.co');
    await usuario.click(screen.getByRole('checkbox', { name: 'Líder de área' }));
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(iniciarSesion).toHaveBeenCalledWith('ana@geb.com.co', ['RECLUTADOR', 'LIDER_VACANTE']);
  });

  it('deshabilita "Iniciar sesión" si ningún checkbox de rol está marcado', async () => {
    const usuario = userEvent.setup();
    renderPagina('no-autenticado', devAuth());

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@geb.com.co');
    await usuario.click(screen.getByRole('checkbox', { name: 'Reclutador' }));

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
  });

  it('mantiene el botón "Iniciar sesión" deshabilitado con correo vacío', async () => {
    const usuario = userEvent.setup();
    renderPagina('no-autenticado', devAuth());

    const boton = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(boton).toBeDisabled();

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@geb.com.co');
    expect(boton).toBeEnabled();
  });
});

describe('PaginaInicioSesion — PanelHeroLogin', () => {
  it('renderiza el título, el subtítulo y los 3 puntos de beneficio', () => {
    renderPagina('no-autenticado', null);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Selecta 2.0');
    expect(
      screen.getByText('Plataforma de automatización de selección con IA.'),
    ).toBeInTheDocument();

    expect(screen.getByText('IA que entiende talento')).toBeInTheDocument();
    expect(
      screen.getByText('Analizamos hojas de vida y perfiles para identificar el mejor match.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Evaluaciones confiables')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Integramos pruebas psicotécnicas, validaciones de seguridad y exámenes médicos.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Decisiones basadas en datos')).toBeInTheDocument();
    expect(
      screen.getByText('Dashboards e informes para una gestión eficiente y transparente.'),
    ).toBeInTheDocument();
  });
});

describe('PaginaInicioSesion — integración', () => {
  it('cambia entre FormularioAccesoReal y FormularioAccesoDesarrollo sin afectar el panel izquierdo', () => {
    const { rerender } = render(
      <GebAuthContext.Provider value={auth('no-autenticado')}>
        <DevAuthContext.Provider value={null}>
          <MemoryRouter>
            <PaginaInicioSesion />
          </MemoryRouter>
        </DevAuthContext.Provider>
      </GebAuthContext.Provider>,
    );

    expect(
      screen.getByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Selecta 2.0');

    rerender(
      <GebAuthContext.Provider value={auth('no-autenticado')}>
        <DevAuthContext.Provider value={{ iniciarSesion: vi.fn() }}>
          <MemoryRouter>
            <PaginaInicioSesion />
          </MemoryRouter>
        </DevAuthContext.Provider>
      </GebAuthContext.Provider>,
    );

    expect(
      screen.queryByRole('button', { name: 'Iniciar sesión con Microsoft Entra ID' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    // El panel izquierdo (mismo contenido estático) sigue montado sin cambios.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Selecta 2.0');
  });
});
