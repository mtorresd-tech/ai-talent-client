import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorApi } from '../../../test/clienteApiFalso';
import type { EstadoProceso, TipoCandidato } from '../../../shared/tipos/dominio';
import type { EstadoIntegracion } from '../../integraciones';
import type { CandidatoDetalle } from '../api/candidatos';
import type { EstadoCatalogo } from '../api/catalogos';
import { SeguimientoCosinte } from './SeguimientoCosinte';

const base = {
  cargando: false,
  error: null,
  onReintentar: vi.fn(),
};

const catalogoCosinte = [
  {
    clave: 'EN_PRUEBAS_COSINTE',
    etiqueta: 'En estudio de seguridad',
    descripcion: 'Estudio de seguridad en curso.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'RESULTADO_PRUEBAS_COSINTE',
    etiqueta: 'Resultado del estudio de seguridad',
    descripcion: 'Cosinte entregó el nivel de riesgo.',
    categoria: 'EN_CURSO',
    terminal: false,
    compuertaPendiente: 'COSINTE',
    compuertaEtiqueta: 'Estudio de seguridad',
    transicionesPermitidas: [],
  },
  {
    clave: 'APROBO_PRUEBAS_COSINTE',
    etiqueta: 'Aprobó estudio de seguridad',
    descripcion: 'El candidato aprobó el estudio de seguridad.',
    categoria: 'APROBADO',
    terminal: false,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'DESCARTADO_PRUEBAS_COSINTE',
    etiqueta: 'Descartado en estudio de seguridad',
    descripcion: 'El candidato fue descartado.',
    categoria: 'DESCARTADO',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
  {
    clave: 'BLOQUEADO_COSINTE_6M',
    etiqueta: 'Bloqueado por 6 meses',
    descripcion: 'Ya existe un proceso activo con este documento.',
    categoria: 'EXCEPCION',
    terminal: true,
    compuertaPendiente: null,
    compuertaEtiqueta: null,
    transicionesPermitidas: [],
  },
] as unknown as EstadoCatalogo[];

function integracionCosinte(overrides: Partial<EstadoIntegracion> = {}): EstadoIntegracion {
  return {
    proveedor: 'COSINTE',
    subestado: 'RESULTADO_RECIBIDO',
    idExterno: 'ext-1',
    fechaSolicitud: '2026-01-01T00:00:00Z',
    fechaResultado: null,
    fechaExpiracion: null,
    intentos: 1,
    resultado: {
      tipo: 'COSINTE',
      estado: 'En proceso',
      nivelRiesgo: 'Bajo',
      fechaSolicitud: '2026-01-01T00:00:00Z',
      tiempos: { diasHabiles: 8, diasRestantes: 4, progreso: 0.5 },
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
    integraciones: [integracionCosinte()],
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

describe('SeguimientoCosinte', () => {
  it('sin candidato muestra el estado vacío', () => {
    render(<SeguimientoCosinte {...base} candidato={null} />);
    expect(screen.getByText('Selecciona un candidato')).toBeInTheDocument();
  });

  it('cargando y sin candidato previo muestra la barra de progreso', () => {
    render(<SeguimientoCosinte {...base} candidato={null} cargando />);
    expect(screen.getByLabelText('Cargando seguimiento')).toBeInTheDocument();
  });

  it('con error muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <SeguimientoCosinte
        {...base}
        candidato={null}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReintentar).toHaveBeenCalledOnce();
  });

  it('con un estudio en curso muestra nombre, chip, distintivo externo y la barra de avance al 50%', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('EN_PRUEBAS_COSINTE', { tipoCandidato: 'EXTERNO' })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    // El chip de estado (catálogo) y el título del resumen coinciden en texto para este estado.
    expect(screen.getAllByText('En estudio de seguridad')).toHaveLength(2);
    expect(screen.getByText('Externo')).toBeInTheDocument();
    expect(screen.getByText('50% completado')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Avance del estudio de seguridad' }),
    ).toBeInTheDocument();
    // Solo consulta: sin ningún control de decisión.
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('con resultado pendiente de revisión muestra el copy correspondiente', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('RESULTADO_PRUEBAS_COSINTE')}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Con resultado, pendiente de revisión' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cosinte entregó el nivel de riesgo/i)).toBeInTheDocument();
  });

  it('con candidato aprobado muestra la frase de aprobación en color success', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('APROBO_PRUEBAS_COSINTE')}
      />,
    );

    expect(screen.getByText('Aprobó el estudio de seguridad')).toBeInTheDocument();
    const chip = screen.getByText('Aprobó estudio de seguridad');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
  });

  it('con candidato descartado muestra la frase de descarte en color error', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('DESCARTADO_PRUEBAS_COSINTE')}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Descartado en estudio de seguridad' }),
    ).toBeInTheDocument();
    const chip = screen.getAllByText('Descartado en estudio de seguridad')[0];
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
  });

  it('con candidato bloqueado por la regla de 6 meses muestra el título y el color warning, sin acción', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('BLOQUEADO_COSINTE_6M')}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Bloqueado por la regla de 6 meses' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/requiere decisión del reclutador/i)).toBeInTheDocument();
    const chip = screen.getByText('Bloqueado por 6 meses');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    expect(screen.queryByRole('button', { name: /desbloquear/i })).not.toBeInTheDocument();
  });

  it('sin integración de Cosinte muestra el resto del panel y el texto informativo', () => {
    render(
      <SeguimientoCosinte
        {...base}
        catalogo={catalogoCosinte}
        candidato={candidato('EN_PRUEBAS_COSINTE', { integraciones: [] })}
      />,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Sin información del proveedor todavía.')).toBeInTheDocument();
  });

  it('renderiza el enlace "Ver detalle completo" solo si se pasa el callback', async () => {
    const onVerDetalleCompleto = vi.fn();
    const usuario = userEvent.setup();
    const { rerender } = render(
      <SeguimientoCosinte {...base} candidato={candidato('EN_PRUEBAS_COSINTE')} />,
    );
    expect(screen.queryByRole('button', { name: 'Ver detalle completo' })).not.toBeInTheDocument();

    rerender(
      <SeguimientoCosinte
        {...base}
        candidato={candidato('EN_PRUEBAS_COSINTE')}
        onVerDetalleCompleto={onVerDetalleCompleto}
      />,
    );
    await usuario.click(screen.getByRole('button', { name: 'Ver detalle completo' }));
    expect(onVerDetalleCompleto).toHaveBeenCalledOnce();
  });

  it('muestra el aviso de sincronización fallida cuando aplica', () => {
    render(
      <SeguimientoCosinte
        {...base}
        candidato={candidato('EN_PRUEBAS_COSINTE', {
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
