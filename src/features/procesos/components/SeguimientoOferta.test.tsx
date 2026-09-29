import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { SeguimientoOferta } from './SeguimientoOferta';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
  tituloVacante: 'Analista de Datos',
};

const catalogoOferta = [
  {
    clave: 'INICIAR_PROCESO_CONTRATACION',
    etiqueta: 'Iniciar proceso de contratacion',
    descripcion: 'El candidato acepto. El proceso de seleccion termina y arranca la contratacion.',
    categoria: 'APROBADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

const DESCRIPCION_CATALOGO = /El candidato acepto/;

function candidatoFinal(overrides: Partial<CandidatoDetalle> = {}): CandidatoDetalle {
  return {
    jobApplicationId: 'APP-55',
    jobRequisitionId: 'REQ-6',
    alias: 'Candidato 55',
    nombre: 'Ricardo Torres',
    numeroDocumento: '1000000055',
    estado: 'INICIAR_PROCESO_CONTRATACION' as EstadoProceso,
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
      aniosTotales: null,
      aniosRelevantes: null,
      sectorPredominante: null,
      comentarios: 'Cumple parcialmente; revisar las brechas antes de avanzar.',
    },
    integraciones: [],
    identidadRevelada: true,
    tipoCandidato: 'INTERNO' as TipoCandidato,
    sincronizacionSfsf: {
      estado: 'SINCRONIZADO',
      ultimaSincronizacion: null,
      intentos: 0,
      ultimoError: null,
    },
    ...overrides,
  };
}

describe('SeguimientoOferta', () => {
  it('con error 404 muestra el vacío informativo, no el estado de error', () => {
    render(
      <SeguimientoOferta {...base} candidato={null} error={errorApi(404, 'Sin candidato final')} />,
    );

    expect(
      screen.getByText('Esta vacante todavía no tiene un candidato final.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('con error real (500) muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoOferta
        {...base}
        candidato={null}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });

  it('cargando sin candidato previo muestra la barra de progreso', () => {
    render(<SeguimientoOferta {...base} candidato={null} cargando />);
    expect(screen.getByLabelText('Cargando candidato final')).toBeInTheDocument();
  });

  it('con candidato interno muestra la tarjeta de perfil con el distintivo junto al chip de estado, sin afinidad', () => {
    render(
      <SeguimientoOferta
        {...base}
        catalogo={catalogoOferta}
        candidato={candidatoFinal({ tipoCandidato: 'INTERNO' as TipoCandidato })}
      />,
    );

    expect(screen.getByText('Ricardo Torres')).toBeInTheDocument();
    expect(screen.getByText('1000000055')).toBeInTheDocument();
    const distintivo = screen.getByText('Interno');
    const [chip] = screen
      .getAllByText('Iniciar proceso de contratacion')
      .filter((el) => el.closest('.MuiChip-root'));
    expect(distintivo.closest('.MuiStack-root')).toBe(chip.closest('.MuiStack-root'));
    // Sin match/afinidad generado por IA en este paso.
    expect(screen.queryByText('68%')).not.toBeInTheDocument();
    expect(screen.queryByText('Match generado por IA')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin resultado de afinidad')).not.toBeInTheDocument();
    // La descripción se muestra tal cual la entrega el catálogo del backend.
    expect(screen.getByText(DESCRIPCION_CATALOGO)).toBeInTheDocument();
    expect(screen.getByText(/En este estado desde/)).toBeInTheDocument();
  });

  it('sin onVerDetalleCompleto no renderiza el enlace', () => {
    render(<SeguimientoOferta {...base} candidato={candidatoFinal()} />);
    expect(screen.queryByRole('button', { name: 'Ver detalle completo' })).not.toBeInTheDocument();
  });

  it('con onVerDetalleCompleto, el clic invoca el callback exactamente una vez', async () => {
    const onVerDetalleCompleto = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoOferta
        {...base}
        candidato={candidatoFinal()}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: 'Ver detalle completo' }));
    expect(onVerDetalleCompleto).toHaveBeenCalledOnce();
  });
});
