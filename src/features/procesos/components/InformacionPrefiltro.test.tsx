import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Prefiltro } from '../api/prefiltro';
import { InformacionPrefiltro } from './InformacionPrefiltro';

const prefiltro: Prefiltro = {
  jobApplicationId: 'APP-1',
  cumplePerfil: true,
  interesContinuidad: false,
  desempenoUltimoAnio: 'Sobresaliente',
  tiempoVinculacion: 'Menos de 1 año',
  sancionadoUltimoAnio: false,
  promovidoUltimoAnio: true,
  observaciones: 'Sin novedades',
  registradoPor: 'ana@geb.com.co',
  registradoEn: '2026-01-01T00:00:00Z',
  sincronizacionSfsf: {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
  },
};

describe('InformacionPrefiltro', () => {
  it('sin prefiltro muestra el vacío informativo', () => {
    render(<InformacionPrefiltro prefiltro={null} />);
    expect(screen.getByText('Sin prefiltro')).toBeInTheDocument();
  });

  it('con datos pinta las filas con dato real, sin aspiración salarial ni disponibilidad', () => {
    render(<InformacionPrefiltro prefiltro={prefiltro} />);

    expect(screen.getByText('Cumple el perfil')).toBeInTheDocument();
    expect(screen.queryByText('Aspiración salarial')).not.toBeInTheDocument();
    expect(screen.queryByText('Disponibilidad')).not.toBeInTheDocument();
  });

  it('con el payload real de APP-00040 muestra los 3 campos nuevos con sus valores', () => {
    render(<InformacionPrefiltro prefiltro={prefiltro} />);

    expect(screen.getByText('Tiempo de vinculación')).toBeInTheDocument();
    expect(screen.getByText('Menos de 1 año')).toBeInTheDocument();
    const filaSancionado = screen.getByText('Sancionado en el último año').closest('div');
    const filaPromovido = screen.getByText('Promovido en el último año').closest('div');
    expect(filaSancionado).toHaveTextContent('No');
    expect(filaPromovido).toHaveTextContent('Sí');
  });

  it('con los 3 campos nuevos ausentes no renderiza esas filas ni lanza excepción', () => {
    const prefiltroSinCamposNuevos: Prefiltro = {
      ...prefiltro,
      tiempoVinculacion: null,
      sancionadoUltimoAnio: null,
      promovidoUltimoAnio: null,
    };

    render(<InformacionPrefiltro prefiltro={prefiltroSinCamposNuevos} />);

    expect(screen.queryByText('Tiempo de vinculación')).not.toBeInTheDocument();
    expect(screen.queryByText('Sancionado en el último año')).not.toBeInTheDocument();
    expect(screen.queryByText('Promovido en el último año')).not.toBeInTheDocument();
  });
});
