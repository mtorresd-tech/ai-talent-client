import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderConTema } from '../../../test/renderConTema';
import { PantallaCargaSesion } from './PantallaCargaSesion';

describe('PantallaCargaSesion', () => {
  it('muestra el spinner, el texto de estado y el panel de marca', () => {
    renderConTema(<PantallaCargaSesion />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Cargando tu sesión…')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Selecta 2.0');
  });
});
