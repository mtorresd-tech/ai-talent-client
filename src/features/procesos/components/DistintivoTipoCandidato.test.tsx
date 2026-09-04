import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistintivoTipoCandidato } from './DistintivoTipoCandidato';

describe('DistintivoTipoCandidato', () => {
  it('muestra "Interno" para un candidato interno', () => {
    render(<DistintivoTipoCandidato tipo="INTERNO" />);
    expect(screen.getByText('Interno')).toBeInTheDocument();
  });

  it('muestra "Externo" para un candidato externo', () => {
    render(<DistintivoTipoCandidato tipo="EXTERNO" />);
    expect(screen.getByText('Externo')).toBeInTheDocument();
  });

  it('no renderiza nada si el tipo no está disponible', () => {
    const { container } = render(<DistintivoTipoCandidato tipo={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
