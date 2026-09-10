import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { EstadoIntegracion } from '../../integraciones';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { SeguimientoMedilaboral } from './SeguimientoMedilaboral';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

const catalogoMedilaboral = [
  {
    clave: 'EN_PRUEBAS_MEDILABORAL',
    etiqueta: 'En exámenes médicos',
    descripcion: 'Exámenes médicos en curso.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'RESULTADO_PRUEBAS_MEDILABORAL',
    etiqueta: 'Resultado de exámenes médicos',
    descripcion: 'Medilaboral entregó el concepto de aptitud.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'MEDILABORAL',
    compuertaEtiqueta: 'Exámenes médicos',
    transicionesPermitidas: [],
  },
  {
    clave: 'APROBO_PRUEBAS_MEDILABORAL',
    etiqueta: 'Aprobó exámenes médicos',
    descripcion: 'El candidato aprobó los exámenes médicos.',
    categoria: 'APROBADO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'DESCARTADO_PRUEBAS_MEDILABORAL',
    etiqueta: 'Descartado en exámenes médicos',
    descripcion: 'El candidato fue descartado.',
    categoria: 'DESCARTADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

function integracionMedilaboral(overrides: Partial<EstadoIntegracion> = {}): EstadoIntegracion {
  return {
    proveedor: 'MEDILABORAL',
    subestado: 'RESULTADO_RECIBIDO',
    idExterno: 'ext-1',
    fechaSolicitud: '2026-08-01T00:00:00Z',
    fechaResultado: null,
    fechaExpiracion: null,
    intentos: 1,
    resultado: {
      tipo: 'MEDILABORAL',
      idOrdenServicio: 'OS-71614',
      fechaCita: '2026-08-06T00:00:00Z',
      sede: 'Sede Centro',
      modalidad: 'CITA_PREVIA',
      conceptoAptitud: 'APTO_CON_OBSERVACIONES',
      observaciones: 'Requiere pausas activas cada dos horas.',
      fechaConcepto: '2026-08-09T00:00:00Z',
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
    estadoDesde: '2026-08-12T00:00:00Z',
    estadoSfsf: null,
    fechaPostulacion: '2026-08-11T00:00:00Z',
    origenPostulacion: 'LinkedIn',
    scoreAfinidad: null,
    rankingPosicion: null,
    esperandoDecision: false,
    compuertaPendiente: null,
    desgloseAfinidad: null,
    integraciones: [integracionMedilaboral()],
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

describe('SeguimientoMedilaboral', () => {
  it('sin candidato muestra el estado vacío', () => {
    render(<SeguimientoMedilaboral {...base} candidato={null} />);
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('cargando y sin candidato previo muestra la barra de progreso', () => {
    render(<SeguimientoMedilaboral {...base} candidato={null} cargando />);
    expect(screen.getByLabelText('Cargando seguimiento')).toBeInTheDocument();
  });

  it('con error muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoMedilaboral
        {...base}
        candidato={null}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });

  it('con exámenes en curso muestra nombre, distintivo externo y sin ningún control de decisión', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        catalogo={catalogoMedilaboral}
        candidato={candidato('EN_PRUEBAS_MEDILABORAL', { tipoCandidato: 'EXTERNO' })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Externo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('con resultado pendiente de revisión muestra el copy de la zona gris y el chip warning', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        catalogo={catalogoMedilaboral}
        candidato={candidato('RESULTADO_PRUEBAS_MEDILABORAL')}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Con resultado, pendiente de revisión (zona gris)' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no aprueba ni descarta por sí solo/i)).toBeInTheDocument();
    const chip = screen.getByText('Apto con observaciones');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
  });

  it('con candidato aprobado muestra el chip de concepto en success', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        catalogo={catalogoMedilaboral}
        candidato={candidato('APROBO_PRUEBAS_MEDILABORAL', {
          integraciones: [
            integracionMedilaboral({
              resultado: {
                tipo: 'MEDILABORAL',
                idOrdenServicio: 'OS-1',
                fechaCita: null,
                sede: null,
                modalidad: 'CITA_PREVIA',
                conceptoAptitud: 'APTO',
                observaciones: null,
                fechaConcepto: '2026-08-10T00:00:00Z',
              },
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Aprobó los exámenes médicos')).toBeInTheDocument();
    const chip = screen.getByText('Apto');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
  });

  it('con candidato descartado muestra el chip de concepto en error', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        catalogo={catalogoMedilaboral}
        candidato={candidato('DESCARTADO_PRUEBAS_MEDILABORAL', {
          integraciones: [
            integracionMedilaboral({
              resultado: {
                tipo: 'MEDILABORAL',
                idOrdenServicio: 'OS-97',
                fechaCita: null,
                sede: null,
                modalidad: null,
                conceptoAptitud: 'NO_APTO',
                observaciones: 'Agudeza visual por debajo del mínimo para trabajo en alturas.',
                fechaConcepto: '2026-08-11T00:00:00Z',
              },
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Descartado en exámenes médicos' }),
    ).toBeInTheDocument();
    const chip = screen.getByText('No apto');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
  });

  it('sin integración de Medilaboral muestra el resto del panel y el texto informativo', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        catalogo={catalogoMedilaboral}
        candidato={candidato('EN_PRUEBAS_MEDILABORAL', { integraciones: [] })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Sin información del proveedor todavía.')).toBeInTheDocument();
  });

  it('renderiza el enlace "Ver detalle completo" solo si se pasa el callback', async () => {
    const onVerDetalleCompleto = vi.fn();
    const usuario = userEvent.setup();
    const { rerender } = render(
      <SeguimientoMedilaboral {...base} candidato={candidato('EN_PRUEBAS_MEDILABORAL')} />,
    );
    expect(screen.queryByRole('button', { name: 'Ver detalle completo' })).not.toBeInTheDocument();

    rerender(
      <SeguimientoMedilaboral
        {...base}
        candidato={candidato('EN_PRUEBAS_MEDILABORAL')}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );
    await usuario.click(screen.getByRole('button', { name: 'Ver detalle completo' }));
    expect(onVerDetalleCompleto).toHaveBeenCalledOnce();
  });

  it('muestra el aviso de sincronización fallida cuando aplica', () => {
    render(
      <SeguimientoMedilaboral
        {...base}
        candidato={candidato('EN_PRUEBAS_MEDILABORAL', {
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
