import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { CandidatoResumen } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import type { AtencionCandidato } from '../logica/atencionIntegraciones';
import { ListaRankingCandidatos } from './ListaRankingCandidatos';

const base = {
  cargando: false,
  error: null,
  pagina: 0,
  tamanoPagina: 5,
  estaSeleccionado: () => false,
  onAlternarSeleccion: vi.fn(),
  onCambioPagina: vi.fn(),
  onClickCandidato: vi.fn(),
  onReintentar: vi.fn(),
};

function candidato(
  estado: CandidatoResumen['estado'],
  overrides: Partial<CandidatoResumen> = {},
): CandidatoResumen {
  return {
    jobApplicationId: 'APP-1',
    jobRequisitionId: 'REQ-1',
    alias: 'Candidato 1',
    nombre: 'Ana Pérez',
    numeroDocumento: null,
    estado,
    estadoDesde: '2026-01-12T00:00:00Z',
    estadoSfsf: null,
    fechaPostulacion: '2026-01-11T00:00:00Z',
    origenPostulacion: 'LinkedIn',
    scoreAfinidad: null,
    rankingPosicion: null,
    esperandoDecision: false,
    compuertaPendiente: null,
    ...overrides,
  };
}

function respuesta(data: CandidatoResumen[]): RespuestaPaginada<CandidatoResumen> {
  return { data, meta: { page: 1, pageSize: 5, total: data.length, totalPages: 1 } };
}

const catalogo = [
  {
    clave: 'EN_REVISION_LIDER',
    etiqueta: 'En revisión del líder',
    descripcion: 'El líder está revisando.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'LIDER',
    compuertaEtiqueta: 'Revisión del líder',
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

describe('ListaRankingCandidatos (variante simple)', () => {
  it('con catálogo usa la etiqueta y el color de categoría del backend', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        catalogo={catalogo}
        respuesta={respuesta([candidato('EN_REVISION_LIDER')])}
      />,
    );

    const chip = screen.getByText('En revisión del líder');
    expect(screen.queryByText('En Revision Lider')).not.toBeInTheDocument();
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorInfo');
  });

  it('sin catálogo mantiene el comportamiento local (Title Case para estados no mapeados)', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        respuesta={respuesta([candidato('EN_REVISION_LIDER')])}
      />,
    );

    expect(screen.getByText('En Revision Lider')).toBeInTheDocument();
  });

  it('muestra "desde <fecha>" bajo el chip de estado', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        respuesta={respuesta([candidato('INFORME_INCOGNITO')])}
      />,
    );

    expect(screen.getByText(/^desde /)).toBeInTheDocument();
  });

  it('con lista vacía usa el copy de vacío recibido por prop', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        mensajeVacio="No hay candidatos en anonimización para esta vacante."
        respuesta={respuesta([])}
      />,
    );

    expect(
      screen.getByText('No hay candidatos en anonimización para esta vacante.'),
    ).toBeInTheDocument();
  });

  it('con atencionPorCandidato y nombreProveedorAtencion="Bluesite" muestra el badge con ese proveedor en el tooltip', async () => {
    const usuario = userEvent.setup();
    const atencionPorCandidato = new Map<string, AtencionCandidato>([
      ['APP-1', { requiereAtencion: true, diasTranscurridos: 12 }],
      ['APP-2', { requiereAtencion: false, diasTranscurridos: 1 }],
    ]);

    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        atencionPorCandidato={atencionPorCandidato}
        nombreProveedorAtencion="Bluesite"
        respuesta={respuesta([
          candidato('EN_PRUEBAS_BLUESITE', { jobApplicationId: 'APP-1' }),
          candidato('EN_PRUEBAS_BLUESITE', {
            jobApplicationId: 'APP-2',
            alias: 'Candidato 2',
            nombre: 'Beto Ruiz',
          }),
        ])}
      />,
    );

    const badge = screen.getByText('Requiere atención');
    expect(badge).toBeInTheDocument();

    await usuario.hover(badge);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('La integración con Bluesite tiene un error');
    expect(tooltip).toHaveTextContent('12 días transcurridos');
  });

  it('con nombreProveedorAtencion="Cosinte" el tooltip menciona ese proveedor', async () => {
    const usuario = userEvent.setup();
    const atencionPorCandidato = new Map<string, AtencionCandidato>([
      ['APP-1', { requiereAtencion: true, diasTranscurridos: 7 }],
    ]);

    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        atencionPorCandidato={atencionPorCandidato}
        nombreProveedorAtencion="Cosinte"
        respuesta={respuesta([candidato('EN_PRUEBAS_COSINTE', { jobApplicationId: 'APP-1' })])}
      />,
    );

    await usuario.hover(screen.getByText('Requiere atención'));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('La integración con Cosinte tiene un error');
  });

  it('con atencionPorCandidato sin nombreProveedorAtencion cae a "el proveedor" genérico', async () => {
    const usuario = userEvent.setup();
    const atencionPorCandidato = new Map<string, AtencionCandidato>([
      ['APP-1', { requiereAtencion: true, diasTranscurridos: 4 }],
    ]);

    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        atencionPorCandidato={atencionPorCandidato}
        respuesta={respuesta([candidato('EN_PRUEBAS_BLUESITE', { jobApplicationId: 'APP-1' })])}
      />,
    );

    await usuario.hover(screen.getByText('Requiere atención'));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('La integración con el proveedor tiene un error');
  });

  it('sin atencionPorCandidato (Selecta/Prefiltro/Anonimización) no muestra ningún badge', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="simple"
        respuesta={respuesta([candidato('EN_REVISION_LIDER')])}
      />,
    );

    expect(screen.queryByText('Requiere atención')).not.toBeInTheDocument();
  });
});

describe('ListaRankingCandidatos (variante selecta)', () => {
  it('con compuertaPendiente fuera del enum Compuerta conocido no crashea y deja el checkbox deshabilitado', () => {
    render(
      <ListaRankingCandidatos
        {...base}
        variante="selecta"
        respuesta={respuesta([
          candidato('RANKING_SELECTA', {
            esperandoDecision: true,
            compuertaPendiente: 'VALOR_NUEVO_NO_CONOCIDO',
          }),
        ])}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
