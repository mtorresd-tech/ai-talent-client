import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetalleResultadoMedilaboral } from './DetalleResultadoMedilaboral';

describe('DetalleResultadoMedilaboral', () => {
  it('con un resultado inválido muestra "Sin resultado estructurado"', () => {
    render(<DetalleResultadoMedilaboral resultado={{ idOrdenServicio: 1 }} />);
    expect(screen.getByText('Sin resultado estructurado')).toBeInTheDocument();
  });

  it('con conceptoAptitud APTO renderiza el chip en success con la etiqueta "Apto"', () => {
    render(
      <DetalleResultadoMedilaboral
        resultado={{
          tipo: 'MEDILABORAL',
          idOrdenServicio: 'OS-4',
          modalidad: 'CITA_PREVIA',
          conceptoAptitud: 'APTO',
          observaciones: null,
          fechaConcepto: '2026-08-10T00:00:00Z',
        }}
      />,
    );

    const chip = screen.getByText('Apto');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(screen.queryByText(/Observaciones:/)).not.toBeInTheDocument();
  });

  it('con conceptoAptitud APTO_CON_OBSERVACIONES renderiza el chip en warning y las observaciones', () => {
    render(
      <DetalleResultadoMedilaboral
        resultado={{
          tipo: 'MEDILABORAL',
          idOrdenServicio: 'OS-71614',
          conceptoAptitud: 'APTO_CON_OBSERVACIONES',
          observaciones: 'Requiere pausas activas cada dos horas.',
          fechaConcepto: '2026-08-09T00:00:00Z',
        }}
      />,
    );

    const chip = screen.getByText('Apto con observaciones');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning');
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === 'Observaciones: Requiere pausas activas cada dos horas.',
      ),
    ).toBeInTheDocument();
  });

  it('con conceptoAptitud NO_APTO renderiza el chip en error y sus observaciones', () => {
    render(
      <DetalleResultadoMedilaboral
        resultado={{
          tipo: 'MEDILABORAL',
          idOrdenServicio: 'OS-97',
          conceptoAptitud: 'NO_APTO',
          observaciones: 'Agudeza visual por debajo del mínimo para trabajo en alturas.',
          fechaConcepto: '2026-08-11T00:00:00Z',
        }}
      />,
    );

    const chip = screen.getByText('No apto');
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          'Observaciones: Agudeza visual por debajo del mínimo para trabajo en alturas.',
      ),
    ).toBeInTheDocument();
  });

  it('con un resultado parcial (sin cita ni concepto) omite esas líneas y muestra lo disponible', () => {
    render(
      <DetalleResultadoMedilaboral
        resultado={{
          tipo: 'MEDILABORAL',
          idOrdenServicio: 'OS-60',
          fechaCita: null,
          sede: 'Sede Norte',
          modalidad: 'ORDEN_DE_LLEGADA',
          conceptoAptitud: null,
          observaciones: null,
          fechaConcepto: null,
        }}
      />,
    );

    expect(screen.getByText('OS-60')).toBeInTheDocument();
    expect(screen.getByText('Sede: Sede Norte')).toBeInTheDocument();
    expect(screen.queryByText(/Cita:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Observaciones:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fecha de concepto:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Apto')).not.toBeInTheDocument();
    expect(screen.queryByText('Apto con observaciones')).not.toBeInTheDocument();
    expect(screen.queryByText('No apto')).not.toBeInTheDocument();
  });
});
