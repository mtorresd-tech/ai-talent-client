import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SincronizacionSfsf } from '../../../shared/tipos/dominio';
import { EstadoSincronizacionSfsf } from './EstadoSincronizacionSfsf';

function sincronizacion(overrides: Partial<SincronizacionSfsf> = {}): SincronizacionSfsf {
  return {
    estado: 'SINCRONIZADO',
    ultimaSincronizacion: null,
    intentos: 0,
    ultimoError: null,
    ...overrides,
  };
}

describe('EstadoSincronizacionSfsf', () => {
  it('con estado SINCRONIZADO y sin fecha muestra el texto neutro y "Sin fecha", sin aviso', () => {
    render(<EstadoSincronizacionSfsf sincronizacion={sincronizacion()} />);

    expect(screen.getByText('Sincronizado con SuccessFactors')).toBeInTheDocument();
    expect(screen.getByText(/Sin fecha/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con estado FALLIDA muestra un aviso de advertencia con el error y los intentos', () => {
    render(
      <EstadoSincronizacionSfsf
        sincronizacion={sincronizacion({
          estado: 'FALLIDA',
          ultimoError: 'timeout al llamar a SFSF',
          intentos: 3,
        })}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent(/timeout al llamar a SFSF/);
    expect(aviso).toHaveTextContent(/3 intentos/);
  });

  it('con estado PENDIENTE muestra el texto "en curso" sin aviso de error', () => {
    render(<EstadoSincronizacionSfsf sincronizacion={sincronizacion({ estado: 'PENDIENTE' })} />);

    expect(screen.getByText(/en curso/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
