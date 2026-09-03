import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MigasDetalleCandidato } from './MigasDetalleCandidato';

describe('MigasDetalleCandidato', () => {
  it('el enlace "Procesos" apunta a la ruta de retorno con el contexto', () => {
    render(
      <MemoryRouter>
        <MigasDetalleCandidato
          nombre="Ana Pérez"
          urlVolver="/procesos?vacante=REQ-1&paso=SELECTA&candidato=APP-1"
        />
      </MemoryRouter>,
    );

    const enlace = screen.getByRole('link', { name: 'Procesos' });
    expect(enlace).toHaveAttribute('href', '/procesos?vacante=REQ-1&paso=SELECTA&candidato=APP-1');
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });
});
