import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { CandidatoResumen } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
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
});
