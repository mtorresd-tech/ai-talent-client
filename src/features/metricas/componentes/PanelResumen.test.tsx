import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderConTema } from '../../../test/renderConTema';
import { PanelResumen } from './PanelResumen';

describe('PanelResumen', () => {
  it('con totalRequisiciones=7 muestra la etiqueta "Requisiciones gestionadas" y el valor 7', () => {
    renderConTema(
      <PanelResumen
        datos={{ totalRequisiciones: 7, candidatosActivos: 20, tasaCierre: 50 }}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    );

    expect(screen.getByText('Requisiciones gestionadas')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByText('Requisiciones publicadas')).not.toBeInTheDocument();
  });
});
