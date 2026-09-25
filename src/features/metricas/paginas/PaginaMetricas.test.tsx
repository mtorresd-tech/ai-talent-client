import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  crearClienteApiFalso,
  errorApi,
  type ClienteApiFalso,
} from '../../../test/clienteApiFalso';
import { renderConTema } from '../../../test/renderConTema';
import { PaginaMetricas } from './PaginaMetricas';

const contenedorMock = vi.hoisted(() => ({ cliente: null as ClienteApiFalso | null }));

vi.mock('../../../shared/api/clienteApi', () => ({
  useClienteApi: () => contenedorMock.cliente,
}));

let cliente: ClienteApiFalso;

const resumen = { totalRequisiciones: 15, candidatosActivos: 76, tasaCierre: 33.3 };
const embudo = {
  propuestosSelecta: 120,
  llegaronPrefiltroTelefonico: 80,
  enviadosPrefiltroManual: 60,
};
const duracionEtapas = [
  {
    clave: 'RANKING',
    nombre: 'Ranking Selecta',
    promedioDias: 2.1,
    medianaDias: 2.0,
    porcentajeDelTotal: 10.0,
  },
];
const efectividad = {
  compuerta: 'LIDER',
  aprobados: { internos: 5, externos: 12 },
  rechazados: { internos: 2, externos: 8 },
};

function mockearRespuestasBase() {
  cliente.get.mockImplementation((url: string) => {
    if (url === '/metricas/resumen') return Promise.resolve(resumen);
    if (url === '/metricas/embudo') return Promise.resolve(embudo);
    if (url === '/metricas/duracion-etapas') return Promise.resolve(duracionEtapas);
    if (url.startsWith('/metricas/etapa/')) return Promise.resolve(efectividad);
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
}

beforeEach(() => {
  cliente = crearClienteApiFalso();
  contenedorMock.cliente = cliente;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  mockearRespuestasBase();
});

describe('PaginaMetricas', () => {
  it('muestra el encabezado y los cuatro paneles con datos reales, tasaCierre y porcentajeDelTotal con % sin multiplicar', async () => {
    renderConTema(<PaginaMetricas />);

    expect(screen.getByRole('heading', { level: 1, name: 'Métricas' })).toBeInTheDocument();

    expect(await screen.findByText('33.3%')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('76')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('si un panel falla, solo ese panel muestra error y los demás pintan datos normales', async () => {
    cliente.get.mockImplementation((url: string) => {
      if (url === '/metricas/resumen') return Promise.resolve(resumen);
      if (url === '/metricas/embudo') return Promise.resolve(embudo);
      if (url === '/metricas/duracion-etapas')
        return Promise.reject(errorApi(500, 'Error de duración'));
      if (url.startsWith('/metricas/etapa/')) return Promise.resolve(efectividad);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    renderConTema(<PaginaMetricas />);

    expect(await screen.findByText('Error de duración')).toBeInTheDocument();
    // Resumen y Embudo siguen mostrando sus datos con normalidad.
    expect(await screen.findByText('33.3%')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('cambiar "Desde" dispara de nuevo los cuatro GET con el nuevo valor', async () => {
    const usuario = userEvent.setup();
    renderConTema(<PaginaMetricas />);
    await screen.findByText('33.3%');

    const cantidadInicial = cliente.get.mock.calls.length;

    // Campo de texto enmascarado `dd/mm/aaaa` de `GebDateInput` (no el selector
    // nativo de fecha, cuyo `aria-label` no se puede usar: MUI 9 ya no admite
    // el `inputProps` legado con el que `@geb/ui` lo pasa, y lo descarta).
    await usuario.type(screen.getByLabelText('Desde'), '15012026');

    await waitFor(() => {
      const llamada = cliente.get.mock.calls.find(
        (c) => c[0] === '/metricas/resumen' && c[1]?.params?.desde,
      );
      expect(llamada).toBeTruthy();
    });
    expect(cliente.get.mock.calls.length).toBeGreaterThan(cantidadInicial);
    const llamadaResumen = cliente.get.mock.calls
      .filter((c) => c[0] === '/metricas/resumen')
      .at(-1);
    expect(llamadaResumen?.[1].params).toMatchObject({ desde: '2026-01-15' });
  });

  it('sin compuerta elegida en Efectividad no llama a GET /metricas/etapa/{etapa} y muestra el vacío', async () => {
    renderConTema(<PaginaMetricas />);
    await screen.findByText('33.3%');

    expect(screen.getByText('Elige una etapa para ver su efectividad.')).toBeInTheDocument();
    expect(cliente.get.mock.calls.some((c) => c[0].startsWith('/metricas/etapa/'))).toBe(false);
  });

  it('al elegir una compuerta consulta su efectividad y pinta el desglose interno/externo', async () => {
    const usuario = userEvent.setup();
    renderConTema(<PaginaMetricas />);
    await screen.findByText('33.3%');

    await usuario.click(screen.getByRole('combobox', { name: 'Etapa' }));
    await usuario.click(await screen.findByRole('option', { name: 'Revisión del líder' }));

    await waitFor(() =>
      expect(cliente.get).toHaveBeenCalledWith('/metricas/etapa/LIDER', expect.anything()),
    );
    expect(await screen.findByText('Internos: 5')).toBeInTheDocument();
    expect(screen.getByText('Externos: 12')).toBeInTheDocument();
  });
});
