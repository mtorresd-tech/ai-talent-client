import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { VacanteDetalle } from '../api/vacantes';
import { errorApi } from '../../../test/clienteApiFalso';
import { TarjetaDetalleVacante } from './TarjetaDetalleVacante';

const detalle: VacanteDetalle = {
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

describe('TarjetaDetalleVacante', () => {
  it('muestra las cinco etiquetas con sus valores', () => {
    render(
      <TarjetaDetalleVacante
        detalle={detalle}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    );

    expect(screen.getByText('Área · ciudad')).toBeInTheDocument();
    expect(screen.getByText('Tecnología · Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Candidatos en proceso')).toBeInTheDocument();
    expect(screen.getByText('Fecha de apertura')).toBeInTheDocument();
    expect(screen.getByText('Fecha estimada de cierre')).toBeInTheDocument();
    expect(screen.getByText('Reclutador a cargo')).toBeInTheDocument();
    expect(screen.getByText('Karen Rincón')).toBeInTheDocument();
  });

  it('apila el grid de campos en una sola columna en el breakpoint base (xs)', () => {
    render(
      <TarjetaDetalleVacante
        detalle={detalle}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    );

    // jsdom no resuelve clases de emotion vía `getComputedStyle`: se inspecciona
    // el CSS inyectado directamente.
    const estilos = Array.from(document.querySelectorAll('style'))
      .map((tag) => tag.textContent ?? '')
      .join('');
    expect(estilos).toMatch(/grid-template-columns:\s*1fr[;}"]/);
    expect(estilos).toMatch(/@media[\s\S]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  });

  it('muestra el texto de carga mientras no hay detalle', () => {
    render(<TarjetaDetalleVacante detalle={null} cargando error={null} onReintentar={vi.fn()} />);

    expect(screen.getByText('Cargando detalle de la vacante…')).toBeInTheDocument();
  });

  it('muestra el estado de error con opción de reintentar', () => {
    const onReintentar = vi.fn();
    render(
      <TarjetaDetalleVacante
        detalle={null}
        cargando={false}
        error={errorApi(500)}
        onReintentar={onReintentar}
      />,
    );

    expect(screen.queryByText('Área · ciudad')).not.toBeInTheDocument();
  });
});
