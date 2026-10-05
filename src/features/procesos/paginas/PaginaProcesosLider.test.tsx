import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { PaginaProcesosLider } from './PaginaProcesosLider';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

function renderPagina(ui: ReactElement, rutaInicial = '/procesos') {
  return render(<MemoryRouter initialEntries={[rutaInicial]}>{ui}</MemoryRouter>);
}

function MostrarUbicacion() {
  const ubicacion = useLocation();
  return <div data-testid="ubicacion">{`${ubicacion.pathname}${ubicacion.search}`}</div>;
}

function vacante(id: string, titulo: string, conteoPorEstado: Record<string, number> = {}) {
  return {
    jobRequisitionId: id,
    titulo,
    area: 'Tecnología',
    ciudad: 'Bogotá',
    fechaPublicacion: '2026-08-01',
    totalCandidatos: 10,
    pendientesDecision: 0,
    numeroVacantes: 1,
    cerrada: false,
    conteoPorEstado,
  };
}

const listaVacantes = {
  data: [
    vacante('REQ-0001', 'Analista de Datos', { EN_REVISION_LIDER: 1 }),
    vacante('REQ-0002', 'Ingeniero de Redes', { EN_REVISION_LIDER: 2 }),
  ],
  meta: { page: 1, pageSize: 5, total: 2, totalPages: 1 },
};

const informe100 = {
  alias: 'Candidato 100',
  generadoEn: '2026-08-14T00:00:00Z',
  aniosExperienciaTotal: 6.9,
  nivelAcademicoMaximo: 'Especialización',
  experiencia: [],
  estudios: [],
  competencias: ['SQL', 'Python'],
  desgloseAfinidad: {
    porcentajeTotal: 77.7,
    versionRubrica: '1.0',
    elegible: true,
    motivosNoElegible: [],
    componentes: [
      { componente: 'EXPERIENCIA', peso: 0.25, obtenido: 0.89, aporte: 22.25, brecha: 2.75 },
    ],
    calidad: { confianza: 0.8, requiereRevision: false, provisional: false, alertas: [] },
    comentarios: 'Cumple parcialmente; revisar las brechas.',
  },
};

const listaInformesReq1 = {
  data: [informe100],
  meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
};

function candidatoEnRevision(alias: string, jobApplicationId: string) {
  return {
    jobApplicationId,
    jobRequisitionId: 'REQ-0001',
    alias,
    nombre: null,
    numeroDocumento: null,
    estado: 'EN_REVISION_LIDER',
    estadoDesde: '2026-01-01',
    estadoSfsf: null,
    fechaPostulacion: null,
    origenPostulacion: null,
    scoreAfinidad: 80,
    rankingPosicion: null,
    esperandoDecision: true,
    compuertaPendiente: 'LIDER',
  };
}

const listaCandidatosReq1 = {
  data: [candidatoEnRevision('Candidato 100', 'APP-100')],
  meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
};

const listaCandidatosVacia = {
  data: [],
  meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 },
};

beforeEach(() => {
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  cliente.get.mockImplementation((url: string) => {
    if (url === '/vacantes') return Promise.resolve(listaVacantes);
    if (url === '/vacantes/REQ-0001/informes-incognito') return Promise.resolve(listaInformesReq1);
    if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosReq1);
    if (url === '/vacantes/REQ-0002/informes-incognito') {
      return Promise.resolve({
        data: [],
        meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 },
      });
    }
    if (url === '/vacantes/REQ-0002/candidatos') return Promise.resolve(listaCandidatosVacia);
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
});

describe('PaginaProcesosLider', () => {
  it('lista las vacantes del líder y pide seleccionar una para ver sus informes', async () => {
    renderPagina(<PaginaProcesosLider />);

    expect(await screen.findByText('Analista de Datos')).toBeInTheDocument();
    expect(screen.getByText('Ingeniero de Redes')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una vacante para ver sus informes.')).toBeInTheDocument();
    expect(cliente.get).not.toHaveBeenCalledWith(
      '/vacantes/REQ-0001/informes-incognito',
      expect.anything(),
    );
  });

  it('al seleccionar una vacante refleja ?vacante en la URL y carga sus informes', async () => {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosLider />
        <MostrarUbicacion />
      </>,
    );

    await usuario.click(await screen.findByText('Analista de Datos'));

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.find(
        (c) => c[0] === '/vacantes/REQ-0001/informes-incognito',
      );
      expect(llamada?.[1].params).toEqual({ page: 1, pageSize: 5 });
    });
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/procesos?vacante=REQ-0001');
    expect(await screen.findByText('Candidato 100')).toBeInTheDocument();

    const tablaVacantes = screen.getAllByRole('table')[0];
    const fila = within(tablaVacantes).getByText('Analista de Datos').closest('tr') as HTMLElement;
    expect(fila.querySelector('[data-fila-seleccionada]')).not.toBeNull();
  });

  it('cuando la vacante no tiene informes muestra el estado vacío propio, no un error', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Ingeniero de Redes'));

    expect(
      await screen.findByText('Esta vacante no tiene informes anonimizados por revisar.'),
    ).toBeInTheDocument();
  });

  it('si falla la carga de informes muestra EstadoError y reintenta al pulsar el botón', async () => {
    let intentos = 0;
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') return Promise.resolve(listaVacantes);
      if (url === '/vacantes/REQ-0001/informes-incognito') {
        intentos += 1;
        return intentos === 1
          ? Promise.reject(errorApi(500, 'Error del servidor'))
          : Promise.resolve(listaInformesReq1);
      }
      if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosReq1);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));

    await usuario.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Candidato 100')).toBeInTheDocument();
    expect(intentos).toBe(2);
  });

  it('el ícono de ojo abre el modal con los datos de la fila sin una nueva petición', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');

    const llamadasPrevias = cliente.get.mock.calls.length;
    await usuario.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));

    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByText('Candidato 100')).toBeInTheDocument();
    expect(within(dialogo).getByText('SQL')).toBeInTheDocument();
    expect(cliente.get.mock.calls.length).toBe(llamadasPrevias);
  });

  it('al cambiar de vacante mientras carga descarta la respuesta obsoleta', async () => {
    let resolverReq1: (valor: unknown) => void = () => undefined;
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') return Promise.resolve(listaVacantes);
      if (url === '/vacantes/REQ-0001/informes-incognito') {
        return new Promise((resolve) => {
          resolverReq1 = resolve;
        });
      }
      if (url === '/vacantes/REQ-0002/informes-incognito') {
        return Promise.resolve({
          data: [{ ...informe100, alias: 'Candidato 200' }],
          meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosReq1);
      if (url === '/vacantes/REQ-0002/candidatos') return Promise.resolve(listaCandidatosVacia);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await usuario.click(screen.getByText('Ingeniero de Redes'));

    expect(await screen.findByText('Candidato 200')).toBeInTheDocument();

    resolverReq1(listaInformesReq1);
    await Promise.resolve();

    expect(screen.queryByText('Candidato 100')).not.toBeInTheDocument();
  });

  it('oculta las vacantes que no tienen informes incógnitos por revisar', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [
            vacante('REQ-0001', 'Analista de Datos', { EN_REVISION_LIDER: 1 }),
            vacante('REQ-0009', 'Vacante sin informes', {}),
            vacante('REQ-0010', 'Solo en anonimización', { INFORME_INCOGNITO: 3 }),
          ],
          meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-0001/informes-incognito')
        return Promise.resolve(listaInformesReq1);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    renderPagina(<PaginaProcesosLider />);

    expect(await screen.findByText('Analista de Datos')).toBeInTheDocument();
    expect(screen.queryByText('Vacante sin informes')).not.toBeInTheDocument();
    expect(screen.queryByText('Solo en anonimización')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío propio cuando ninguna vacante tiene informes por revisar', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante('REQ-0009', 'Sin informes', {})],
          meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
        });
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    renderPagina(<PaginaProcesosLider />);

    expect(
      await screen.findByText('No tienes vacantes con informes por revisar.'),
    ).toBeInTheDocument();
  });

  it('al escribir en el buscador filtra la tabla de vacantes por el texto', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [
            vacante('REQ-0001', 'Analista de Datos', { EN_REVISION_LIDER: 1 }),
            vacante('REQ-0002', 'Ingeniero de Redes', { EN_REVISION_LIDER: 2 }),
          ],
          meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
        });
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await screen.findByText('Analista de Datos');
    await usuario.type(screen.getByPlaceholderText(/Buscar/), 'redes');

    await waitFor(() => expect(screen.queryByText('Analista de Datos')).not.toBeInTheDocument());
    expect(screen.getByText('Ingeniero de Redes')).toBeInTheDocument();
  });

  it('preselecciona la vacante del query param ?vacante y carga sus informes al montar', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') return Promise.resolve(listaVacantes);
      if (url === '/vacantes/REQ-0002/informes-incognito') {
        return Promise.resolve({
          data: [],
          meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 },
        });
      }
      if (url === '/vacantes/REQ-0002/candidatos') return Promise.resolve(listaCandidatosVacia);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    renderPagina(<PaginaProcesosLider />, '/procesos?vacante=REQ-0002');

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith(
        '/vacantes/REQ-0002/informes-incognito',
        expect.anything(),
      ),
    );

    await screen.findByText('Esta vacante no tiene informes anonimizados por revisar.');
    const fila = within(screen.getAllByRole('table')[0])
      .getByText('Ingeniero de Redes')
      .closest('tr') as HTMLElement;
    expect(fila.querySelector('[data-fila-seleccionada]')).not.toBeNull();
  });

  it('al seleccionar una vacante también dispara GET /vacantes/{id}/candidatos con estado EN_REVISION_LIDER', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.find((c) => c[0] === '/vacantes/REQ-0001/candidatos');
      expect(llamada?.[1].params).toEqual({ estado: ['EN_REVISION_LIDER'], pageSize: 100 });
    });
  });

  it('ya no renderiza BarraSeleccionVacante al seleccionar una vacante', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');

    expect(screen.queryByRole('button', { name: 'Filtrar' })).not.toBeInTheDocument();
  });

  it('aprobar desde el modal llama al POST con compuerta LIDER, cierra el modal y repite las cargas', async () => {
    const usuario = userEvent.setup();
    cliente.post.mockResolvedValue({ estadoNuevo: 'APROBADO_LIDER' });
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-0001/candidatos', expect.anything()),
    );

    await usuario.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));
    await screen.findByRole('dialog');

    const llamadasPrevias = cliente.get.mock.calls.length;
    await usuario.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(cliente.post).toHaveBeenCalledWith(
      '/candidatos/APP-100/decisiones',
      expect.objectContaining({ compuerta: 'LIDER', decision: 'APRUEBA' }),
      expect.anything(),
    );
    await waitFor(() => expect(cliente.get.mock.calls.length).toBeGreaterThan(llamadasPrevias));
  });

  it('rechazar desde el modal llama al POST con compuerta LIDER, decision RECHAZA y el motivo', async () => {
    const usuario = userEvent.setup();
    cliente.post.mockResolvedValue({ estadoNuevo: 'RECHAZADO_LIDER' });
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-0001/candidatos', expect.anything()),
    );

    await usuario.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));
    await screen.findByRole('dialog');

    await usuario.type(screen.getByLabelText('Comentario'), 'No cumple el nivel de inglés');
    await usuario.click(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(cliente.post).toHaveBeenCalledWith(
      '/candidatos/APP-100/decisiones',
      expect.objectContaining({
        compuerta: 'LIDER',
        decision: 'RECHAZA',
        motivo: 'No cumple el nivel de inglés',
      }),
      expect.anything(),
    );
  });

  it('si el POST responde 409 el modal permanece abierto, muestra el error y no dispara recargas', async () => {
    const usuario = userEvent.setup();
    cliente.post.mockRejectedValue(
      errorApi(409, 'La compuerta ya no corresponde al estado actual'),
    );
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-0001/candidatos', expect.anything()),
    );

    await usuario.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));
    await screen.findByRole('dialog');

    const llamadasPrevias = cliente.get.mock.calls.length;
    await usuario.click(screen.getByRole('button', { name: 'Aprobar' }));

    expect(
      await screen.findByText(/La compuerta ya no corresponde al estado actual/),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(cliente.get.mock.calls).toHaveLength(llamadasPrevias);
  });

  it('con un alias sin jobApplicationId en el mapa, el modal no identifica al candidato y no llama a registrarDecision', async () => {
    const usuario = userEvent.setup();
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') return Promise.resolve(listaVacantes);
      if (url === '/vacantes/REQ-0001/informes-incognito')
        return Promise.resolve(listaInformesReq1);
      if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosVacia);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
    renderPagina(<PaginaProcesosLider />);

    await usuario.click(await screen.findByText('Analista de Datos'));
    await screen.findByText('Candidato 100');

    await usuario.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));
    const dialogo = await screen.findByRole('dialog');

    expect(
      within(dialogo).getByText(/no fue posible identificar al candidato/i),
    ).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Aprobar' })).toBeDisabled();
    expect(within(dialogo).getByRole('button', { name: 'Rechazar' })).toBeDisabled();
    expect(cliente.post).not.toHaveBeenCalled();
  });

  describe('llegada desde una notificación (?candidato)', () => {
    const informeDirecto = {
      alias: 'Candidato directo',
      generadoEn: '2026-08-20T00:00:00Z',
      aniosExperienciaTotal: 3.2,
      nivelAcademicoMaximo: 'Profesional',
      experiencia: [],
      estudios: [],
      competencias: ['Excel'],
      desgloseAfinidad: null,
    };

    it('con ?vacante y ?candidato y GET informe-incognito en 200, abre el modal con ese informe', async () => {
      cliente.get.mockImplementation((url: string) => {
        if (url === '/vacantes') return Promise.resolve(listaVacantes);
        if (url === '/vacantes/REQ-0001/informes-incognito')
          return Promise.resolve(listaInformesReq1);
        if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosReq1);
        if (url === '/candidatos/ja_1/informe-incognito') return Promise.resolve(informeDirecto);
        return Promise.reject(new Error(`URL no mockeada: ${url}`));
      });

      renderPagina(<PaginaProcesosLider />, '/procesos?vacante=REQ-0001&candidato=ja_1');

      const dialogo = await screen.findByRole('dialog');
      expect(within(dialogo).getByText('Candidato directo')).toBeInTheDocument();
      expect(within(dialogo).getByRole('button', { name: 'Aprobar' })).toBeEnabled();
    });

    it('con ?vacante y ?candidato y GET informe-incognito en 409, muestra el aviso y no abre el modal', async () => {
      cliente.get.mockImplementation((url: string) => {
        if (url === '/vacantes') return Promise.resolve(listaVacantes);
        if (url === '/vacantes/REQ-0001/informes-incognito')
          return Promise.resolve(listaInformesReq1);
        if (url === '/vacantes/REQ-0001/candidatos') return Promise.resolve(listaCandidatosReq1);
        if (url === '/candidatos/ja_2/informe-incognito') {
          return Promise.reject(errorApi(409, 'El informe aún no ha sido generado'));
        }
        return Promise.reject(new Error(`URL no mockeada: ${url}`));
      });

      renderPagina(<PaginaProcesosLider />, '/procesos?vacante=REQ-0001&candidato=ja_2');

      expect(
        await screen.findByText('El informe de este candidato aún no está listo para revisión.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(await screen.findByText('Analista de Datos')).toBeInTheDocument();
    });
  });
});
