import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { establecerAnchoViewport } from '../../../test/matchMedia';
import { renderConTema } from '../../../test/renderConTema';
import { limpiarCacheCatalogoEstados } from '../hooks/useCatalogoEstados';
import { PaginaProcesosReclutador } from './PaginaProcesosReclutador';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

/** Renderiza la página dentro de un router en memoria (usa `useSearchParams`/`useNavigate`). */
function renderPagina(ui: ReactElement, rutaInicial = '/procesos') {
  return renderConTema(<MemoryRouter initialEntries={[rutaInicial]}>{ui}</MemoryRouter>);
}

/** Expone la ruta actual del router para verificar navegaciones. */
function MostrarUbicacion() {
  const ubicacion = useLocation();
  return <div data-testid="ubicacion">{`${ubicacion.pathname}${ubicacion.search}`}</div>;
}

/** Simula el `navigate()` que dispara una notificación hacia otra selección, sin remontar la página. */
function BotonNavegarA({ ruta }: { ruta: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(ruta)}>Simular clic en notificación</button>;
}

const vacante = {
  jobRequisitionId: 'REQ-1',
  titulo: 'Analista de Datos',
  area: 'Tecnología',
  ciudad: 'Bogotá',
  fechaPublicacion: '2026-01-10',
  totalCandidatos: 3,
  pendientesDecision: 2,
  numeroVacantes: 1,
  cerrada: false,
  conteoPorEstado: { RANKING_SELECTA: 3 },
};

const detalleVacante = {
  ...vacante,
  descripcion: null,
  responsabilidades: null,
  estudios: null,
  aniosExperienciaGeneral: null,
  aniosExperienciaRelacionada: null,
  competencias: [],
  reclutador: { nombre: 'Karen Rincón', email: 'k@geb.com.co' },
  fechaCierre: null,
  vacantesCubiertas: null,
  tipoEstudioCosinte: null,
};

function candidato(id: string, nombre: string, ranking: number, estado = 'RANKING_SELECTA') {
  return {
    jobApplicationId: id,
    jobRequisitionId: 'REQ-1',
    alias: `Candidato ${ranking}`,
    nombre,
    numeroDocumento: null,
    estado,
    estadoDesde: '2026-01-12',
    estadoSfsf: null,
    fechaPostulacion: '2026-01-11',
    origenPostulacion: 'LinkedIn',
    scoreAfinidad: 90 - ranking,
    rankingPosicion: ranking,
    esperandoDecision: true,
    compuertaPendiente: 'RANKING',
  };
}

const listaCandidatos = {
  data: [
    candidato('APP-2', 'Beto Ruiz', 2),
    candidato('APP-1', 'Ana Pérez', 1),
    candidato('APP-3', 'Dario Fuera', 3, 'PREFILTRO_PENDIENTE'),
  ],
  meta: { page: 1, pageSize: 5, total: 3, totalPages: 1 },
};

const listaFiltrados = {
  // El backend real no filtra por `estado`: la respuesta trae candidatos de
  // otros pasos del pipeline mezclados. `useCandidatosEtapa` debe filtrarlos.
  data: [
    candidato('APP-9', 'Caro Díaz', 5, 'PREFILTRO_PENDIENTE'),
    candidato('APP-10', 'Ese No Va', 6, 'RANKING_SELECTA'),
    candidato('APP-11', 'Tampoco Este', 7, 'EXTRACCION_OCR'),
  ],
  meta: { page: 1, pageSize: 10, total: 3, totalPages: 1 },
};

const detalleCandidato = {
  ...candidato('APP-1', 'Ana Pérez', 1),
  desgloseAfinidad: {
    porcentajeTotal: 73,
    versionRubrica: '1.0',
    elegible: true,
    motivosNoElegible: [],
    componentes: [
      {
        componente: 'HABILIDADES_OBLIGATORIAS',
        peso: 0.3,
        obtenido: 0.75,
        aporte: 22.5,
        brecha: 7.5,
      },
      { componente: 'EXPERIENCIA', peso: 0.25, obtenido: 0.9, aporte: 22.5, brecha: 2.5 },
    ],
    calidad: { confianza: 0.71, requiereRevision: false, provisional: false, alertas: [] },
    comentarios: 'Buen perfil',
  },
  integraciones: [],
  identidadRevelada: true,
  tipoCandidato: 'INTERNO',
  sincronizacionSfsf: {
    estado: 'PENDIENTE',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

const listaAnonimizacion = {
  data: [
    candidato('APP-20', 'Rocío Vega', 20, 'EN_REVISION_LIDER'),
    candidato('APP-21', 'Iván Soto', 21, 'RECHAZADO_LIDER'),
  ],
  meta: { page: 1, pageSize: 5, total: 2, totalPages: 1 },
};

const detalleAnonimizacion = {
  ...candidato('APP-20', 'Rocío Vega', 20, 'EN_REVISION_LIDER'),
  desgloseAfinidad: null,
  integraciones: [],
  identidadRevelada: true,
  tipoCandidato: 'EXTERNO',
  sincronizacionSfsf: {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

const listaBluesite = {
  data: [
    candidato('APP-30', 'Carla Ramos', 30, 'EN_PRUEBAS_BLUESITE'),
    candidato('APP-31', 'Diego León', 31, 'RESULTADO_PRUEBAS_BLUESITE'),
  ],
  meta: { page: 1, pageSize: 5, total: 2, totalPages: 1 },
};

const detalleBluesite = {
  ...candidato('APP-30', 'Carla Ramos', 30, 'EN_PRUEBAS_BLUESITE'),
  desgloseAfinidad: null,
  integraciones: [
    {
      proveedor: 'BLUESITE',
      subestado: 'EN_CURSO',
      idExterno: null,
      fechaSolicitud: '2026-01-05',
      fechaResultado: null,
      fechaExpiracion: null,
      intentos: 0,
      resultado: null,
    },
  ],
  identidadRevelada: true,
  tipoCandidato: 'EXTERNO',
  sincronizacionSfsf: {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

const integracionesBluesite = {
  data: [
    {
      jobApplicationId: 'APP-30',
      alias: 'Candidato 30',
      nombre: 'Carla Ramos',
      integraciones: [
        {
          proveedor: 'BLUESITE',
          subestado: 'ERROR',
          idExterno: null,
          fechaSolicitud: '2026-01-01',
          fechaResultado: null,
          fechaExpiracion: null,
          intentos: 3,
          resultado: null,
          diasTranscurridos: 12,
          requiereAtencion: true,
        },
      ],
    },
  ],
  meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
};

const listaCosinte = {
  data: [
    candidato('APP-40', 'Elena Ríos', 40, 'EN_PRUEBAS_COSINTE'),
    candidato('APP-41', 'Felipe Ortiz', 41, 'RESULTADO_PRUEBAS_COSINTE'),
  ],
  meta: { page: 1, pageSize: 5, total: 2, totalPages: 1 },
};

const detalleCosinte = {
  ...candidato('APP-40', 'Elena Ríos', 40, 'EN_PRUEBAS_COSINTE'),
  desgloseAfinidad: null,
  integraciones: [
    {
      proveedor: 'COSINTE',
      subestado: 'EN_CURSO',
      idExterno: null,
      fechaSolicitud: '2026-01-05',
      fechaResultado: null,
      fechaExpiracion: null,
      intentos: 0,
      resultado: {
        tipo: 'COSINTE',
        estado: 'En proceso',
        nivelRiesgo: 'Bajo',
        fechaSolicitud: '2026-01-05',
        tiempos: { diasHabiles: 8, diasRestantes: 4, progreso: 0.5 },
      },
    },
  ],
  identidadRevelada: true,
  tipoCandidato: 'EXTERNO',
  sincronizacionSfsf: {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

const integracionesCosinte = {
  data: [
    {
      jobApplicationId: 'APP-40',
      alias: 'Candidato 40',
      nombre: 'Elena Ríos',
      integraciones: [
        {
          proveedor: 'COSINTE',
          subestado: 'ERROR',
          idExterno: null,
          fechaSolicitud: '2026-01-01',
          fechaResultado: null,
          fechaExpiracion: null,
          intentos: 3,
          resultado: null,
          diasTranscurridos: 9,
          requiereAtencion: true,
        },
      ],
    },
  ],
  meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
};

const listaMedilaboral = {
  data: [
    candidato('APP-50', 'Gustavo Peña', 50, 'EN_PRUEBAS_MEDILABORAL'),
    candidato('APP-51', 'Helena Cruz', 51, 'RESULTADO_PRUEBAS_MEDILABORAL'),
  ],
  meta: { page: 1, pageSize: 5, total: 2, totalPages: 1 },
};

const detalleMedilaboral = {
  ...candidato('APP-50', 'Gustavo Peña', 50, 'EN_PRUEBAS_MEDILABORAL'),
  desgloseAfinidad: null,
  integraciones: [
    {
      proveedor: 'MEDILABORAL',
      subestado: 'EN_CURSO',
      idExterno: null,
      fechaSolicitud: '2026-08-01',
      fechaResultado: null,
      fechaExpiracion: null,
      intentos: 0,
      resultado: {
        tipo: 'MEDILABORAL',
        idOrdenServicio: 'OS-71614',
        fechaCita: null,
        sede: 'Sede Centro',
        modalidad: 'CITA_PREVIA',
        conceptoAptitud: null,
        observaciones: null,
        fechaConcepto: null,
      },
    },
  ],
  identidadRevelada: true,
  tipoCandidato: 'EXTERNO',
  sincronizacionSfsf: {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

const integracionesMedilaboral = {
  data: [
    {
      jobApplicationId: 'APP-50',
      alias: 'Candidato 50',
      nombre: 'Gustavo Peña',
      integraciones: [
        {
          proveedor: 'MEDILABORAL',
          subestado: 'ERROR',
          idExterno: null,
          fechaSolicitud: '2026-08-01',
          fechaResultado: null,
          fechaExpiracion: null,
          intentos: 3,
          resultado: null,
          diasTranscurridos: 5,
          requiereAtencion: true,
        },
      ],
    },
  ],
  meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
};

const catalogoEstados = [
  {
    clave: 'EN_REVISION_LIDER',
    etiqueta: 'En revisión del líder',
    descripcion: 'El líder está revisando el informe incógnito.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'LIDER',
    compuertaEtiqueta: 'Revisión del líder',
    transicionesPermitidas: [],
  },
  {
    clave: 'RECHAZADO_LIDER',
    etiqueta: 'Rechazado por el líder',
    descripcion: 'El líder descartó al candidato.',
    categoria: 'DESCARTADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
];

beforeEach(() => {
  limpiarCacheCatalogoEstados();
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  cliente.get.mockImplementation(
    (url: string, config?: { params?: { estado?: string[]; proveedor?: string } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('PREFILTRO_PENDIENTE')) return Promise.resolve(listaFiltrados);
        if (estados.includes('INFORME_INCOGNITO')) return Promise.resolve(listaAnonimizacion);
        if (estados.includes('EN_PRUEBAS_BLUESITE')) return Promise.resolve(listaBluesite);
        if (estados.includes('EN_PRUEBAS_COSINTE')) return Promise.resolve(listaCosinte);
        if (estados.includes('EN_PRUEBAS_MEDILABORAL')) return Promise.resolve(listaMedilaboral);
        return Promise.resolve(listaCandidatos);
      }
      if (url === '/vacantes/REQ-1/integraciones') {
        if (config?.params?.proveedor === 'COSINTE') return Promise.resolve(integracionesCosinte);
        if (config?.params?.proveedor === 'MEDILABORAL') {
          return Promise.resolve(integracionesMedilaboral);
        }
        return Promise.resolve(integracionesBluesite);
      }
      if (url === '/candidatos/APP-1') return Promise.resolve(detalleCandidato);
      if (url === '/candidatos/APP-20') return Promise.resolve(detalleAnonimizacion);
      if (url === '/candidatos/APP-30') return Promise.resolve(detalleBluesite);
      if (url === '/candidatos/APP-40') return Promise.resolve(detalleCosinte);
      if (url === '/candidatos/APP-50') return Promise.resolve(detalleMedilaboral);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    },
  );
});

describe('PaginaProcesosReclutador', () => {
  it('muestra el encabezado de la página con el copy de Procesos', async () => {
    renderPagina(<PaginaProcesosReclutador />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Procesos de selección activos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Gestión de procesos')).toBeInTheDocument();
  });

  it('selecciona una vacante, arma el pipeline local y carga candidatos de ranking', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));

    await waitFor(() => {
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-1', expect.anything());
    });

    // El pipeline no se pide al backend: se arma en el frontend (rail con fases).
    expect(cliente.get).not.toHaveBeenCalledWith('/vacantes/REQ-1/pipeline', expect.anything());
    expect(await screen.findByText('Prefiltro telefónico')).toBeInTheDocument();

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.find((c) => c[0] === '/vacantes/REQ-1/candidatos');
      expect(llamada?.[1].params).toMatchObject({ estado: ['RANKING_SELECTA'], direccion: 'desc' });
    });

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Karen Rincón')).toBeInTheDocument();

    // Selecta solo muestra los de estado RANKING_SELECTA, por afinidad desc.
    expect(screen.queryByText('Dario Fuera')).not.toBeInTheDocument();
    const nombres = screen.getAllByText(/Pérez|Ruiz/).map((n) => n.textContent);
    expect(nombres).toEqual(['Ana Pérez', 'Beto Ruiz']);
  });

  it('el listado de filtrados carga los candidatos en prefiltro / preseleccionados', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    await usuario.click(screen.getByRole('button', { name: /Listado de filtrados/ }));

    await waitFor(() => {
      const llamada = cliente.get.mock.calls
        .filter((c) => c[0] === '/vacantes/REQ-1/candidatos')
        .at(-1);
      expect(llamada?.[1].params.estado).toEqual([
        'PREFILTRO_PENDIENTE',
        'PREFILTRO_COMPLETADO',
        'PRESELECCIONADO',
      ]);
    });
    expect(await screen.findByText('Caro Díaz')).toBeInTheDocument();
    // Estado visible por fila: distingue pendiente / completado / preseleccionado.
    expect(screen.getByText('Prefiltro pendiente')).toBeInTheDocument();
    // El backend real no filtra por estado: candidatos de otros pasos
    // (ranking, extracción OCR) deben quedar afuera de este listado.
    expect(screen.queryByText('Ese No Va')).not.toBeInTheDocument();
    expect(screen.queryByText('Tampoco Este')).not.toBeInTheDocument();
  });

  it('al seleccionar un candidato consulta su detalle y muestra el desglose de afinidad', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    await usuario.click(screen.getByText('Ana Pérez'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-1', expect.anything()),
    );
    expect(await screen.findByText('73%')).toBeInTheDocument();
    expect(screen.getByText('Habilidades obligatorias')).toBeInTheDocument();
  });

  it('en mobile aplica el patrón master–detail: lista → detalle → volver a la lista', async () => {
    establecerAnchoViewport(400);
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    // Solo la lista: el resultado y el botón de volver todavía no aparecen.
    expect(screen.getByText('Beto Ruiz')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver a la lista/ })).not.toBeInTheDocument();

    await usuario.click(screen.getByText('Ana Pérez'));

    // Al seleccionar, se ve solo el detalle con la acción de volver.
    expect(await screen.findByText('73%')).toBeInTheDocument();
    expect(screen.queryByText('Beto Ruiz')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Volver a la lista/ }));

    // Vuelve a verse la lista, con su estado conservado.
    expect(await screen.findByText('Beto Ruiz')).toBeInTheDocument();
    expect(screen.queryByText('73%')).not.toBeInTheDocument();
  });

  it('aísla el ancho de la página de su contenido para no desbordar en mobile', async () => {
    const usuario = userEvent.setup();
    const { container } = renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    // El contenedor raíz fija su ancho al del viewport (`contain: inline-size`),
    // así el contenido ancho scrollea dentro de cada componente y no de la página.
    expect(container.firstElementChild).toHaveStyle({ contain: 'inline-size' });
  });

  it('envía a prefiltro con fallo parcial y recarga la lista, sin abrir SuccessFactors', async () => {
    const usuario = userEvent.setup();
    const espiaVentana = vi.spyOn(window, 'open').mockImplementation(() => null);
    cliente.post
      .mockRejectedValueOnce(errorApi(409, 'Ya fue decidida'))
      .mockResolvedValueOnce({ estadoNuevo: 'PREFILTRO_PENDIENTE' });

    renderPagina(<PaginaProcesosReclutador />);
    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    const casillas = screen.getAllByRole('checkbox');
    await usuario.click(casillas[0]);
    await usuario.click(casillas[1]);

    await usuario.click(screen.getByRole('button', { name: 'Prefiltro telefónico' }));

    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledTimes(2));
    expect(await within(dialogo).findByText(/1 enviado, 1 con error/)).toBeInTheDocument();

    const llamadasCandidatos = cliente.get.mock.calls.filter(
      (c) => c[0] === '/vacantes/REQ-1/candidatos',
    );
    expect(llamadasCandidatos.length).toBeGreaterThanOrEqual(2);
    expect(espiaVentana).not.toHaveBeenCalled();
    espiaVentana.mockRestore();
  });

  it('muestra el nombre de la vacante seleccionada solo dentro de TarjetaDetalleVacante, sin BarraSeleccionVacante', async () => {
    const usuario = userEvent.setup();
    renderPagina(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));

    // El detalle de la vacante muestra su título como encabezado propio.
    expect(
      await screen.findByRole('heading', { level: 6, name: 'Analista de Datos' }),
    ).toBeInTheDocument();
    // `BarraSeleccionVacante` ya no existe: sin botón "Filtrar" en la página.
    expect(screen.queryByRole('button', { name: /Filtrar/ })).not.toBeInTheDocument();
  });

  it('restaura vacante, etapa y candidato desde los query params al montar', async () => {
    renderPagina(
      <PaginaProcesosReclutador />,
      '/procesos?vacante=REQ-1&paso=SELECTA&candidato=APP-1',
    );

    // La vacante seleccionada carga su detalle sin interacción del usuario.
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-1', expect.anything()),
    );
    // El candidato seleccionado carga su resultado de afinidad a la derecha.
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-1', expect.anything()),
    );
    expect(await screen.findByText('73%')).toBeInTheDocument();
  });

  it('ya montada, un navigate a otra vacante/paso/candidato resincroniza el estado sin remount', async () => {
    const detalleVacante2 = {
      ...detalleVacante,
      jobRequisitionId: 'REQ-2',
      titulo: 'Otra Vacante',
    };

    cliente.get.mockImplementation(
      (url: string, config?: { params?: { estado?: string[]; proveedor?: string } }) => {
        if (url === '/vacantes') {
          return Promise.resolve({
            data: [vacante],
            meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
          });
        }
        if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
        if (url === '/vacantes/REQ-2') return Promise.resolve(detalleVacante2);
        if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
        if (url === '/vacantes/REQ-1/candidatos') return Promise.resolve(listaCandidatos);
        if (url === '/vacantes/REQ-2/candidatos') {
          const estados = config?.params?.estado ?? [];
          if (estados.includes('EN_PRUEBAS_BLUESITE')) return Promise.resolve(listaBluesite);
          return Promise.resolve(listaCandidatos);
        }
        if (url === '/candidatos/APP-1') return Promise.resolve(detalleCandidato);
        if (url === '/candidatos/APP-30') return Promise.resolve(detalleBluesite);
        return Promise.reject(new Error(`URL no mockeada: ${url}`));
      },
    );

    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <BotonNavegarA ruta="/procesos?vacante=REQ-2&paso=BLUESITE&candidato=APP-30" />
        <MostrarUbicacion />
      </>,
      '/procesos?vacante=REQ-1&paso=SELECTA&candidato=APP-1',
    );

    await screen.findByText('73%');

    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Simular clic en notificación' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos?vacante=REQ-2&paso=BLUESITE&candidato=APP-30',
    );
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-2', expect.anything()),
    );
    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-30', expect.anything()),
    );
    // "Carla Ramos" aparece a la vez en la fila de la lista y en el panel de
    // detalle (layout maestro-detalle en escritorio): basta confirmar que el
    // panel de Bluesite está activo y que el detalle de Selecta desapareció.
    expect((await screen.findAllByText('Carla Ramos')).length).toBeGreaterThan(0);
    expect(screen.queryByText('73%')).not.toBeInTheDocument();
  });
});

describe('PaginaProcesosReclutador · paso Anonimización', () => {
  async function abrirAnonimizacion() {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <MostrarUbicacion />
      </>,
    );

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');
    await usuario.click(screen.getByRole('button', { name: /Anonimización/ }));
    return usuario;
  }

  it('monta la lista de solo consulta y el panel de seguimiento, sin placeholder ni barra de acción', async () => {
    await abrirAnonimizacion();

    await waitFor(() => {
      const llamada = cliente.get.mock.calls
        .filter((c) => c[0] === '/vacantes/REQ-1/candidatos')
        .at(-1);
      expect(llamada?.[1].params.estado).toEqual([
        'INFORME_INCOGNITO',
        'EN_REVISION_LIDER',
        'APROBADO_LIDER_PRUEBAS',
        'RECHAZADO_LIDER',
      ]);
    });

    expect(await screen.findByText('Rocío Vega')).toBeInTheDocument();
    // Etiqueta del catálogo del backend, no Title Case del mapa local.
    expect((await screen.findAllByText('En revisión del líder')).length).toBeGreaterThan(0);
    expect(screen.queryByText('En Revision Lider')).not.toBeInTheDocument();
    // Solo consulta: sin checkboxes ni barra de envío a prefiltro.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/construcción/i)).not.toBeInTheDocument();
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('al seleccionar un candidato consulta su detalle y muestra el seguimiento', async () => {
    const usuario = await abrirAnonimizacion();
    await screen.findByText('Rocío Vega');

    await usuario.click(screen.getByText('Rocío Vega'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-20', expect.anything()),
    );
    expect(await screen.findByText('Externo')).toBeInTheDocument();
    expect(screen.getByText(/envío al líder son automáticos/i)).toBeInTheDocument();
    // No se consulta el prefiltro en este paso.
    expect(cliente.get).not.toHaveBeenCalledWith('/candidatos/APP-20/prefiltro', expect.anything());
  });

  it('"Ver detalle completo" navega a la subpágina preservando vacante y paso', async () => {
    const usuario = await abrirAnonimizacion();
    await screen.findByText('Rocío Vega');
    await usuario.click(screen.getByText('Rocío Vega'));

    await usuario.click(await screen.findByRole('button', { name: 'Ver detalle completo' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos/candidato/APP-20?vacante=REQ-1&paso=ANONIMIZACION',
    );
  });

  it('si el catálogo de estados falla, la pantalla no se bloquea y usa el respaldo local', async () => {
    cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.reject(errorApi(500));
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('INFORME_INCOGNITO')) return Promise.resolve(listaAnonimizacion);
        return Promise.resolve(listaCandidatos);
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    await abrirAnonimizacion();

    expect(await screen.findByText('Rocío Vega')).toBeInTheDocument();
    // Sin catálogo, la etiqueta cae al respaldo Title Case.
    expect((await screen.findAllByText('En Revision Lider')).length).toBeGreaterThan(0);
  });
});

describe('PaginaProcesosReclutador · paso Bluesite', () => {
  // El rail ya no muestra la tarjeta de Bluesite (fase oculta): se llega a este
  // paso por navegación manual de URL, exactamente igual que antes de ocultarla.
  async function abrirBluesite() {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <MostrarUbicacion />
      </>,
      '/procesos?vacante=REQ-1&paso=BLUESITE',
    );

    // La vacante ya viene preseleccionada por URL: el título aparece a la vez
    // en la fila de la tabla y en el detalle, por eso se espera con `findAllByText`.
    await screen.findAllByText('Analista de Datos');
    return usuario;
  }

  it('monta la lista de solo consulta y el panel de seguimiento, sin placeholder ni barra de acción', async () => {
    await abrirBluesite();

    await waitFor(() => {
      const llamada = cliente.get.mock.calls
        .filter((c) => c[0] === '/vacantes/REQ-1/candidatos')
        .at(-1);
      expect(llamada?.[1].params.estado).toEqual([
        'EN_PRUEBAS_BLUESITE',
        'RESULTADO_PRUEBAS_BLUESITE',
        'APROBO_PRUEBAS_BLUESITE',
        'DESCARTADO_PRUEBAS_BLUESITE',
      ]);
    });

    expect(await screen.findByText('Carla Ramos')).toBeInTheDocument();
    // Solo consulta: sin checkboxes ni barra de envío a prefiltro.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/construcción/i)).not.toBeInTheDocument();
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('al seleccionar un candidato consulta su detalle y muestra el seguimiento con la tarjeta de resultado', async () => {
    const usuario = await abrirBluesite();
    await screen.findByText('Carla Ramos');

    await usuario.click(screen.getByText('Carla Ramos'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-30', expect.anything()),
    );
    expect(await screen.findByText('Externo')).toBeInTheDocument();
    // Sin resultado estructurado todavía (integración `EN_CURSO`, resultado null).
    expect(screen.getByText('Sin resultado estructurado')).toBeInTheDocument();
  });

  it('"Ver detalle completo" navega a la subpágina preservando vacante y paso', async () => {
    const usuario = await abrirBluesite();
    await screen.findByText('Carla Ramos');
    await usuario.click(screen.getByText('Carla Ramos'));

    await usuario.click(await screen.findByRole('button', { name: 'Ver detalle completo' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos/candidato/APP-30?vacante=REQ-1&paso=BLUESITE',
    );
  });

  it('cruza con listarIntegracionesDeVacante y muestra el badge solo en la fila que requiere atención', async () => {
    await abrirBluesite();
    await screen.findByText('Carla Ramos');

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith(
        '/vacantes/REQ-1/integraciones',
        expect.objectContaining({ params: expect.objectContaining({ proveedor: 'BLUESITE' }) }),
      ),
    );

    const filaConAtencion = screen.getByText('Carla Ramos').closest('tr');
    const filaSinAtencion = screen.getByText('Diego León').closest('tr');
    expect(filaConAtencion).toBeTruthy();
    expect(filaSinAtencion).toBeTruthy();
    expect(
      within(filaConAtencion as HTMLElement).getByText('Requiere atención'),
    ).toBeInTheDocument();
    expect(
      within(filaSinAtencion as HTMLElement).queryByText('Requiere atención'),
    ).not.toBeInTheDocument();
  });

  it('si falla la carga de integraciones, la lista se pinta igual sin ningún badge', async () => {
    cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('EN_PRUEBAS_BLUESITE')) return Promise.resolve(listaBluesite);
        return Promise.resolve(listaCandidatos);
      }
      if (url === '/vacantes/REQ-1/integraciones') return Promise.reject(errorApi(500));
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    await abrirBluesite();

    expect(await screen.findByText('Carla Ramos')).toBeInTheDocument();
    expect(screen.getByText('Diego León')).toBeInTheDocument();
    expect(screen.queryByText('Requiere atención')).not.toBeInTheDocument();
  });
});

describe('PaginaProcesosReclutador · paso Cosinte', () => {
  // El rail ya no muestra la tarjeta de Cosinte (fase oculta): se llega a este
  // paso por navegación manual de URL, exactamente igual que antes de ocultarla.
  async function abrirCosinte() {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <MostrarUbicacion />
      </>,
      '/procesos?vacante=REQ-1&paso=COSINTE',
    );

    // La vacante ya viene preseleccionada por URL: el título aparece a la vez
    // en la fila de la tabla y en el detalle, por eso se espera con `findAllByText`.
    await screen.findAllByText('Analista de Datos');
    return usuario;
  }

  it('monta la lista de solo consulta y el panel de seguimiento, sin placeholder ni barra de acción', async () => {
    await abrirCosinte();

    await waitFor(() => {
      const llamada = cliente.get.mock.calls
        .filter((c) => c[0] === '/vacantes/REQ-1/candidatos')
        .at(-1);
      expect(llamada?.[1].params.estado).toEqual([
        'EN_PRUEBAS_COSINTE',
        'RESULTADO_PRUEBAS_COSINTE',
        'APROBO_PRUEBAS_COSINTE',
        'DESCARTADO_PRUEBAS_COSINTE',
        'BLOQUEADO_COSINTE_6M',
      ]);
    });

    expect(await screen.findByText('Elena Ríos')).toBeInTheDocument();
    // Solo consulta: sin checkboxes ni barra de envío a prefiltro.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/construcción/i)).not.toBeInTheDocument();
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('al seleccionar un candidato consulta su detalle y muestra el seguimiento con la tarjeta de resultado', async () => {
    const usuario = await abrirCosinte();
    await screen.findByText('Elena Ríos');

    await usuario.click(screen.getByText('Elena Ríos'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-40', expect.anything()),
    );
    expect(await screen.findByText('Externo')).toBeInTheDocument();
    expect(screen.getByText('50% completado')).toBeInTheDocument();
  });

  it('"Ver detalle completo" navega a la subpágina preservando vacante y paso', async () => {
    const usuario = await abrirCosinte();
    await screen.findByText('Elena Ríos');
    await usuario.click(screen.getByText('Elena Ríos'));

    await usuario.click(await screen.findByRole('button', { name: 'Ver detalle completo' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos/candidato/APP-40?vacante=REQ-1&paso=COSINTE',
    );
  });

  it('cruza con listarIntegracionesDeVacante y muestra el badge solo en la fila que requiere atención', async () => {
    const usuario = await abrirCosinte();
    await screen.findByText('Elena Ríos');

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith(
        '/vacantes/REQ-1/integraciones',
        expect.objectContaining({ params: expect.objectContaining({ proveedor: 'COSINTE' }) }),
      ),
    );

    const filaConAtencion = screen.getByText('Elena Ríos').closest('tr');
    const filaSinAtencion = screen.getByText('Felipe Ortiz').closest('tr');
    expect(filaConAtencion).toBeTruthy();
    expect(filaSinAtencion).toBeTruthy();

    const badge = within(filaConAtencion as HTMLElement).getByText('Requiere atención');
    expect(badge).toBeInTheDocument();
    expect(
      within(filaSinAtencion as HTMLElement).queryByText('Requiere atención'),
    ).not.toBeInTheDocument();

    await usuario.hover(badge);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('La integración con Cosinte tiene un error');
  });

  it('si falla la carga de integraciones, la lista se pinta igual sin ningún badge', async () => {
    cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('EN_PRUEBAS_COSINTE')) return Promise.resolve(listaCosinte);
        return Promise.resolve(listaCandidatos);
      }
      if (url === '/vacantes/REQ-1/integraciones') return Promise.reject(errorApi(500));
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    await abrirCosinte();

    expect(await screen.findByText('Elena Ríos')).toBeInTheDocument();
    expect(screen.getByText('Felipe Ortiz')).toBeInTheDocument();
    expect(screen.queryByText('Requiere atención')).not.toBeInTheDocument();
  });
});

describe('PaginaProcesosReclutador · paso Medilaboral', () => {
  // El rail ya no muestra la tarjeta de Medilaboral (fase oculta): se llega a
  // este paso por navegación manual de URL, exactamente igual que antes de
  // ocultarla.
  async function abrirMedilaboral() {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <MostrarUbicacion />
      </>,
      '/procesos?vacante=REQ-1&paso=MEDILABORAL',
    );

    // La vacante ya viene preseleccionada por URL: el título aparece a la vez
    // en la fila de la tabla y en el detalle, por eso se espera con `findAllByText`.
    await screen.findAllByText('Analista de Datos');
    return usuario;
  }

  it('monta la lista de solo consulta y el panel de seguimiento, sin placeholder ni barra de acción', async () => {
    await abrirMedilaboral();

    await waitFor(() => {
      const llamada = cliente.get.mock.calls
        .filter((c) => c[0] === '/vacantes/REQ-1/candidatos')
        .at(-1);
      expect(llamada?.[1].params.estado).toEqual([
        'EN_PRUEBAS_MEDILABORAL',
        'RESULTADO_PRUEBAS_MEDILABORAL',
        'APROBO_PRUEBAS_MEDILABORAL',
        'DESCARTADO_PRUEBAS_MEDILABORAL',
      ]);
    });

    expect(await screen.findByText('Gustavo Peña')).toBeInTheDocument();
    // Solo consulta: sin checkboxes ni barra de envío a prefiltro.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/construcción/i)).not.toBeInTheDocument();
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('al seleccionar un candidato con examen agendado sin concepto aún muestra los datos disponibles, sin chip', async () => {
    const usuario = await abrirMedilaboral();
    await screen.findByText('Gustavo Peña');

    await usuario.click(screen.getByText('Gustavo Peña'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-50', expect.anything()),
    );
    expect(await screen.findByText('Externo')).toBeInTheDocument();
    expect(screen.getByText('Sede: Sede Centro')).toBeInTheDocument();
    expect(screen.queryByText(/Observaciones:/)).not.toBeInTheDocument();
  });

  it('"Ver detalle completo" navega a la subpágina preservando vacante y paso', async () => {
    const usuario = await abrirMedilaboral();
    await screen.findByText('Gustavo Peña');
    await usuario.click(screen.getByText('Gustavo Peña'));

    await usuario.click(await screen.findByRole('button', { name: 'Ver detalle completo' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos/candidato/APP-50?vacante=REQ-1&paso=MEDILABORAL',
    );
  });

  it('cruza con listarIntegracionesDeVacante y muestra el badge solo en la fila que requiere atención', async () => {
    await abrirMedilaboral();
    await screen.findByText('Gustavo Peña');

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith(
        '/vacantes/REQ-1/integraciones',
        expect.objectContaining({ params: expect.objectContaining({ proveedor: 'MEDILABORAL' }) }),
      ),
    );

    const filaConAtencion = screen.getByText('Gustavo Peña').closest('tr');
    const filaSinAtencion = screen.getByText('Helena Cruz').closest('tr');
    expect(filaConAtencion).toBeTruthy();
    expect(filaSinAtencion).toBeTruthy();
    expect(
      within(filaConAtencion as HTMLElement).getByText('Requiere atención'),
    ).toBeInTheDocument();
    expect(
      within(filaSinAtencion as HTMLElement).queryByText('Requiere atención'),
    ).not.toBeInTheDocument();
  });

  it('si falla la carga de integraciones, la lista se pinta igual sin ningún badge', async () => {
    cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('EN_PRUEBAS_MEDILABORAL')) return Promise.resolve(listaMedilaboral);
        return Promise.resolve(listaCandidatos);
      }
      if (url === '/vacantes/REQ-1/integraciones') return Promise.reject(errorApi(500));
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    await abrirMedilaboral();

    expect(await screen.findByText('Gustavo Peña')).toBeInTheDocument();
    expect(screen.getByText('Helena Cruz')).toBeInTheDocument();
    expect(screen.queryByText('Requiere atención')).not.toBeInTheDocument();
  });
});

describe('PaginaProcesosReclutador · paso Oferta', () => {
  const candidatoFinal = {
    jobApplicationId: 'APP-55',
    jobRequisitionId: 'REQ-1',
    alias: 'Candidato 55',
    nombre: 'Ricardo Torres',
    numeroDocumento: '1000000055',
    estado: 'INICIAR_PROCESO_CONTRATACION',
    estadoDesde: '2026-08-06T00:00:00Z',
    estadoSfsf: 'Oferta',
    fechaPostulacion: '2026-08-01T00:00:00Z',
    origenPostulacion: 'Jobs2Web',
    scoreAfinidad: 67.5,
    rankingPosicion: null,
    esperandoDecision: false,
    compuertaPendiente: null,
    desgloseAfinidad: {
      porcentajeTotal: 67.5,
      versionRubrica: '1.0',
      elegible: true,
      motivosNoElegible: [],
      componentes: [
        {
          componente: 'HABILIDADES_OBLIGATORIAS',
          peso: 0.3,
          obtenido: 0.52,
          aporte: 15.6,
          brecha: 14.4,
        },
      ],
      calidad: { confianza: 0.6, requiereRevision: false, provisional: false, alertas: [] },
      comentarios: 'Cumple parcialmente; revisar las brechas antes de avanzar.',
    },
    integraciones: [],
    identidadRevelada: true,
    sincronizacionSfsf: {
      estado: 'SINCRONIZADO',
      ultimaSincronizacion: null,
      intentos: 0,
      ultimoError: null,
    },
    tipoCandidato: 'INTERNO',
  };

  function mockearConCandidatoFinal() {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') return Promise.resolve(listaCandidatos);
      if (url === '/vacantes/REQ-1/candidato-final') return Promise.resolve(candidatoFinal);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
  }

  function mockearSinCandidatoFinal() {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') return Promise.resolve(listaCandidatos);
      if (url === '/vacantes/REQ-1/candidato-final') {
        return Promise.reject(errorApi(404, 'La vacante aun no tiene candidato final'));
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
  }

  // El rail ya no muestra la tarjeta de Oferta (fase oculta): se llega a este
  // paso por navegación manual de URL, exactamente igual que antes de ocultarla.
  async function abrirOferta() {
    const usuario = userEvent.setup();
    renderPagina(
      <>
        <PaginaProcesosReclutador />
        <MostrarUbicacion />
      </>,
      '/procesos?vacante=REQ-1&paso=OFERTA',
    );

    // La vacante ya viene preseleccionada por URL: el título aparece a la vez
    // en la fila de la tabla y en el detalle, por eso se espera con `findAllByText`.
    await screen.findAllByText('Analista de Datos');
    return usuario;
  }

  it('muestra el candidato final a ancho completo, sin columna de lista', async () => {
    mockearConCandidatoFinal();
    await abrirOferta();

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith(
        '/vacantes/REQ-1/candidato-final',
        expect.anything(),
      ),
    );

    expect(await screen.findByText('Ricardo Torres')).toBeInTheDocument();
    expect(screen.getByText('Interno')).toBeInTheDocument();
    expect(screen.getByText(/Sincronización con SuccessFactors/)).toBeInTheDocument();
    // Sin match/afinidad generado por IA en este paso.
    expect(screen.queryByText('Match generado por IA')).not.toBeInTheDocument();
    // Sin columna de lista de candidatos en este paso: la única tabla visible
    // es la de vacantes (siempre presente arriba de la página).
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.queryByText(/construcción/i)).not.toBeInTheDocument();
  });

  it('sin candidato final (404) muestra el vacío informativo, sin botón de reintento de error', async () => {
    mockearSinCandidatoFinal();
    await abrirOferta();

    expect(
      await screen.findByText('Esta vacante todavía no tiene un candidato final.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('error real (500) muestra EstadoError y el reintento vuelve a pedir el candidato final', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidatos') return Promise.resolve(listaCandidatos);
      if (url === '/vacantes/REQ-1/candidato-final') return Promise.reject(errorApi(500));
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
    const usuario = await abrirOferta();

    await usuario.click(await screen.findByRole('button', { name: /reintentar/i }));

    await waitFor(() => {
      const llamadas = cliente.get.mock.calls.filter(
        (c) => c[0] === '/vacantes/REQ-1/candidato-final',
      );
      expect(llamadas.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('"Ver detalle completo" navega usando el jobApplicationId del candidato final', async () => {
    mockearConCandidatoFinal();
    await abrirOferta();
    await screen.findByText('Ricardo Torres');

    const usuario = userEvent.setup();
    await usuario.click(await screen.findByRole('button', { name: 'Ver detalle completo' }));

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      '/procesos/candidato/APP-55?vacante=REQ-1&paso=OFERTA',
    );
  });

  it('cambiar de Medilaboral a Oferta y viceversa alterna entre el layout de dos columnas y el panel único', async () => {
    cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
      if (url === '/vacantes') {
        return Promise.resolve({
          data: [vacante],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        });
      }
      if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
      if (url === '/catalogos/estados-candidato') return Promise.resolve(catalogoEstados);
      if (url === '/vacantes/REQ-1/candidato-final') return Promise.resolve(candidatoFinal);
      if (url === '/vacantes/REQ-1/candidatos') {
        const estados = config?.params?.estado ?? [];
        if (estados.includes('EN_PRUEBAS_MEDILABORAL')) return Promise.resolve(listaMedilaboral);
        return Promise.resolve(listaCandidatos);
      }
      if (url === '/vacantes/REQ-1/integraciones') return Promise.resolve(integracionesMedilaboral);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    // El rail ya no muestra las tarjetas de Medilaboral ni Oferta (fases
    // ocultas): se alterna entre ambos pasos por navegación manual de URL
    // (remontando la página en cada paso), igual que antes de ocultarlas.
    const primeraVez = renderPagina(
      <PaginaProcesosReclutador />,
      '/procesos?vacante=REQ-1&paso=MEDILABORAL',
    );
    expect(await screen.findByText('Gustavo Peña')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
    primeraVez.unmount();

    const segundaVez = renderPagina(
      <PaginaProcesosReclutador />,
      '/procesos?vacante=REQ-1&paso=OFERTA',
    );
    expect(await screen.findByText('Ricardo Torres')).toBeInTheDocument();
    expect(screen.queryByText('Gustavo Peña')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecciona un candidato')).not.toBeInTheDocument();
    segundaVez.unmount();

    renderPagina(<PaginaProcesosReclutador />, '/procesos?vacante=REQ-1&paso=MEDILABORAL');
    expect(await screen.findByText('Gustavo Peña')).toBeInTheDocument();
    expect(screen.queryByText('Ricardo Torres')).not.toBeInTheDocument();
  });
});
