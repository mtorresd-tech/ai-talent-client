import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SesionApiProvider } from './SesionApiProvider';
import { useSesionApi } from './SesionApiContext';

function ConsumidorSesionApi() {
  const { sesionSinRol, marcarSesionSinRol, limpiarSesionSinRol } = useSesionApi();

  return (
    <div>
      <span>sesionSinRol: {String(sesionSinRol)}</span>
      <button onClick={marcarSesionSinRol}>Marcar</button>
      <button onClick={limpiarSesionSinRol}>Limpiar</button>
    </div>
  );
}

function renderConsumidor() {
  return render(
    <SesionApiProvider>
      <ConsumidorSesionApi />
    </SesionApiProvider>,
  );
}

describe('SesionApiProvider', () => {
  it('empieza con sesionSinRol en false', () => {
    renderConsumidor();

    expect(screen.getByText('sesionSinRol: false')).toBeInTheDocument();
  });

  it('marcarSesionSinRol() pasa sesionSinRol de false a true', async () => {
    const usuario = userEvent.setup();
    renderConsumidor();

    await usuario.click(screen.getByRole('button', { name: 'Marcar' }));

    expect(screen.getByText('sesionSinRol: true')).toBeInTheDocument();
  });

  it('limpiarSesionSinRol() vuelve sesionSinRol a false tras marcarSesionSinRol()', async () => {
    const usuario = userEvent.setup();
    renderConsumidor();

    await usuario.click(screen.getByRole('button', { name: 'Marcar' }));
    expect(screen.getByText('sesionSinRol: true')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(screen.getByText('sesionSinRol: false')).toBeInTheDocument();
  });
});
