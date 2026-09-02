import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { establecerAnchoViewport } from '../../../test/matchMedia';
import { PaginaProcesosReclutador } from './PaginaProcesosReclutador';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

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
    porcentajeFortalezas: 91,
    porcentajeExperiencia: 64,
    porcentajeEstudios: 52,
    fortalezas: ['Comunicación'],
    debilidades: ['Inglés'],
    comentarios: 'Buen perfil',
  },
  integraciones: [],
  identidadRevelada: true,
  sincronizacionSfsf: {
    estado: 'PENDIENTE',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

beforeEach(() => {
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  cliente.get.mockImplementation((url: string, config?: { params?: { estado?: string[] } }) => {
    if (url === '/vacantes') {
      return Promise.resolve({
        data: [vacante],
        meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      });
    }
    if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
    if (url === '/vacantes/REQ-1/candidatos') {
      const estados = config?.params?.estado ?? [];
      if (estados.includes('PREFILTRO_PENDIENTE')) return Promise.resolve(listaFiltrados);
      return Promise.resolve(listaCandidatos);
    }
    if (url === '/candidatos/APP-1') return Promise.resolve(detalleCandidato);
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
});

describe('PaginaProcesosReclutador', () => {
  it('selecciona una vacante, arma el pipeline local y carga candidatos de ranking', async () => {
    const usuario = userEvent.setup();
    render(<PaginaProcesosReclutador />);

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
    render(<PaginaProcesosReclutador />);

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

  it('los pasos sin soporte muestran el placeholder "en construcción"', async () => {
    const usuario = userEvent.setup();
    render(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    await usuario.click(screen.getByRole('button', { name: /Bluesite/ }));

    expect(await screen.findByText(/construcción/i)).toBeInTheDocument();
  });

  it('al seleccionar un candidato consulta su detalle y muestra el desglose de afinidad', async () => {
    const usuario = userEvent.setup();
    render(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    await usuario.click(screen.getByText('Ana Pérez'));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/candidatos/APP-1', expect.anything()),
    );
    expect(await screen.findByText('73%')).toBeInTheDocument();
    expect(screen.getByText('Comunicación')).toBeInTheDocument();
  });

  it('en mobile aplica el patrón master–detail: lista → detalle → volver a la lista', async () => {
    establecerAnchoViewport(400);
    const usuario = userEvent.setup();
    render(<PaginaProcesosReclutador />);

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
    const { container } = render(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    // El contenedor raíz fija su ancho al del viewport (`contain: inline-size`),
    // así el contenido ancho scrollea dentro de cada componente y no de la página.
    expect(container.firstElementChild).toHaveStyle({ contain: 'inline-size' });
  });

  it('envía a prefiltro con fallo parcial y recarga la lista', async () => {
    const usuario = userEvent.setup();
    cliente.post
      .mockRejectedValueOnce(errorApi(409, 'Ya fue decidida'))
      .mockResolvedValueOnce({ estadoNuevo: 'PREFILTRO_PENDIENTE' });

    render(<PaginaProcesosReclutador />);
    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));
    await screen.findByText('Ana Pérez');

    const casillas = screen.getAllByRole('checkbox');
    await usuario.click(casillas[0]);
    await usuario.click(casillas[1]);

    await usuario.click(screen.getByRole('button', { name: 'Prefiltro telefónico' }));

    const dialogo = await screen.findByRole('dialog');
    await usuario.click(
      within(dialogo).getByRole('button', { name: /Confirmar e ir a SuccessFactors/ }),
    );

    await waitFor(() => expect(cliente.post).toHaveBeenCalledTimes(2));
    expect(await within(dialogo).findByText(/1 enviado, 1 con error/)).toBeInTheDocument();

    const llamadasCandidatos = cliente.get.mock.calls.filter(
      (c) => c[0] === '/vacantes/REQ-1/candidatos',
    );
    expect(llamadasCandidatos.length).toBeGreaterThanOrEqual(2);
  });
});
