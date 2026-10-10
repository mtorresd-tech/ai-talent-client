import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { GebAuthContext, type GebAuthContextValue } from '@geb/auth';
import { crearClienteApiFalso, type ClienteApiFalso } from '../../test/clienteApiFalso';
import { renderConTema } from '../../test/renderConTema';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../shared/tipos/dominio';
import { PortalActivoProvider } from '../../shared/auth/PortalActivoContext';
import type { Notificacion } from '../../features/notificaciones/api/notificaciones';
import { AppLayout } from './AppLayout';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

beforeEach(() => {
  sessionStorage.clear();
});

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

function notificacion(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'ntf_1',
    jobRequisitionId: 'REQ-1',
    jobApplicationId: 'ja_1',
    tipo: 'INFORME_SELECTA_LISTO',
    mensaje: 'El informe de Selecta está listo',
    creadaEn: '2026-09-12T14:30:00Z',
    leida: false,
    ...overrides,
  };
}

/** Expone la ruta actual del router, para verificar navegaciones disparadas desde dentro de `AppLayout`. */
function MostrarUbicacion() {
  const ubicacion = useLocation();
  return <div data-testid="ubicacion">{`${ubicacion.pathname}${ubicacion.search}`}</div>;
}

function renderAppLayout(rutaInicial = '/procesos') {
  return renderConTema(
    <GebAuthContext.Provider value={auth}>
      <PortalActivoProvider>
        <MemoryRouter initialEntries={[rutaInicial]}>
          <AppLayout>
            <div>Contenido</div>
          </AppLayout>
          <MostrarUbicacion />
        </MemoryRouter>
      </PortalActivoProvider>
    </GebAuthContext.Provider>,
  );
}

function renderAppLayoutConRoles(roles: string[], rutaInicial = '/procesos') {
  const authConRoles: GebAuthContextValue = {
    ...auth,
    usuario: { ...auth.usuario!, roles },
  };
  return renderConTema(
    <GebAuthContext.Provider value={authConRoles}>
      <PortalActivoProvider>
        <MemoryRouter initialEntries={[rutaInicial]}>
          <AppLayout>
            <div>Contenido</div>
          </AppLayout>
          <MostrarUbicacion />
        </MemoryRouter>
      </PortalActivoProvider>
    </GebAuthContext.Provider>,
  );
}

/** Responde distinto según `leida`: así se distingue la bandeja completa del contador de no leídas. */
function mockearNotificaciones(
  cliente: ClienteApiFalso,
  todas: Notificacion[],
  noLeidas: Notificacion[] = todas.filter((n) => !n.leida),
) {
  cliente.get.mockImplementation((url: string, config?: { params?: { leida?: boolean } }) => {
    if (url === '/notificaciones') {
      return Promise.resolve(config?.params?.leida === false ? noLeidas : todas);
    }
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
}

describe('AppLayout', () => {
  it('al montar consulta las últimas notificaciones y el contador de no leídas, y refleja el total en el badge', async () => {
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    mockearNotificaciones(
      cliente,
      [notificacion()],
      [notificacion(), notificacion({ id: 'ntf_2' })],
    );

    renderAppLayout();

    // El badge muestra el total real de no leídas (2), no el tamaño de la
    // lista de las últimas notificaciones (1).
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Notificaciones: 2 sin leer' }),
      ).toBeInTheDocument(),
    );
    // La entrada "Notificaciones" del sidebar refleja el mismo total.
    await waitFor(() =>
      expect(
        within(screen.getByRole('link', { name: /Notificaciones/ })).getByText('2'),
      ).toBeInTheDocument(),
    );
  });

  it('sin notificaciones sin leer, la campana no muestra conteo', async () => {
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    mockearNotificaciones(cliente, [], []);

    renderAppLayout();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument(),
    );
    // Sin no leídas, la entrada del sidebar tampoco muestra badge.
    expect(
      within(screen.getByRole('link', { name: 'Notificaciones' })).queryByText(/^\d+$/),
    ).not.toBeInTheDocument();
  });

  it('al hacer clic en la campana despliega las notificaciones reales con título y fecha, y el pie "Ver todas"', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    mockearNotificaciones(cliente, [
      notificacion({ id: 'ntf_1', mensaje: 'El informe de Selecta está listo' }),
    ]);

    renderAppLayout();
    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(2));

    await usuario.click(screen.getByRole('button', { name: /Notificaciones/ }));

    expect(await screen.findByText('El informe de Selecta está listo')).toBeInTheDocument();
    expect(screen.getByText('Ver todas las notificaciones')).toBeInTheDocument();
  });

  it('clic en una notificación del panel la marca como leída y navega según rutaNotificacion', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    cliente.post.mockResolvedValue({});
    mockearNotificaciones(cliente, [
      notificacion({
        id: 'ntf_1',
        jobRequisitionId: 'REQ-1',
        jobApplicationId: 'ja_1',
        tipo: 'INFORME_SELECTA_LISTO',
        mensaje: 'El informe de Selecta está listo',
        leida: false,
      }),
    ]);

    renderAppLayout();
    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(2));

    await usuario.click(screen.getByRole('button', { name: /Notificaciones/ }));
    await usuario.click(await screen.findByText('El informe de Selecta está listo'));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledWith('/notificaciones/ntf_1/leida'));
    await waitFor(() =>
      expect(screen.getByTestId('ubicacion')).toHaveTextContent(
        '/procesos?vacante=REQ-1&paso=SELECTA&candidato=ja_1',
      ),
    );
  });

  it('clic en "Ver todas las notificaciones" navega a /notificaciones', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    mockearNotificaciones(cliente, [notificacion()]);

    renderAppLayout();
    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(2));

    await usuario.click(screen.getByRole('button', { name: /Notificaciones/ }));
    await usuario.click(await screen.findByText('Ver todas las notificaciones'));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/notificaciones');
  });

  it('si falla la carga de notificaciones, el panel se degrada a vacío sin romper la navbar', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    cliente.get.mockRejectedValue(new Error('fallo de red'));

    renderAppLayout();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument(),
    );
    // El resto de la navegación sigue disponible, aunque la carga falle.
    expect(screen.getByRole('link', { name: 'Procesos' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Notificaciones/ }));

    expect(await screen.findByText('Sin novedades por ahora.')).toBeInTheDocument();
  });

  it('al cambiar de ruta recarga las notificaciones de la navbar', async () => {
    const usuario = userEvent.setup();
    const cliente = crearClienteApiFalso();
    contenedorMock.cliente = cliente;
    mockearNotificaciones(cliente, [notificacion()]);

    renderAppLayout('/metricas');
    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(2));

    await usuario.click(screen.getByRole('link', { name: 'Procesos' }));

    await waitFor(() => expect(cliente.get).toHaveBeenCalledTimes(4));
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

  it('al cerrar sesión elimina los borradores de justificación de la matriz antes de logout', async () => {
    const usuario = userEvent.setup();
    contenedorMock.cliente = crearClienteApiFalso();
    const claveBorrador = 'selecta:borrador-justificacion-matriz:REQ-1:APP-1';
    sessionStorage.setItem(
      claveBorrador,
      JSON.stringify({
        fortalezas: 'Texto',
        oportunidadesDesarrollo: '',
        criterioDesempate: '',
        equivalenciasAplicadas: '',
        observaciones: '',
      }),
    );
    let borradorAlCerrarSesion: string | null = 'sin llamar';
    const logout = vi.fn(async () => {
      borradorAlCerrarSesion = sessionStorage.getItem(claveBorrador);
    });

    renderConTema(
      <GebAuthContext.Provider value={{ ...auth, logout }}>
        <PortalActivoProvider>
          <MemoryRouter initialEntries={['/procesos']}>
            <AppLayout>
              <div>Contenido</div>
            </AppLayout>
          </MemoryRouter>
        </PortalActivoProvider>
      </GebAuthContext.Provider>,
    );

    await usuario.click(screen.getByLabelText('Menú de usuario'));
    await usuario.click(screen.getByText('Cerrar sesión'));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(borradorAlCerrarSesion).toBeNull();
  });

  describe('cambio de portal (usuario con ambos roles)', () => {
    it('con un solo rol, el menú de usuario no ofrece "Cambiar de rol"', async () => {
      const usuario = userEvent.setup();
      contenedorMock.cliente = crearClienteApiFalso();
      renderAppLayoutConRoles([ROL_RECLUTADOR]);

      await usuario.click(screen.getByLabelText('Menú de usuario'));

      expect(screen.queryByText('Cambiar de rol')).not.toBeInTheDocument();
    });

    it('con ambos roles, "Cambiar de rol" abre el diálogo con las dos opciones de portal', async () => {
      const usuario = userEvent.setup();
      contenedorMock.cliente = crearClienteApiFalso();
      renderAppLayoutConRoles([ROL_RECLUTADOR, ROL_LIDER]);

      await usuario.click(screen.getByLabelText('Menú de usuario'));
      await usuario.click(screen.getByText('Cambiar de rol'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Portal Reclutador')).toBeInTheDocument();
      expect(screen.getByText('Portal Líder')).toBeInTheDocument();
    });

    it('con portal Líder activo, "Métricas" no aparece en la navegación', async () => {
      const usuario = userEvent.setup();
      contenedorMock.cliente = crearClienteApiFalso();
      renderAppLayoutConRoles([ROL_RECLUTADOR, ROL_LIDER]);

      await usuario.click(screen.getByLabelText('Menú de usuario'));
      await usuario.click(screen.getByText('Cambiar de rol'));
      await usuario.click(screen.getByText('Portal Líder'));
      await usuario.click(screen.getByRole('button', { name: 'Cambiar' }));

      expect(screen.queryByRole('link', { name: /Métricas/ })).not.toBeInTheDocument();
      // La etiqueta de rol del menú de usuario también sigue al portal activo, no a `roles[0]`.
      expect(screen.getByText('Líder de área')).toBeInTheDocument();
    });

    it('al confirmar un cambio de portal estando en /metricas, navega a /procesos', async () => {
      const usuario = userEvent.setup();
      contenedorMock.cliente = crearClienteApiFalso();
      renderAppLayoutConRoles([ROL_RECLUTADOR, ROL_LIDER], '/metricas');

      await usuario.click(screen.getByLabelText('Menú de usuario'));
      await usuario.click(screen.getByText('Cambiar de rol'));
      await usuario.click(screen.getByText('Portal Líder'));
      await usuario.click(screen.getByRole('button', { name: 'Cambiar' }));

      await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/procesos'));
    });

    it('cancelar el diálogo no cambia el portal activo', async () => {
      const usuario = userEvent.setup();
      contenedorMock.cliente = crearClienteApiFalso();
      renderAppLayoutConRoles([ROL_RECLUTADOR, ROL_LIDER]);

      await usuario.click(screen.getByLabelText('Menú de usuario'));
      await usuario.click(screen.getByText('Cambiar de rol'));
      await usuario.click(screen.getByText('Portal Líder'));
      await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.getByText('Reclutador')).toBeInTheDocument();
    });
  });
});
