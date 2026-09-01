import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutPasoPipeline } from './LayoutPasoPipeline';

describe('LayoutPasoPipeline', () => {
  it('renderiza el contenido de ambos slots', () => {
    render(
      <LayoutPasoPipeline
        izquierda={<div>Lista de candidatos</div>}
        derecha={<div>Resultado Selecta</div>}
      />,
    );

    expect(screen.getByText('Lista de candidatos')).toBeInTheDocument();
    expect(screen.getByText('Resultado Selecta')).toBeInTheDocument();
  });
});
