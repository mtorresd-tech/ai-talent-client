import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetalleResultadoCosinte } from './DetalleResultadoCosinte';

describe('DetalleResultadoCosinte', () => {
  it('con un resultado inválido muestra "Sin resultado estructurado"', () => {
    render(<DetalleResultadoCosinte resultado={{ estado: 'no-reconocido' }} />);
    expect(screen.getByText('Sin resultado estructurado')).toBeInTheDocument();
  });

  it('con tiempos muestra la barra de avance, el porcentaje y los días restantes', () => {
    render(
      <DetalleResultadoCosinte
        resultado={{
          tipo: 'COSINTE',
          estado: 'En proceso',
          nivelRiesgo: 'Bajo',
          fechaSolicitud: '2026-01-01',
          tiempos: { diasHabiles: 8, diasRestantes: 4, progreso: 0.5 },
        }}
      />,
    );

    expect(screen.getByText('50% completado')).toBeInTheDocument();
    const barra = screen.getByRole('progressbar', { name: 'Avance del estudio de seguridad' });
    expect(barra).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('4 de 8 días hábiles restantes')).toBeInTheDocument();
  });

  it('sin tiempos no muestra porcentaje, barra ni línea de días', () => {
    render(
      <DetalleResultadoCosinte
        resultado={{
          tipo: 'COSINTE',
          estado: 'Solicitado',
          nivelRiesgo: null,
          fechaSolicitud: '2026-01-01',
          tiempos: null,
        }}
      />,
    );

    expect(screen.queryByText(/completado/)).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/días hábiles restantes/)).not.toBeInTheDocument();
    expect(screen.getByText('Solicitado')).toBeInTheDocument();
  });

  it('sin nivelRiesgo no muestra esa línea, el resto del bloque se muestra igual', () => {
    render(
      <DetalleResultadoCosinte
        resultado={{
          tipo: 'COSINTE',
          estado: 'Finalizado',
          nivelRiesgo: null,
          fechaSolicitud: '2026-01-01',
          tiempos: null,
        }}
      />,
    );

    expect(screen.queryByText(/Nivel de riesgo/)).not.toBeInTheDocument();
    expect(screen.getByText('Finalizado')).toBeInTheDocument();
  });
});
