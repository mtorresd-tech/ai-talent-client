import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { conTema, renderConTema } from '../../../test/renderConTema';
import { errorApi } from '../../../test/clienteApiFalso';
import {
  decisionMatriz,
  filaIncompleta,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import type { MatrizSeleccion } from '../api/matriz';
import { guardarBorrador, leerBorrador } from '../logica/borradorJustificacionMatriz';
import { PanelMatrizSeleccion, type PanelMatrizSeleccionProps } from './PanelMatrizSeleccion';

const objetado = filaMatriz({ jobApplicationId: 'APP-1', nombre: 'Ana Pérez' });
const elegible = filaMatriz({
  jobApplicationId: 'APP-2',
  nombre: 'Luis Gómez',
  resultado: { total: 80 },
});
const incompleto = filaIncompleta({ jobApplicationId: 'APP-3', nombre: 'Iván Ríos' });

const objetada = matrizSeleccion({
  candidatos: [objetado, elegible, incompleto],
  seleccion: seleccionMatriz({ jobApplicationId: 'APP-1', fortalezas: 'Fortalezas enviadas' }),
  decisionLider: decisionMatriz({ motivo: 'No alcanza el concepto' }),
});

const abierta = () => matrizSeleccion({ candidatos: [elegible, incompleto] });

function renderPanel(
  matriz: MatrizSeleccion | null,
  overrides: Partial<PanelMatrizSeleccionProps> = {},
) {
  const props: PanelMatrizSeleccionProps = {
    matriz,
    cargando: false,
    error: null,
    onReintentar: vi.fn(),
    candidatoActivoId: null,
    onSeleccionarCandidato: vi.fn(),
    solicitudEnvio: null,
    enviandoSeleccion: false,
    errorSeleccion: null,
    envioExitoso: false,
    onSolicitarEnvio: vi.fn(),
    onCancelarEnvio: vi.fn(),
    onConfirmarEnvio: vi.fn(),
    ...overrides,
  };
  const resultado = renderConTema(<PanelMatrizSeleccion {...props} />);
  return { props, ...resultado };
}

beforeEach(() => sessionStorage.clear());

describe('PanelMatrizSeleccion', () => {
  it('muestra el estado de error con reintento', async () => {
    const onReintentar = vi.fn();
    renderPanel(null, { error: errorApi(500, 'Error inesperado'), onReintentar });
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(onReintentar).toHaveBeenCalled();
  });

  it('apila el aviso del envío, la tabla y la barra del candidato activo, sin lista aparte', () => {
    renderPanel(objetada, { candidatoActivoId: 'APP-2' });

    const aviso = screen.getByRole('alert');
    const tablas = screen.getAllByRole('table');
    const barra = screen.getByRole('heading', { level: 3, name: 'Luis Gómez' });
    const sigue = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(tablas).toHaveLength(1);
    expect(tablas[0]).toHaveAccessibleName('Matriz de selección');
    expect(aviso).toHaveTextContent('Ana Pérez fue el candidato seleccionado');
    expect(within(tablas[0]).getByRole('rowheader', { name: 'Luis Gómez' })).toBeInTheDocument();
    expect(sigue(aviso, tablas[0])).toBe(true);
    expect(sigue(tablas[0], barra)).toBe(true);
  });

  it('agrupa la información de arriba de la matriz en un recuadro', () => {
    renderPanel(objetada, { candidatoActivoId: 'APP-2' });

    const recuadro = screen.getByRole('region', { name: 'Envío al líder' });
    expect(within(recuadro).getByRole('alert')).toHaveTextContent('Ana Pérez fue el candidato');
    expect(
      within(recuadro).getByText(/No hay candidatos con la calificación|Puntaje final/),
    ).toBeInTheDocument();
    expect(within(recuadro).queryByRole('table')).not.toBeInTheDocument();
  });

  it('sin envío ni errores no hay recuadro superior', () => {
    renderPanel(abierta());

    expect(screen.queryByRole('region', { name: 'Envío al líder' })).not.toBeInTheDocument();
  });

  it('sin candidato activo no hay barra, solo el texto de ayuda', () => {
    renderPanel(abierta());

    expect(screen.getByText('Elige un candidato de la matriz.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /candidato|justificación/ }),
    ).not.toBeInTheDocument();
  });

  it('sin candidatos muestra un único estado vacío, sin tabla ni ayuda', () => {
    renderPanel(matrizSeleccion());

    expect(screen.getAllByText('Todavía no hay puntajes para esta vacante')).toHaveLength(1);
    expect(screen.queryByRole('table', { name: 'Matriz de selección' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Elige un candidato/)).not.toBeInTheDocument();
  });

  it('no renderiza ningún formulario ni botón de configuración', () => {
    renderPanel(abierta());

    expect(screen.getByText('Configuración de la matriz')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /configuración/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('el formulario no se renderiza hasta pulsar "Seleccionar este candidato"', async () => {
    renderPanel(abierta(), { candidatoActivoId: 'APP-2' });

    expect(screen.getByRole('heading', { level: 3, name: 'Luis Gómez' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enviar al líder' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));

    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Enviar al líder' })).toBeInTheDocument();
  });

  it('"Cancelar" pliega el formulario, conserva el borrador y ofrece "Continuar justificación"', async () => {
    const usuario = userEvent.setup();
    renderPanel(abierta(), { candidatoActivoId: 'APP-2' });

    await usuario.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    await usuario.type(screen.getByRole('textbox', { name: /^Fortalezas/ }), 'Liderazgo');
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(leerBorrador('REQ-1', 'APP-2')?.fortalezas).toBe('Liderazgo');

    await usuario.click(screen.getByRole('button', { name: 'Continuar justificación' }));
    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toHaveValue('Liderazgo');
  });

  it('cambiar de candidato pliega el formulario', async () => {
    const usuario = userEvent.setup();
    const matriz = matrizSeleccion({
      candidatos: [elegible, filaMatriz({ jobApplicationId: 'APP-5', nombre: 'Sara León' })],
    });
    const { props, rerender } = renderPanel(matriz, { candidatoActivoId: 'APP-2' });

    await usuario.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toBeInTheDocument();

    rerender(conTema(<PanelMatrizSeleccion {...props} candidatoActivoId="APP-5" />));
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 3, name: 'Sara León' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seleccionar este candidato' })).toBeInTheDocument();

    // Al volver al primero, sigue plegado.
    rerender(conTema(<PanelMatrizSeleccion {...props} candidatoActivoId="APP-2" />));
    expect(screen.getByRole('heading', { level: 3, name: 'Luis Gómez' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('tras un envío exitoso pliega el formulario y muestra la confirmación', async () => {
    const usuario = userEvent.setup();
    const { props, rerender } = renderPanel(abierta(), { candidatoActivoId: 'APP-2' });
    await usuario.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toBeInTheDocument();

    rerender(
      conTema(
        <PanelMatrizSeleccion
          {...props}
          matriz={matrizSeleccion({
            candidatos: [elegible, incompleto],
            seleccion: seleccionMatriz({ jobApplicationId: 'APP-2', fortalezas: 'Lo enviado' }),
          })}
          envioExitoso
        />,
      ),
    );

    expect(screen.getByText('Matriz enviada al líder.')).toBeInTheDocument();
    expect(screen.getByText(/Pendiente de respuesta del líder/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(screen.queryByText('Lo enviado')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver justificación enviada' })).toBeInTheDocument();
  });

  it('con un candidato incompleto muestra el motivo, sin botón ni formulario', () => {
    renderPanel(abierta(), { candidatoActivoId: 'APP-3' });

    // Chip y motivo de la barra.
    expect(screen.getAllByText('Calificación incompleta')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: 'Seleccionar este candidato' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('en OBJETADA eligiendo al objetado muestra el motivo y su justificación solo bajo demanda', async () => {
    renderPanel(objetada, { candidatoActivoId: 'APP-1' });

    expect(screen.getByText('Objetado por el líder: No alcanza el concepto')).toBeInTheDocument();
    expect(screen.queryByText('Fortalezas enviadas')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ver justificación enviada' }));

    expect(screen.getByText('Fortalezas enviadas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enviar al líder' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('en OBJETADA "Volver a enviar este candidato" precarga la justificación enviada, editable', async () => {
    const usuario = userEvent.setup();
    const onSolicitarEnvio = vi.fn();
    renderPanel(
      matrizSeleccion({
        ...objetada,
        seleccion: seleccionMatriz({
          jobApplicationId: 'APP-1',
          fortalezas: 'Fortalezas enviadas',
          oportunidadesDesarrollo: 'Inglés',
          criterioDesempate: null,
          equivalenciasAplicadas: 'Maestría por experiencia',
          observaciones: 'Ninguna',
        }),
      }),
      { candidatoActivoId: 'APP-1', onSolicitarEnvio },
    );

    await usuario.click(screen.getByRole('button', { name: 'Volver a enviar este candidato' }));

    const fortalezas = screen.getByRole('textbox', { name: /^Fortalezas/ });
    expect(fortalezas).toHaveValue('Fortalezas enviadas');
    expect(fortalezas).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /^Oportunidades de desarrollo/ })).toHaveValue(
      'Inglés',
    );
    expect(screen.getByRole('textbox', { name: /^Criterio de desempate/ })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /^Equivalencias aplicadas/ })).toHaveValue(
      'Maestría por experiencia',
    );
    expect(screen.getByRole('textbox', { name: /^Observaciones/ })).toHaveValue('Ninguna');

    await usuario.type(fortalezas, ' y liderazgo');
    await usuario.click(screen.getByRole('button', { name: 'Enviar al líder' }));
    await waitFor(() =>
      expect(onSolicitarEnvio).toHaveBeenCalledWith(
        expect.objectContaining({
          jobApplicationId: 'APP-1',
          fortalezas: 'Fortalezas enviadas y liderazgo',
          equivalenciasAplicadas: 'Maestría por experiencia',
        }),
      ),
    );
  });

  it('en OBJETADA el borrador del objetado vigente gana sobre la justificación enviada', async () => {
    guardarBorrador('REQ-1', 'APP-1', {
      fortalezas: 'Fortalezas del borrador',
      oportunidadesDesarrollo: '',
      criterioDesempate: '',
      equivalenciasAplicadas: '',
      observaciones: '',
    });
    renderPanel(objetada, { candidatoActivoId: 'APP-1' });

    await userEvent.click(screen.getByRole('button', { name: 'Continuar justificación' }));

    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toHaveValue(
      'Fortalezas del borrador',
    );
  });

  it('en OBJETADA un objetado histórico muestra el motivo y arranca con el formulario vacío', async () => {
    renderPanel(
      matrizSeleccion({
        ...objetada,
        candidatos: [
          objetado,
          elegible,
          filaMatriz({ jobApplicationId: 'APP-4', nombre: 'Sara León' }),
        ],
        objeciones: [objecionMatriz({ jobApplicationId: 'APP-4', motivo: 'Poca experiencia' })],
      }),
      { candidatoActivoId: 'APP-4' },
    );

    expect(screen.getByText('Objetado por el líder: Poca experiencia')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));
    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toHaveValue('');
  });

  it('en OBJETADA eligiendo a otro elegible permite seleccionarlo y justificarlo', async () => {
    renderPanel(objetada, { candidatoActivoId: 'APP-2' });

    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar este candidato' }));

    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /^Fortalezas/ })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Enviar al líder' })).toBeInTheDocument();
  });

  it('en OBJETADA no hay aviso de falta de candidatos si el único completo es el objetado', () => {
    renderPanel(matrizSeleccion({ ...objetada, candidatos: [objetado, incompleto] }), {
      candidatoActivoId: 'APP-1',
    });

    expect(screen.queryByText(/No hay candidatos con la calificación/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Volver a enviar este candidato' }),
    ).toBeInTheDocument();
  });

  it('en OBJETADA no hay aviso de falta de candidatos si solo quedan objetados completos', () => {
    renderPanel(
      matrizSeleccion({
        ...objetada,
        candidatos: [objetado, filaMatriz({ jobApplicationId: 'APP-4' }), incompleto],
        objeciones: [objecionMatriz({ jobApplicationId: 'APP-4' })],
      }),
      { candidatoActivoId: 'APP-3' },
    );

    expect(screen.queryByText(/No hay candidatos con la calificación/)).not.toBeInTheDocument();
  });

  it('en OBJETADA sin ningún candidato completo muestra el aviso, sin botón de selección', () => {
    renderPanel(
      matrizSeleccion({
        ...objetada,
        candidatos: [
          filaIncompleta({ jobApplicationId: 'APP-1', nombre: 'Ana Pérez' }),
          incompleto,
        ],
      }),
      { candidatoActivoId: 'APP-3' },
    );

    expect(
      screen.getByText('No hay candidatos con la calificación completa para elegir.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Seleccionar este candidato' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['ENVIADA_PENDIENTE', null],
    ['AVALADA', decisionMatriz({ avala: true, motivo: null })],
  ])('en %s eligiendo a un no seleccionado no hay formulario ni envío', (_, decision) => {
    renderPanel(
      matrizSeleccion({
        candidatos: [objetado, elegible],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-1' }),
        decisionLider: decision,
      }),
      { candidatoActivoId: 'APP-2' },
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Luis Gómez' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Seleccionar|Continuar/ })).not.toBeInTheDocument();
  });

  it.each([
    ['ENVIADA_PENDIENTE', null],
    ['AVALADA', decisionMatriz({ avala: true, motivo: null })],
  ])('en %s el seleccionado ofrece "Ver justificación enviada"', async (_, decision) => {
    renderPanel(
      matrizSeleccion({
        candidatos: [objetado, elegible],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-1', fortalezas: 'Lo enviado' }),
        decisionLider: decision,
      }),
      { candidatoActivoId: 'APP-1' },
    );

    expect(screen.queryByText('Lo enviado')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver justificación enviada' }));
    expect(screen.getByText('Lo enviado')).toBeInTheDocument();
  });

  it('un 409 de envío se muestra en el panel con el mensaje claro', () => {
    renderPanel(objetada, {
      candidatoActivoId: 'APP-2',
      errorSeleccion: errorApi(409, 'Calificacion incompleta'),
    });
    expect(
      screen.getByText(/Este candidato ya no tiene la calificación completa en la matriz./),
    ).toBeInTheDocument();
  });

  it('un clic o Enter/Espacio en una fila de la tabla selecciona al candidato', async () => {
    const onSeleccionarCandidato = vi.fn();
    renderPanel(abierta(), { onSeleccionarCandidato });

    await userEvent.click(screen.getByRole('rowheader', { name: 'Iván Ríos' }));
    expect(onSeleccionarCandidato).toHaveBeenLastCalledWith('APP-3');

    (screen.getByRole('rowheader', { name: 'Luis Gómez' }).closest('tr') as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(onSeleccionarCandidato).toHaveBeenLastCalledWith('APP-2');
  });
});
