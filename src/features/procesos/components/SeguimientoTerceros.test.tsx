import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { EstadoIntegracion } from '../../integraciones';
import { SeguimientoTerceros } from './SeguimientoTerceros';

function integracion(proveedor: EstadoIntegracion['proveedor']): EstadoIntegracion {
  return {
    proveedor,
    subestado: 'EN_CURSO',
    idExterno: null,
    fechaSolicitud: '2026-01-01T00:00:00Z',
    fechaResultado: null,
    fechaExpiracion: null,
    intentos: 0,
    resultado: null,
  };
}

describe('SeguimientoTerceros', () => {
  it('sin integraciones muestra el mensaje de "sin evaluaciones" y el banner', () => {
    render(<SeguimientoTerceros integraciones={[]} />);

    expect(screen.getByText(/Todavía no hay evaluaciones de terceros/i)).toBeInTheDocument();
    expect(screen.getByText(/proveedores externos/i)).toBeInTheDocument();
  });

  it('con 3 proveedores renderiza una tarjeta por cada uno y ningún botón de acción', () => {
    render(
      <SeguimientoTerceros
        integraciones={[
          integracion('BLUESITE'),
          integracion('COSINTE'),
          integracion('MEDILABORAL'),
        ]}
      />,
    );

    expect(screen.getByText('Bluesite')).toBeInTheDocument();
    expect(screen.getByText('Cosinte')).toBeInTheDocument();
    expect(screen.getByText('Medilaboral')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
