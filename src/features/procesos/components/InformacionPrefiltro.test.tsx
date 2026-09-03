import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Prefiltro } from '../api/prefiltro';
import { InformacionPrefiltro } from './InformacionPrefiltro';

const prefiltro: Prefiltro = {
  jobApplicationId: 'APP-1',
  cumplePerfil: true,
  interesContinuidad: false,
  desempenoUltimoAnio: 'Sobresaliente',
  aspiracionSalarial: 5500000,
  disponibilidad: 'Inmediata',
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

  it('con datos formatea la aspiración salarial en pesos colombianos', () => {
    render(<InformacionPrefiltro prefiltro={prefiltro} />);

    expect(screen.getByText(/5\.500\.000/)).toBeInTheDocument();
    expect(screen.getByText('Inmediata')).toBeInTheDocument();
    expect(screen.getByText('Cumple el perfil')).toBeInTheDocument();
  });
});
