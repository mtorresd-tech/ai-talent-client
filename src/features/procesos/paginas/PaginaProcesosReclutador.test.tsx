import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
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

const pipeline = [
  {
    clave: 'RANKING',
    nombre: 'Selecta',
    orden: 1,
    total: 3,
    pendientesDecision: 2,
    automatica: false,
  },
  {
    clave: 'BLUESITE',
    nombre: 'Bluesite',
    orden: 2,
    total: 0,
    pendientesDecision: 0,
    automatica: false,
  },
];

function candidato(id: string, nombre: string, ranking: number) {
  return {
    jobApplicationId: id,
    jobRequisitionId: 'REQ-1',
    alias: `Candidato ${ranking}`,
    nombre,
    numeroDocumento: null,
    estado: 'RANKING_SELECTA',
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
  data: [candidato('APP-1', 'Ana Pérez', 1), candidato('APP-2', 'Beto Ruiz', 2)],
  meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
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

  cliente.get.mockImplementation((url: string) => {
    if (url === '/vacantes') {
      return Promise.resolve({
        data: [vacante],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    }
    if (url === '/vacantes/REQ-1') return Promise.resolve(detalleVacante);
    if (url === '/vacantes/REQ-1/pipeline') return Promise.resolve(pipeline);
    if (url === '/vacantes/REQ-1/candidatos') return Promise.resolve(listaCandidatos);
    if (url === '/candidatos/APP-1') return Promise.resolve(detalleCandidato);
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
});

describe('PaginaProcesosReclutador', () => {
  it('selecciona una vacante y carga detalle, pipeline y candidatos de ranking', async () => {
    const usuario = userEvent.setup();
    render(<PaginaProcesosReclutador />);

    await screen.findByText('Analista de Datos');
    await usuario.click(screen.getByText('Analista de Datos'));

    await waitFor(() => {
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-1', expect.anything());
      expect(cliente.get).toHaveBeenCalledWith('/vacantes/REQ-1/pipeline', expect.anything());
    });

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.find((c) => c[0] === '/vacantes/REQ-1/candidatos');
      expect(llamada?.[1].params).toMatchObject({ estado: ['RANKING_SELECTA'], direccion: 'desc' });
    });

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Karen Rincón')).toBeInTheDocument();
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
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(cliente.post).toHaveBeenCalledTimes(2));
    expect(await within(dialogo).findByText(/1 enviado, 1 con error/)).toBeInTheDocument();

    const llamadasCandidatos = cliente.get.mock.calls.filter(
      (c) => c[0] === '/vacantes/REQ-1/candidatos',
    );
    expect(llamadasCandidatos.length).toBeGreaterThanOrEqual(2);
  });
});
