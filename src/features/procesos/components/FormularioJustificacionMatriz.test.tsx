import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filaMatriz, seleccionMatriz } from '../../../test/fixturesMatriz';
import { guardarBorrador, leerBorrador } from '../logica/borradorJustificacionMatriz';
import { FormularioJustificacionMatriz } from './FormularioJustificacionMatriz';

const elegido = filaMatriz({ jobApplicationId: 'APP-1', resultado: { total: 82 } });
const otro = filaMatriz({
  jobApplicationId: 'APP-2',
  nombre: 'Luis Gómez',
  resultado: { total: 75 },
});
const empatado = filaMatriz({ jobApplicationId: 'APP-3', resultado: { total: 82 } });

function props(overrides: Partial<Parameters<typeof FormularioJustificacionMatriz>[0]> = {}) {
  return {
    jobRequisitionId: 'REQ-1',
    fila: elegido,
    posicion: 1,
    candidatos: [elegido, otro],
    reemplazaObjetado: false,
    confirmacionAbierta: false,
    enviando: false,
    errorEnvio: null,
    errorDesempate: null,
    onSolicitarEnvio: vi.fn(),
    onCancelarEnvio: vi.fn(),
    onConfirmarEnvio: vi.fn(),
    onCambioBorrador: vi.fn(),
    ...overrides,
  };
}

const campo = (nombre: RegExp) => screen.getByRole('textbox', { name: nombre });

beforeEach(() => sessionStorage.clear());

describe('FormularioJustificacionMatriz', () => {
  it('sin empate: fortalezas vacío bloquea el envío y el criterio de desempate es opcional', async () => {
    const onSolicitarEnvio = vi.fn();
    render(<FormularioJustificacionMatriz {...props({ onSolicitarEnvio })} />);
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole('button', { name: 'Enviar al líder' }));
    expect(await screen.findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(onSolicitarEnvio).not.toHaveBeenCalled();

    await usuario.type(campo(/^Fortalezas/), '  Liderazgo  ');
    await usuario.type(campo(/^Observaciones/), '   ');
    await usuario.click(screen.getByRole('button', { name: 'Enviar al líder' }));

    await waitFor(() =>
      expect(onSolicitarEnvio).toHaveBeenCalledWith({
        jobApplicationId: 'APP-1',
        fortalezas: 'Liderazgo',
        oportunidadesDesarrollo: null,
        criterioDesempate: null,
        equivalenciasAplicadas: null,
        observaciones: null,
      }),
    );
  });

  it('con empate de total el criterio de desempate es obligatorio', async () => {
    const onSolicitarEnvio = vi.fn();
    render(
      <FormularioJustificacionMatriz
        {...props({ candidatos: [elegido, empatado], onSolicitarEnvio })}
      />,
    );
    const usuario = userEvent.setup();

    await usuario.type(campo(/^Fortalezas/), 'Liderazgo');
    await usuario.click(screen.getByRole('button', { name: 'Enviar al líder' }));

    expect(await screen.findByText(/describe el criterio de desempate/)).toBeInTheDocument();
    expect(onSolicitarEnvio).not.toHaveBeenCalled();

    await usuario.type(campo(/^Criterio de desempate/), 'Mejor concepto del área');
    await usuario.click(screen.getByRole('button', { name: 'Enviar al líder' }));
    await waitFor(() =>
      expect(onSolicitarEnvio).toHaveBeenCalledWith(
        expect.objectContaining({ criterioDesempate: 'Mejor concepto del área' }),
      ),
    );
  });

  it('limita cada campo a 2000/2000/1000/1000/2000 caracteres con contador visible', () => {
    render(<FormularioJustificacionMatriz {...props()} />);

    expect(campo(/^Fortalezas/)).toHaveAttribute('maxLength', '2000');
    expect(campo(/^Oportunidades de desarrollo/)).toHaveAttribute('maxLength', '2000');
    expect(campo(/^Criterio de desempate/)).toHaveAttribute('maxLength', '1000');
    expect(campo(/^Equivalencias aplicadas/)).toHaveAttribute('maxLength', '1000');
    expect(campo(/^Observaciones/)).toHaveAttribute('maxLength', '2000');
    expect(screen.getAllByText('0 / 2000')).toHaveLength(3);
    expect(screen.getAllByText('0 / 1000')).toHaveLength(2);
  });

  it('precarga el borrador y "Descartar borrador" lo elimina y vacía el formulario', async () => {
    guardarBorrador('REQ-1', 'APP-1', {
      fortalezas: 'Texto guardado',
      oportunidadesDesarrollo: '',
      criterioDesempate: '',
      equivalenciasAplicadas: '',
      observaciones: 'Nota',
    });
    render(<FormularioJustificacionMatriz {...props()} />);

    expect(campo(/^Fortalezas/)).toHaveValue('Texto guardado');
    expect(campo(/^Observaciones/)).toHaveValue('Nota');

    await userEvent.click(screen.getByRole('button', { name: 'Descartar borrador' }));

    expect(campo(/^Fortalezas/)).toHaveValue('');
    expect(campo(/^Observaciones/)).toHaveValue('');
    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Descartar borrador' })).not.toBeInTheDocument();
  });

  it('al escribir guarda el borrador tras la espera y avisa del cambio', async () => {
    const onCambioBorrador = vi.fn();
    render(<FormularioJustificacionMatriz {...props({ onCambioBorrador })} />);

    await userEvent.type(campo(/^Fortalezas/), 'Liderazgo');

    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    await waitFor(() => expect(leerBorrador('REQ-1', 'APP-1')?.fortalezas).toBe('Liderazgo'));
    expect(onCambioBorrador).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Descartar borrador' })).toBeInTheDocument();
  });

  it('al desmontar guarda lo escrito aunque no haya terminado la espera', async () => {
    const { unmount } = render(<FormularioJustificacionMatriz {...props()} />);
    await userEvent.type(campo(/^Fortalezas/), 'Rápido');
    unmount();
    expect(leerBorrador('REQ-1', 'APP-1')?.fortalezas).toBe('Rápido');
  });

  it('"Cancelar" solo aparece con onCancelar y no descarta el borrador', async () => {
    const { unmount } = render(<FormularioJustificacionMatriz {...props()} />);
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    unmount();

    const onCancelar = vi.fn();
    render(<FormularioJustificacionMatriz {...props({ onCancelar })} />);
    await userEvent.type(campo(/^Fortalezas/), 'Liderazgo');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(campo(/^Fortalezas/)).toHaveValue('Liderazgo');
  });

  it('asocia al campo el error de desempate del backend', async () => {
    render(<FormularioJustificacionMatriz {...props({ errorDesempate: 'Falta el criterio' })} />);
    expect(await screen.findByText('Falta el criterio')).toBeInTheDocument();
  });

  it('con la confirmación abierta muestra el modal y confirma el envío', async () => {
    const onConfirmarEnvio = vi.fn();
    render(
      <FormularioJustificacionMatriz
        {...props({ confirmacionAbierta: true, posicion: 3, onConfirmarEnvio })}
      />,
    );

    expect(screen.getByText('Candidato #3 — Ana Pérez')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar envío' }));
    expect(onConfirmarEnvio).toHaveBeenCalled();
  });

  describe('con la justificación enviada del objetado vigente', () => {
    const justificacionEnviada = seleccionMatriz({
      jobApplicationId: 'APP-1',
      fortalezas: 'Fortalezas enviadas',
      oportunidadesDesarrollo: 'Inglés',
      criterioDesempate: 'Mejor concepto',
      equivalenciasAplicadas: null,
      observaciones: 'Ninguna',
    });

    it('sin borrador precarga los campos con la justificación enviada, editables', async () => {
      render(<FormularioJustificacionMatriz {...props({ justificacionEnviada })} />);

      expect(campo(/^Fortalezas/)).toHaveValue('Fortalezas enviadas');
      expect(campo(/^Oportunidades de desarrollo/)).toHaveValue('Inglés');
      expect(campo(/^Criterio de desempate/)).toHaveValue('Mejor concepto');
      expect(campo(/^Equivalencias aplicadas/)).toHaveValue('');
      expect(campo(/^Observaciones/)).toHaveValue('Ninguna');
      expect(screen.getByText(/traen la justificación que enviaste/)).toBeInTheDocument();

      await userEvent.type(campo(/^Observaciones/), ' adicional');
      expect(campo(/^Observaciones/)).toHaveValue('Ninguna adicional');
    });

    it('la precarga sin cambios no se guarda como borrador', async () => {
      const { unmount } = render(
        <FormularioJustificacionMatriz {...props({ justificacionEnviada })} />,
      );

      await new Promise((resolver) => setTimeout(resolver, 600));
      expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Descartar borrador' })).not.toBeInTheDocument();
      unmount();
      expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    });

    it('un cambio sobre la precarga se guarda como borrador y al descartarlo vuelve a la enviada', async () => {
      render(<FormularioJustificacionMatriz {...props({ justificacionEnviada })} />);

      await userEvent.type(campo(/^Fortalezas/), ' y liderazgo');
      await waitFor(() =>
        expect(leerBorrador('REQ-1', 'APP-1')?.fortalezas).toBe('Fortalezas enviadas y liderazgo'),
      );

      await userEvent.click(screen.getByRole('button', { name: 'Descartar borrador' }));
      expect(campo(/^Fortalezas/)).toHaveValue('Fortalezas enviadas');
      expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    });

    it('si hay borrador, el borrador gana sobre la justificación enviada', () => {
      guardarBorrador('REQ-1', 'APP-1', {
        fortalezas: 'Texto del borrador',
        oportunidadesDesarrollo: '',
        criterioDesempate: '',
        equivalenciasAplicadas: '',
        observaciones: '',
      });
      render(<FormularioJustificacionMatriz {...props({ justificacionEnviada })} />);

      expect(campo(/^Fortalezas/)).toHaveValue('Texto del borrador');
      expect(campo(/^Oportunidades de desarrollo/)).toHaveValue('');
      expect(campo(/^Observaciones/)).toHaveValue('');
    });
  });
});
