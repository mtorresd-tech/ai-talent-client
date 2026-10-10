import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { conTema, renderConTema } from '../../../test/renderConTema';
import {
  decisionMatriz,
  filaIncompleta,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import type { FilaMatriz, MatrizSeleccion } from '../api/matriz';
import { guardarBorrador } from '../logica/borradorJustificacionMatriz';
import { BarraCandidatoMatriz, type BarraCandidatoMatrizProps } from './BarraCandidatoMatriz';

const ana = filaMatriz({
  jobApplicationId: 'APP-1',
  nombre: 'Ana Pérez',
  resultado: { total: 85 },
});
const luis = filaMatriz({
  jobApplicationId: 'APP-2',
  nombre: 'Luis Gómez',
  resultado: { total: 80.5 },
});
const ivan = filaIncompleta({ jobApplicationId: 'APP-3', nombre: 'Iván Ríos' });

const FORMULARIO = <p>Formulario de justificación</p>;

function renderBarra(
  matriz: MatrizSeleccion,
  fila: FilaMatriz,
  overrides: Partial<BarraCandidatoMatrizProps> = {},
) {
  const props: BarraCandidatoMatrizProps = {
    matriz,
    fila,
    abierto: false,
    onAbrir: vi.fn(),
    onCerrar: vi.fn(),
    formulario: FORMULARIO,
    ...overrides,
  };
  const resultado = renderConTema(<BarraCandidatoMatriz {...props} />);
  return { props, ...resultado };
}

beforeEach(() => sessionStorage.clear());

describe('BarraCandidatoMatriz', () => {
  it('muestra nombre, tipo, total y estado del candidato activo', () => {
    renderBarra(matrizSeleccion({ candidatos: [ana, luis] }), luis);

    expect(screen.getByRole('heading', { level: 3, name: 'Luis Gómez' })).toBeInTheDocument();
    expect(screen.getByText('Externo')).toBeInTheDocument();
    expect(screen.getByText('Total: 80,5')).toBeInTheDocument();
    expect(screen.getByText('Lista para justificar')).toBeInTheDocument();
  });

  it('en vista ciega muestra el alias y el tipo Interno', () => {
    const ciego = filaMatriz({
      jobApplicationId: 'APP-7',
      nombre: null,
      alias: 'Candidato 7',
      tipoCandidato: 'INTERNO',
    });
    renderBarra(matrizSeleccion({ candidatos: [ciego] }), ciego);

    expect(screen.getByRole('heading', { level: 3, name: 'Candidato 7' })).toBeInTheDocument();
    expect(screen.getByText('Interno')).toBeInTheDocument();
  });

  it('con un elegible ofrece "Seleccionar este candidato" y no renderiza el formulario hasta abrir', async () => {
    const { props } = renderBarra(matrizSeleccion({ candidatos: [ana, luis] }), luis);

    expect(screen.queryByText('Formulario de justificación')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    expect(props.onAbrir).toHaveBeenCalledTimes(1);
  });

  it('abierta muestra el formulario y oculta el botón de selección', () => {
    renderBarra(matrizSeleccion({ candidatos: [ana, luis] }), luis, { abierto: true });

    expect(screen.getByText('Formulario de justificación')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Seleccionar este candidato' }),
    ).not.toBeInTheDocument();
  });

  it('con borrador guardado ofrece "Continuar justificación"', () => {
    guardarBorrador('REQ-1', 'APP-2', {
      fortalezas: 'Algo',
      oportunidadesDesarrollo: '',
      criterioDesempate: '',
      equivalenciasAplicadas: '',
      observaciones: '',
    });
    renderBarra(matrizSeleccion({ candidatos: [ana, luis] }), luis);

    expect(screen.getByRole('button', { name: 'Continuar justificación' })).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('con un candidato incompleto muestra el motivo, sin botón', () => {
    renderBarra(matrizSeleccion({ candidatos: [ana, ivan] }), ivan, { abierto: true });

    expect(screen.getByText('Total: Pendiente')).toBeInTheDocument();
    expect(screen.getAllByText('Calificación incompleta')).toHaveLength(2);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Formulario de justificación')).not.toBeInTheDocument();
  });

  it('con un objetado histórico muestra el motivo y permite seleccionarlo', async () => {
    const { props } = renderBarra(
      matrizSeleccion({
        candidatos: [ana, luis],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
        decisionLider: decisionMatriz({ motivo: 'Otro motivo' }),
        objeciones: [objecionMatriz({ jobApplicationId: 'APP-1', motivo: 'Poca experiencia' })],
      }),
      ana,
    );

    expect(screen.getByText('Objetado por el líder: Poca experiencia')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver justificación enviada' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    expect(props.onAbrir).toHaveBeenCalledTimes(1);
  });

  it('con un objetado histórico abierto muestra el formulario', () => {
    renderBarra(
      matrizSeleccion({
        candidatos: [ana, luis],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
        decisionLider: decisionMatriz({ motivo: 'Otro motivo' }),
        objeciones: [objecionMatriz({ jobApplicationId: 'APP-1', motivo: 'Poca experiencia' })],
      }),
      ana,
      { abierto: true },
    );

    expect(screen.getByText('Formulario de justificación')).toBeInTheDocument();
  });

  describe('con el objetado vigente', () => {
    const objetadaAna = matrizSeleccion({
      candidatos: [ana, luis],
      seleccion: seleccionMatriz({ jobApplicationId: 'APP-1', fortalezas: 'Fortalezas de Ana' }),
      decisionLider: decisionMatriz({ motivo: 'No alcanza el concepto' }),
    });

    /** Barra con el despliegue controlado como en el panel. */
    function BarraControlada() {
      const [abierto, setAbierto] = useState(false);
      return (
        <BarraCandidatoMatriz
          matriz={objetadaAna}
          fila={ana}
          abierto={abierto}
          onAbrir={() => setAbierto(true)}
          onCerrar={() => setAbierto(false)}
          formulario={FORMULARIO}
        />
      );
    }

    it('muestra el motivo, "Volver a enviar este candidato" y "Ver justificación enviada"', () => {
      renderBarra(objetadaAna, ana);

      expect(screen.getByText('Objetado por el líder: No alcanza el concepto')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Volver a enviar este candidato' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ver justificación enviada' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Seleccionar este candidato' }),
      ).not.toBeInTheDocument();
    });

    it('con borrador ofrece "Continuar justificación" en lugar de volver a enviar', () => {
      guardarBorrador('REQ-1', 'APP-1', {
        fortalezas: 'Ajuste tras la reunión',
        oportunidadesDesarrollo: '',
        criterioDesempate: '',
        equivalenciasAplicadas: '',
        observaciones: '',
      });
      renderBarra(objetadaAna, ana);

      expect(screen.getByRole('button', { name: 'Continuar justificación' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Volver a enviar este candidato' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ver justificación enviada' })).toBeInTheDocument();
    });

    it('"Volver a enviar" despliega el formulario y "Ver justificación enviada" cambia a la enviada', async () => {
      const usuario = userEvent.setup();
      renderConTema(<BarraControlada />);

      await usuario.click(screen.getByRole('button', { name: 'Volver a enviar este candidato' }));
      expect(screen.getByText('Formulario de justificación')).toBeInTheDocument();
      expect(screen.queryByText('Fortalezas de Ana')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Volver a enviar este candidato' }),
      ).not.toBeInTheDocument();

      await usuario.click(screen.getByRole('button', { name: 'Ver justificación enviada' }));
      expect(screen.getByText('Fortalezas de Ana')).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByText('Formulario de justificación')).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole('button', { name: 'Volver a enviar este candidato' }),
      ).toBeInTheDocument();

      await usuario.click(screen.getByRole('button', { name: 'Ocultar justificación enviada' }));
      await waitFor(() => expect(screen.queryByText('Fortalezas de Ana')).not.toBeInTheDocument());
    });
  });

  it.each([
    ['ENVIADA_PENDIENTE', null],
    ['AVALADA', decisionMatriz({ avala: true, motivo: null })],
  ])(
    'en %s el seleccionado ofrece "Ver justificación enviada" y la despliega sin formulario',
    (_, decision) => {
      const matriz = matrizSeleccion({
        candidatos: [ana, luis],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-1', fortalezas: 'Fortalezas de Ana' }),
        decisionLider: decision,
      });
      const { rerender, props } = renderBarra(matriz, ana);

      const boton = screen.getByRole('button', { name: 'Ver justificación enviada' });
      expect(boton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Fortalezas de Ana')).not.toBeInTheDocument();

      rerender(conTema(<BarraCandidatoMatriz {...props} abierto />));
      expect(screen.getByText('Fortalezas de Ana')).toBeInTheDocument();
      expect(screen.queryByText('Formulario de justificación')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ocultar justificación enviada' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    },
  );

  it.each([
    [
      'ENVIADA_PENDIENTE',
      null,
      'La matriz ya se envió al líder; no se puede cambiar la elección mientras el líder no responda.',
    ],
    [
      'AVALADA',
      decisionMatriz({ avala: true, motivo: null }),
      'El líder avaló la matriz; la elección quedó en firme.',
    ],
  ])('en %s un candidato no seleccionado muestra el motivo, sin botón', (_, decision, motivo) => {
    renderBarra(
      matrizSeleccion({
        candidatos: [ana, luis],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-1' }),
        decisionLider: decision,
      }),
      luis,
      { abierto: true },
    );

    expect(screen.getByText(motivo)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Formulario de justificación')).not.toBeInTheDocument();
  });
});
