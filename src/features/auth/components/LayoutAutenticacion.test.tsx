import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderConTema } from '../../../test/renderConTema';
import { LayoutAutenticacion } from './LayoutAutenticacion';

describe('LayoutAutenticacion', () => {
  it('renderiza PanelHeroLogin, EncabezadoCompactoLogin y los children recibidos', () => {
    renderConTema(
      <LayoutAutenticacion>
        <div>Contenido de prueba</div>
      </LayoutAutenticacion>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Selecta 2.0');
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Selecta 2.0');
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });
});
