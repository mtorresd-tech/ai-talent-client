import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderConTema } from '../../../test/renderConTema';
import {
  decisionMatriz,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import { formatearFechaHora } from '../logica/formatoFecha';
import { JustificacionEnviadaMatriz, ResumenSeleccionMatriz } from './ResumenSeleccionMatriz';

const candidatos = [
  filaMatriz({ jobApplicationId: 'APP-1', nombre: 'Ana Pérez' }),
  filaMatriz({ jobApplicationId: 'APP-2', nombre: null, alias: 'Candidato 7' }),
  filaMatriz({ jobApplicationId: 'APP-3', nombre: 'Luis Gómez' }),
];
const antesDelPlazo = new Date('2026-11-11T00:00:00Z');

describe('ResumenSeleccionMatriz', () => {
  it('sin envío no muestra nada', () => {
    const { container } = renderConTema(
      <ResumenSeleccionMatriz matriz={matrizSeleccion({ candidatos })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('en ENVIADA_PENDIENTE avisa quién fue enviado y cuándo, con el plazo (info)', () => {
    renderConTema(
      <ResumenSeleccionMatriz
        matriz={matrizSeleccion({
          candidatos,
          seleccion: seleccionMatriz({ jobApplicationId: 'APP-2', puntajeFinal: 82.4 }),
          plazoDecisionHasta: '2026-11-12T15:00:00Z',
        })}
        ahora={antesDelPlazo}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveClass('MuiAlert-colorInfo');
    // El formateador usa espacios especiales; `toHaveTextContent` solo normaliza el elemento.
    const normalizar = (texto: string) => texto.replace(/\s+/g, ' ');
    const enviadaEl = normalizar(formatearFechaHora('2026-11-10T15:00:00Z'));
    expect(aviso).toHaveTextContent(
      `Candidato 7 fue el candidato seleccionado y enviado al líder el ${enviadaEl}`,
    );
    expect(aviso).not.toHaveTextContent('..');
    expect(aviso).toHaveTextContent(
      normalizar(
        `Pendiente de respuesta del líder (plazo hasta ${formatearFechaHora('2026-11-12T15:00:00Z')}).`,
      ),
    );
    expect(within(aviso).getByText('Candidato 7').tagName).toBe('STRONG');
    expect(screen.getByText('82,4')).toBeInTheDocument();
    expect(screen.getByText('reclutador@geb.com.co')).toBeInTheDocument();
    expect(screen.queryByText('Plazo vencido')).not.toBeInTheDocument();
    // No se duplica el candidato ni el plazo fuera del aviso.
    expect(screen.queryByText('Candidato seleccionado')).not.toBeInTheDocument();
    expect(screen.queryByText('Plazo del líder')).not.toBeInTheDocument();
  });

  it('con el plazo vencido sin decisión muestra "Plazo vencido"', () => {
    renderConTema(
      <ResumenSeleccionMatriz
        matriz={matrizSeleccion({
          candidatos,
          seleccion: seleccionMatriz(),
          plazoDecisionHasta: '2026-11-12T15:00:00Z',
        })}
        ahora={new Date('2026-11-13T00:00:00Z')}
      />,
    );
    expect(within(screen.getByRole('alert')).getByText('Plazo vencido')).toBeInTheDocument();
  });

  it('en AVALADA el aviso es de éxito y muestra quién avaló', () => {
    renderConTema(
      <ResumenSeleccionMatriz
        matriz={matrizSeleccion({
          candidatos,
          seleccion: seleccionMatriz(),
          decisionLider: decisionMatriz({ avala: true, motivo: null }),
          plazoDecisionHasta: '2026-11-12T15:00:00Z',
        })}
        ahora={new Date('2027-01-01T00:00:00Z')}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveClass('MuiAlert-colorSuccess');
    expect(aviso).toHaveTextContent('Ana Pérez fue el candidato seleccionado');
    expect(aviso).toHaveTextContent('Avalado por el líder.');
    expect(screen.getByText('Avalada por')).toBeInTheDocument();
    expect(screen.getByText('lider@geb.com.co')).toBeInTheDocument();
    expect(screen.queryByText('Plazo vencido')).not.toBeInTheDocument();
  });

  it('en OBJETADA el aviso es de advertencia, con el motivo y la opción de volver a enviar o elegir otro', () => {
    renderConTema(
      <ResumenSeleccionMatriz
        matriz={matrizSeleccion({
          candidatos,
          seleccion: seleccionMatriz(),
          decisionLider: decisionMatriz({ motivo: 'No alcanza el concepto.' }),
        })}
        ahora={antesDelPlazo}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveClass('MuiAlert-colorWarning');
    expect(aviso).toHaveTextContent('Ana Pérez fue el candidato seleccionado');
    expect(aviso).toHaveTextContent(
      'Objetado por el líder: No alcanza el concepto. Puedes volver a enviar este candidato o elegir otro.',
    );
    expect(screen.getByText('Objetada por')).toBeInTheDocument();
  });

  it('con objeciones muestra el historial plegable del más viejo al más nuevo', async () => {
    renderConTema(
      <ResumenSeleccionMatriz
        matriz={matrizSeleccion({
          candidatos,
          seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
          objeciones: [
            objecionMatriz({ jobApplicationId: 'APP-1', motivo: 'Primera objeción' }),
            objecionMatriz({
              jobApplicationId: 'APP-3',
              motivo: 'Segunda objeción',
              decididaEn: '2026-11-08T09:00:00Z',
            }),
          ],
        })}
        ahora={antesDelPlazo}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Elecciones objetadas anteriormente (2)' }),
    );
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Ana Pérez');
    expect(items[0]).toHaveTextContent('Motivo: Primera objeción');
    expect(items[0]).toHaveTextContent('lider@geb.com.co');
    expect(items[1]).toHaveTextContent('Luis Gómez');
    expect(items[1]).toHaveTextContent('Motivo: Segunda objeción');
  });
});

describe('JustificacionEnviadaMatriz', () => {
  it('muestra la justificación en solo lectura con el motivo de la objeción', () => {
    renderConTema(
      <JustificacionEnviadaMatriz
        seleccion={seleccionMatriz({ fortalezas: 'Liderazgo', observaciones: 'Nota' })}
        objecion={{
          motivo: 'No alcanza el concepto',
          decididaPor: decisionMatriz().decididaPor,
          decididaEn: '2026-11-11T09:00:00Z',
        }}
      />,
    );

    expect(screen.getByText('Liderazgo')).toBeInTheDocument();
    expect(screen.getByText('Nota')).toBeInTheDocument();
    expect(screen.getByText('Motivo: No alcanza el concepto')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
