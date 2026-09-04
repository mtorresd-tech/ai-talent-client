import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { EstadoIntegracion } from '../../integraciones';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { SeguimientoBluesite } from './SeguimientoBluesite';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

const catalogoBluesite = [
  {
    clave: 'EN_PRUEBAS_BLUESITE',
    etiqueta: 'En pruebas psicotécnicas',
    descripcion: 'Pruebas psicotécnicas en curso.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'RESULTADO_PRUEBAS_BLUESITE',
    etiqueta: 'Resultado de pruebas psicotécnicas',
    descripcion: 'Bluesite entregó el resultado.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'BLUESITE',
    compuertaEtiqueta: 'Pruebas psicotécnicas',
    transicionesPermitidas: [],
  },
  {
    clave: 'APROBO_PRUEBAS_BLUESITE',
    etiqueta: 'Aprobó pruebas psicotécnicas',
    descripcion: 'El candidato aprobó las pruebas.',
    categoria: 'APROBADO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'DESCARTADO_PRUEBAS_BLUESITE',
    etiqueta: 'Descartado en pruebas psicotécnicas',
    descripcion: 'El candidato fue descartado.',
    categoria: 'DESCARTADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

function integracionBluesite(overrides: Partial<EstadoIntegracion> = {}): EstadoIntegracion {
  return {
    proveedor: 'BLUESITE',
    subestado: 'RESULTADO_RECIBIDO',
    idExterno: 'ext-1',
    fechaSolicitud: '2026-01-01T00:00:00Z',
    fechaResultado: '2026-01-05T00:00:00Z',
    fechaExpiracion: null,
    intentos: 1,
    resultado: {
      tipo: 'BLUESITE',
      pruebas: [
        {
          tipoPrueba: 'Betesa',
          respondida: true,
          fechaEnvio: '2026-01-01T00:00:00Z',
          fechaRespuesta: '2026-01-03T00:00:00Z',
          competencias: [{ nombre: 'Comunicación', puntaje: 88.4 }],
        },
      ],
    },
    ...overrides,
  };
}

function candidato(
  estado: EstadoProceso,
  overrides: Partial<CandidatoDetalle> = {},
): CandidatoDetalle {
  return {
    jobApplicationId: 'APP-1',
    jobRequisitionId: 'REQ-1',
    alias: 'Candidato 1',
    nombre: 'Ana Pérez',
    numeroDocumento: '123',
    estado,
    estadoDesde: '2026-01-12T00:00:00Z',
    estadoSfsf: null,
    fechaPostulacion: '2026-01-11T00:00:00Z',
    origenPostulacion: 'LinkedIn',
    scoreAfinidad: null,
    rankingPosicion: null,
    esperandoDecision: false,
    compuertaPendiente: null,
    desgloseAfinidad: null,
    integraciones: [integracionBluesite()],
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

describe('SeguimientoBluesite', () => {
  it('sin candidato muestra el estado vacío', () => {
    render(<SeguimientoBluesite {...base} candidato={null} />);
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('cargando y sin candidato previo muestra la barra de progreso', () => {
    render(<SeguimientoBluesite {...base} candidato={null} cargando />);
    expect(screen.getByLabelText('Cargando seguimiento')).toBeInTheDocument();
  });

  it('con error muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoBluesite
        {...base}
        candidato={null}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });

  it('con resultado pendiente de revisión muestra nombre, chip, distintivo y la tarjeta del proveedor', () => {
    render(
      <SeguimientoBluesite
        {...base}
        catalogo={catalogoBluesite}
        candidato={candidato('RESULTADO_PRUEBAS_BLUESITE', { tipoCandidato: 'INTERNO' })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Resultado de pruebas psicotécnicas')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Con resultado, pendiente de revisión' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Bluesite entregó el resultado/i)).toBeInTheDocument();
    expect(screen.getByText('Interno')).toBeInTheDocument();
    expect(screen.getByText(/En este estado desde/i)).toBeInTheDocument();
    expect(screen.getByText('Comunicación: 88')).toBeInTheDocument();
    // Solo consulta: sin ningún control de decisión.
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('con candidato aprobado muestra la frase de aprobación en color success', () => {
    render(
      <SeguimientoBluesite
        {...base}
        catalogo={catalogoBluesite}
        candidato={candidato('APROBO_PRUEBAS_BLUESITE')}
      />,
    );

    expect(screen.getByText('Aprobó las pruebas')).toBeInTheDocument();
    expect(screen.getByText(/Continúa el proceso/i)).toBeInTheDocument();
    const chip = screen.getByText('Aprobó pruebas psicotécnicas');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
  });

  it('con candidato descartado muestra la frase de descarte en color error', () => {
    render(
      <SeguimientoBluesite
        {...base}
        catalogo={catalogoBluesite}
        candidato={candidato('DESCARTADO_PRUEBAS_BLUESITE')}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Descartado en pruebas psicotécnicas' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fue descartado en las pruebas/i)).toBeInTheDocument();
    const chip = screen.getAllByText('Descartado en pruebas psicotécnicas')[0];
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
  });

  it('sin integración de Bluesite muestra el resto del panel y el texto informativo', () => {
    render(
      <SeguimientoBluesite
        {...base}
        catalogo={catalogoBluesite}
        candidato={candidato('EN_PRUEBAS_BLUESITE', { integraciones: [] })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Sin información del proveedor todavía.')).toBeInTheDocument();
  });

  it('con un resultado que no calza el shape, la tarjeta degrada a "Sin resultado estructurado"', () => {
    render(
      <SeguimientoBluesite
        {...base}
        catalogo={catalogoBluesite}
        candidato={candidato('EN_PRUEBAS_BLUESITE', {
          integraciones: [
            integracionBluesite({
              resultado: { inesperado: true } as unknown as EstadoIntegracion['resultado'],
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Sin resultado estructurado')).toBeInTheDocument();
  });

  it('renderiza el enlace "Ver detalle completo" solo si se pasa el callback', async () => {
    const onVerDetalleCompleto = vi.fn();
    const usuario = userEvent.setup();
    const { rerender } = render(
      <SeguimientoBluesite {...base} candidato={candidato('EN_PRUEBAS_BLUESITE')} />,
    );
    expect(screen.queryByRole('button', { name: 'Ver detalle completo' })).not.toBeInTheDocument();

    rerender(
      <SeguimientoBluesite
        {...base}
        candidato={candidato('EN_PRUEBAS_BLUESITE')}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );
    await usuario.click(screen.getByRole('button', { name: 'Ver detalle completo' }));
    expect(onVerDetalleCompleto).toHaveBeenCalledOnce();
  });

  it('muestra el aviso de sincronización fallida cuando aplica', () => {
    render(
      <SeguimientoBluesite
        {...base}
        candidato={candidato('EN_PRUEBAS_BLUESITE', {
          sincronizacionSfsf: {
            estado: 'FALLIDA',
            ultimaSincronizacion: null,
            intentos: 2,
            ultimoError: 'error de red',
          },
        })}
      />,
    );

    expect(
      screen.getByText(/La sincronización con SuccessFactors falló\. error de red/),
    ).toBeInTheDocument();
  });
});
