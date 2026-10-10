import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { GebForm, useGebForm } from '@geb/forms';
import { CampoTextoLargo, type CampoTextoLargoProps } from './CampoTextoLargo';

const esquema = z.object({ texto: z.string().trim().min(1, 'Este campo es obligatorio') });

function Formulario(props: CampoTextoLargoProps) {
  const form = useGebForm({ schema: esquema, valoresIniciales: { texto: '' } });
  return (
    <GebForm form={form} onSubmit={() => undefined}>
      <CampoTextoLargo {...props} />
      <button type="submit">Enviar</button>
    </GebForm>
  );
}

describe('CampoTextoLargo', () => {
  it('renderiza un campo multilínea con límite de caracteres y contador', async () => {
    render(
      <Formulario name="texto" label="Fortalezas" maximo={10} ayuda="Describe las fortalezas" />,
    );

    const campo = screen.getByRole('textbox', { name: 'Fortalezas' });
    expect(campo.tagName).toBe('TEXTAREA');
    expect(campo).toHaveAttribute('maxLength', '10');
    expect(screen.getByText('Describe las fortalezas')).toBeInTheDocument();
    expect(screen.getByText('0 / 10')).toBeInTheDocument();

    await userEvent.type(campo, 'Liderazgo con equipos');
    expect(campo).toHaveValue('Liderazgo ');
    expect(screen.getByText('10 / 10')).toBeInTheDocument();
  });

  it('muestra el error del esquema', async () => {
    render(<Formulario name="texto" label="Fortalezas" maximo={100} requerido />);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument());
    expect(screen.getByRole('textbox', { name: /Fortalezas/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
