import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderConTema } from '../../../test/renderConTema';
import {
  decisionMatriz,
  filaIncompleta,
  filaMatriz,
  matrizConPruebaTecnica,
  matrizSeleccion,
  matrizUnaEntrevista,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import type { FilaMatriz, MatrizSeleccion } from '../api/matriz';
import { TablaMatrizSeleccion } from './TablaMatrizSeleccion';

const interno = filaMatriz({
  jobApplicationId: 'APP-1',
  nombre: 'Ana Pérez',
  alias: 'Candidato 1',
  tipoCandidato: 'INTERNO',
  calificacion: {
    ...filaMatriz().calificacion,
    pruebaTecnica: 70,
    desempenoUltimoAnio: 'MUY_SATISFACTORIO',
    tiempoVinculacion: 'MAS_DE_5_ANIOS',
  },
  resultado: {
    resultadoPruebaTecnica: 7.5,
    resultadoTalentoHumano: 25.5,
    conceptoArea: 90,
    resultadoConceptoArea: 36,
    bonoDesempeno: 3,
    bonoVinculacion: 5,
    total: 82.4,
  },
});
const externo = filaMatriz({
  jobApplicationId: 'APP-2',
  nombre: 'Luis Gómez',
  alias: 'Candidato 2',
  tipoCandidato: 'EXTERNO',
  resultado: { total: 77.6, bonoDesempeno: 0, bonoVinculacion: 0 },
});

function renderTabla(candidatos: FilaMatriz[], overrides: Partial<MatrizSeleccion> = {}) {
  const props = {
    matriz: matrizSeleccion({ candidatos, ...overrides }),
    candidatoActivoId: null,
    onSeleccionarCandidato: vi.fn(),
  };
  renderConTema(<TablaMatrizSeleccion {...props} />);
  return props;
}

function filasCuerpo() {
  const [, cuerpo] = screen.getAllByRole('rowgroup');
  return within(cuerpo).getAllByRole('row');
}

function celdas(fila: HTMLElement) {
  return within(fila).getAllByRole('cell');
}

describe('TablaMatrizSeleccion', () => {
  it('sin candidatos muestra el estado vacío de SuccessFactors, sin invitar a cargar', () => {
    renderTabla([]);
    expect(screen.getByText('Todavía no hay puntajes para esta vacante')).toBeInTheDocument();
    expect(screen.getByText(/se registran en SuccessFactors/)).toBeInTheDocument();
    expect(screen.queryByText(/cargar/i)).not.toBeInTheDocument();
  });

  it('la primera columna es "Candidato", fija, sin columna "#"', () => {
    renderTabla([interno, externo]);

    const cabecera = screen.getByRole('columnheader', { name: 'Candidato' });
    expect(cabecera).toHaveStyle({ position: 'sticky', minWidth: '120px' });
    expect(screen.queryByRole('columnheader', { name: '#' })).not.toBeInTheDocument();
    const primeraCelda = filasCuerpo()[0].firstElementChild as HTMLElement;
    expect(primeraCelda).toBe(screen.getByRole('rowheader', { name: 'Ana Pérez' }));
    expect(primeraCelda).toHaveStyle({ position: 'sticky', minWidth: '120px' });
  });

  it('muestra el nombre o, en vista ciega, el alias, en hasta dos líneas', () => {
    const ciego = filaMatriz({ jobApplicationId: 'APP-3', nombre: null, alias: 'Candidato 7' });
    renderTabla([interno, ciego]);

    expect(screen.getByRole('rowheader', { name: 'Ana Pérez' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Candidato 7' })).toBeInTheDocument();
    expect(screen.queryByText('Candidato 1')).not.toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toHaveStyle({ WebkitLineClamp: '2' });
  });

  it('agrupa en orden I, II, III, IV, TOTAL y adicionales, con el peso en la cabecera', () => {
    renderTabla([interno]);

    const grupos = screen
      .getAllByRole('columnheader')
      .map((celda) => celda.textContent ?? '')
      .filter((texto) => /^(Criterio|TOTAL)/.test(texto));
    expect(grupos).toEqual([
      'Criterio I — 30%',
      'Criterio II — 0%',
      'Criterio III — 30%',
      'Criterio IV — 40%',
      'TOTAL',
      'Criterios adicionales para candidatos internos',
    ]);
    expect(screen.getByText('Desempeño último año')).toBeInTheDocument();
    expect(screen.getByText('Tiempo de vinculación')).toBeInTheDocument();
  });

  it('muestra las columnas de resultado de cada criterio con los valores del backend', () => {
    renderTabla([interno]);

    for (const titulo of ['% Prueba técnica', '% Resultados', 'Concepto área', '% Concepto área']) {
      expect(screen.getByRole('columnheader', { name: titulo })).toBeInTheDocument();
    }
    const valores = celdas(filasCuerpo()[0]).map((celda) => celda.textContent);
    // 5 competencias, mediana, % resultado, prueba técnica, % prueba técnica,
    // talento humano, % resultados, 2 entrevistas, concepto área, % concepto área, total.
    expect(valores.slice(0, 16)).toEqual([
      '80',
      '85',
      '78',
      '90',
      '82',
      '82',
      '24,6',
      '70',
      '7,5',
      '85',
      '25,5',
      '88',
      '92',
      '90',
      '36',
      '82,4',
    ]);
  });

  it('con entrevistasArea 1 muestra una sola columna de entrevista del jefe', () => {
    renderTabla([interno], {
      configuracion: { requierePruebaTecnica: false, entrevistasArea: 1 },
    });
    expect(screen.getByText('Entrevista jefe 1')).toBeInTheDocument();
    expect(screen.queryByText('Entrevista jefe 2')).not.toBeInTheDocument();
  });

  it('para un interno muestra la etiqueta del catálogo y los puntos de cada subgrupo', () => {
    renderTabla([interno]);
    const adicionales = celdas(filasCuerpo()[0])
      .slice(-4)
      .map((celda) => celda.textContent);
    expect(adicionales).toEqual(['Muy satisfactorio', '3', 'Más de 5 años', '5']);
  });

  it('para un externo deja vacías las cuatro celdas de adicionales', () => {
    renderTabla([externo]);
    const adicionales = celdas(filasCuerpo()[0])
      .slice(-4)
      .map((celda) => celda.textContent);
    expect(adicionales).toEqual(['', '', '', '']);
  });

  it('con total null deja la celda vacía con el texto accesible "Pendiente"', () => {
    renderTabla([filaIncompleta()]);
    const total = screen.getByRole('cell', { name: 'Pendiente' });
    expect(total).toHaveTextContent('');
    expect(screen.queryByText('#NUM!')).not.toBeInTheDocument();
  });

  it('marca a los objetados (vigente e histórico) con un ícono con el motivo', () => {
    const historico = filaMatriz({ jobApplicationId: 'APP-3' });
    renderTabla([interno, externo, historico], {
      seleccion: seleccionMatriz({ jobApplicationId: 'APP-1' }),
      decisionLider: decisionMatriz({ motivo: 'No alcanza el concepto' }),
      objeciones: [objecionMatriz({ jobApplicationId: 'APP-3', motivo: 'Poca experiencia' })],
    });

    expect(
      screen.getByRole('img', { name: 'Objetado por el líder: No alcanza el concepto' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Objetado por el líder: Poca experiencia' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /Objetado por el líder/ })).toHaveLength(2);
    // El objetado vigente no se marca como enviado.
    expect(screen.queryByRole('img', { name: 'Enviado al líder' })).not.toBeInTheDocument();
    expect(filasCuerpo()[0]).not.toHaveAttribute('data-enviada');
    // Vigente e histórico se marcan como objetados (fondo rojo suave).
    expect(filasCuerpo()[0]).toHaveAttribute('data-objetada', 'true');
    expect(filasCuerpo()[2]).toHaveAttribute('data-objetada', 'true');
    expect(filasCuerpo()[1]).not.toHaveAttribute('data-objetada');
  });

  it.each([
    ['ENVIADA_PENDIENTE', null],
    ['AVALADA', decisionMatriz({ avala: true, motivo: null })],
  ])('en %s resalta siempre la fila del enviado con su ícono', (_, decision) => {
    renderTabla([interno, externo], {
      seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
      decisionLider: decision,
    });

    const [primera, segunda] = filasCuerpo();
    expect(segunda).toHaveAttribute('data-enviada', 'true');
    expect(segunda).toHaveAttribute('aria-selected', 'false');
    expect(primera).not.toHaveAttribute('data-enviada');
    expect(
      within(screen.getByRole('rowheader', { name: /Luis Gómez/ })).getByRole('img', {
        name: 'Enviado al líder',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Enviado al líder' })).toHaveLength(1);
  });

  it('el resaltado del enviado se mantiene cuando además es la fila activa', () => {
    renderConTema(
      <TablaMatrizSeleccion
        matriz={matrizSeleccion({
          candidatos: [interno, externo],
          seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
        })}
        candidatoActivoId="APP-2"
        onSeleccionarCandidato={vi.fn()}
      />,
    );
    const segunda = filasCuerpo()[1];
    expect(segunda).toHaveAttribute('data-enviada', 'true');
    expect(segunda).toHaveAttribute('aria-selected', 'true');
  });

  it('un clic o Enter en una fila selecciona al candidato y la fila activa queda marcada', async () => {
    const onSeleccionarCandidato = vi.fn();
    renderConTema(
      <TablaMatrizSeleccion
        matriz={matrizSeleccion({ candidatos: [interno, externo] })}
        candidatoActivoId="APP-2"
        onSeleccionarCandidato={onSeleccionarCandidato}
      />,
    );
    const [primera, segunda] = filasCuerpo();

    expect(segunda).toHaveAttribute('aria-selected', 'true');
    expect(primera).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(primera);
    expect(onSeleccionarCandidato).toHaveBeenLastCalledWith('APP-1');

    segunda.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSeleccionarCandidato).toHaveBeenLastCalledWith('APP-2');

    primera.focus();
    await userEvent.keyboard(' ');
    expect(onSeleccionarCandidato).toHaveBeenLastCalledWith('APP-1');
    expect(primera).toHaveAttribute('tabindex', '0');
  });
});

const PREGUNTA_PRUEBA = '¿Se requiere prueba técnica o assessment center?';
const PREGUNTA_ENTREVISTAS = /entrevistas del área\?$/;

/** Columna (1-based) donde empieza una celda, sumando los colSpan de las anteriores de su fila. */
function columnaInicial(celda: HTMLElement): number {
  let columna = 1;
  let anterior = celda.previousElementSibling as HTMLTableCellElement | null;
  while (anterior) {
    columna += anterior.colSpan;
    anterior = anterior.previousElementSibling as HTMLTableCellElement | null;
  }
  return columna;
}

/**
 * Posición real (columna inicial y ancho) de una celda de la cabecera,
 * considerando los `rowSpan` de filas anteriores, como la calcula el navegador.
 */
function posicionEnCabecera(celda: HTMLTableCellElement): { inicio: number; ancho: number } {
  const cabecera = celda.closest('thead') as HTMLTableSectionElement;
  const ocupadas: boolean[][] = [];
  for (const [indiceFila, fila] of Array.from(cabecera.rows).entries()) {
    ocupadas[indiceFila] ??= [];
    let columna = 0;
    for (const actual of Array.from(fila.cells)) {
      while (ocupadas[indiceFila][columna]) columna += 1;
      if (actual === celda) return { inicio: columna, ancho: actual.colSpan };
      for (let f = 0; f < actual.rowSpan; f += 1) {
        ocupadas[indiceFila + f] ??= [];
        for (let c = 0; c < actual.colSpan; c += 1) ocupadas[indiceFila + f][columna + c] = true;
      }
      columna += actual.colSpan;
    }
  }
  throw new Error('La celda no está en la cabecera');
}

function cabeceraCriterio(nombre: RegExp) {
  return screen.getByRole('columnheader', { name: nombre }) as HTMLTableCellElement;
}

describe('TablaMatrizSeleccion: banda de configuración', () => {
  it('muestra la etiqueta, las dos preguntas y sus valores, sin controles', () => {
    renderTabla([externo]);

    expect(screen.getByText('Configuración de la matriz')).toBeInTheDocument();
    expect(screen.getByText('Definida en SuccessFactors')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: PREGUNTA_PRUEBA })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: PREGUNTA_ENTREVISTAS })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'No' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('con entrevistasArea 1 muestra "1" y la pregunta abarca las columnas del Criterio IV', () => {
    renderConTema(<TablaMatrizSeleccion matriz={matrizUnaEntrevista()} />);

    expect(screen.getByRole('cell', { name: '1' })).toHaveAttribute('headers');
    const pregunta = screen.getByRole('columnheader', {
      name: PREGUNTA_ENTREVISTAS,
    }) as HTMLTableCellElement;
    expect(pregunta.colSpan).toBe(3);
    expect(pregunta.colSpan).toBe(cabeceraCriterio(/^Criterio IV/).colSpan);
  });

  it('con requierePruebaTecnica true muestra "Sí", sin aviso ni error', () => {
    renderConTema(<TablaMatrizSeleccion matriz={matrizConPruebaTecnica()} />);

    expect(screen.getByRole('cell', { name: 'Sí' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('la etiqueta de configuración queda sobre "Candidato" y el Criterio I', () => {
    renderTabla([interno]);

    const etiqueta = screen.getByRole('columnheader', {
      name: /Configuración de la matriz/,
    }) as HTMLTableCellElement;
    const candidato = screen.getByRole('columnheader', {
      name: 'Candidato',
    }) as HTMLTableCellElement;
    const criterioI = cabeceraCriterio(/^Criterio I —/);

    expect(posicionEnCabecera(etiqueta)).toEqual({
      inicio: posicionEnCabecera(candidato).inicio,
      ancho: candidato.colSpan + criterioI.colSpan,
    });
    expect(posicionEnCabecera(criterioI).inicio).toBe(posicionEnCabecera(candidato).inicio + 1);
  });

  it('alinea la pregunta de prueba técnica con los Criterios II y III y la de entrevistas con el IV', () => {
    renderTabla([interno]);

    const pruebaTecnica = screen.getByRole('columnheader', {
      name: PREGUNTA_PRUEBA,
    }) as HTMLTableCellElement;
    const entrevistas = screen.getByRole('columnheader', {
      name: PREGUNTA_ENTREVISTAS,
    }) as HTMLTableCellElement;
    const criterioII = cabeceraCriterio(/^Criterio II —/);
    const criterioIII = cabeceraCriterio(/^Criterio III/);
    const criterioIV = cabeceraCriterio(/^Criterio IV/);

    expect(pruebaTecnica.colSpan).toBe(criterioII.colSpan + criterioIII.colSpan);
    expect(columnaInicial(pruebaTecnica)).toBe(columnaInicial(criterioII));
    expect(entrevistas.colSpan).toBe(criterioIV.colSpan);
    expect(columnaInicial(entrevistas)).toBe(columnaInicial(criterioIV));
  });

  it('no deja celda vacía sobre el Criterio III: la pregunta de entrevistas sigue a la de prueba técnica', () => {
    renderTabla([interno]);

    const pruebaTecnica = screen.getByRole('columnheader', { name: PREGUNTA_PRUEBA });
    const fila = pruebaTecnica.closest('tr') as HTMLTableRowElement;
    expect(pruebaTecnica.nextElementSibling).toBe(
      screen.getByRole('columnheader', { name: PREGUNTA_ENTREVISTAS }),
    );
    // Etiqueta, prueba técnica, entrevistas y la celda vacía sobre TOTAL + adicionales.
    expect(fila.cells).toHaveLength(4);
    const vacia = fila.cells[3];
    expect(vacia).toBeEmptyDOMElement();
    expect(posicionEnCabecera(vacia)).toEqual({
      inicio: posicionEnCabecera(
        screen.getByRole('columnheader', { name: 'TOTAL' }) as HTMLTableCellElement,
      ).inicio,
      ancho: 5,
    });
  });

  it.each([
    ['dos entrevistas', matrizSeleccion({ candidatos: [externo] }), '2'],
    ['una entrevista', matrizUnaEntrevista(), '1'],
  ])('con %s cada valor queda en la misma columna que su pregunta', (_, matriz, entrevistas) => {
    renderConTema(<TablaMatrizSeleccion matriz={matriz} />);

    const criterioII = posicionEnCabecera(cabeceraCriterio(/^Criterio II —/));
    const criterioIII = posicionEnCabecera(cabeceraCriterio(/^Criterio III/));
    const pares: [HTMLElement, HTMLElement, { inicio: number; ancho: number }][] = [
      [
        screen.getByRole('columnheader', { name: PREGUNTA_PRUEBA }),
        screen.getByRole('cell', { name: 'No' }),
        { inicio: criterioII.inicio, ancho: criterioII.ancho + criterioIII.ancho },
      ],
      [
        screen.getByRole('columnheader', { name: PREGUNTA_ENTREVISTAS }),
        screen.getByRole('cell', { name: entrevistas }),
        posicionEnCabecera(cabeceraCriterio(/^Criterio IV/)),
      ],
    ];
    for (const [pregunta, valor, posicionCriterios] of pares) {
      const posicionPregunta = posicionEnCabecera(pregunta as HTMLTableCellElement);
      expect(posicionEnCabecera(valor as HTMLTableCellElement)).toEqual(posicionPregunta);
      expect(posicionPregunta).toEqual(posicionCriterios);
      expect(valor).toHaveAttribute('headers', pregunta.id);
    }
    // La fila de valores solo tiene las dos celdas de valor: etiqueta y vacías ocupan ambas filas.
    const filaValores = screen
      .getByRole('cell', { name: 'No' })
      .closest('tr') as HTMLTableRowElement;
    expect(filaValores.cells).toHaveLength(2);
  });

  it('expone las preguntas como cabeceras de grupo y asocia cada valor a su pregunta', () => {
    renderTabla([externo]);

    const pregunta = screen.getByRole('columnheader', { name: PREGUNTA_PRUEBA });
    expect(pregunta.tagName).toBe('TH');
    expect(pregunta).toHaveAttribute('scope', 'colgroup');
    const valor = screen.getByRole('cell', { name: 'No' });
    expect(valor).toHaveAttribute('headers', pregunta.id);
    expect(valor).toHaveAccessibleDescription(PREGUNTA_PRUEBA);

    const preguntaEntrevistas = screen.getByRole('columnheader', { name: PREGUNTA_ENTREVISTAS });
    expect(preguntaEntrevistas).toHaveAttribute('scope', 'colgroup');
    expect(screen.getByRole('cell', { name: '2' })).toHaveAttribute(
      'headers',
      preguntaEntrevistas.id,
    );
  });

  it('sin candidatos muestra solo el estado vacío, sin banda', () => {
    renderTabla([]);

    expect(screen.queryByText('Configuración de la matriz')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('las cabeceras de sub-ítems usan la clase de texto compacto y las de grupo no', () => {
    renderTabla([interno]);

    expect(screen.getByRole('columnheader', { name: 'Mediana' })).toHaveClass('matriz-subitem');
    expect(screen.getByRole('columnheader', { name: 'Evaluación' })).toHaveClass('matriz-subitem');
    expect(cabeceraCriterio(/^Criterio I —/)).not.toHaveClass('matriz-subitem');
    expect(screen.getByRole('columnheader', { name: 'TOTAL' })).not.toHaveClass('matriz-subitem');
  });

  it('la banda de configuración usa su propia clase de texto compacto', () => {
    renderTabla([interno]);

    const pregunta = screen.getByRole('columnheader', { name: /prueba técnica o assessment/ });
    expect(pregunta).toHaveClass('matriz-configuracion', 'matriz-configuracion-pregunta');
    expect(pregunta).not.toHaveClass('matriz-subitem');
    const titulo = screen.getByText('Configuración de la matriz');
    expect(titulo).toHaveClass('matriz-configuracion-titulo');
    expect(titulo.closest('th')).toHaveClass('matriz-configuracion');
    expect(screen.getByText('No').closest('td')).toHaveClass('matriz-configuracion-valor');
  });

  it('las columnas de sub-ítems tienen 40px de ancho mínimo y las de texto largo 60px', () => {
    renderTabla([interno]);

    expect(screen.getByRole('columnheader', { name: 'Mediana' })).toHaveStyle({ minWidth: '40px' });
    expect(screen.getByRole('columnheader', { name: 'Prueba técnica' })).toHaveStyle({
      minWidth: '40px',
    });
    expect(screen.getByRole('columnheader', { name: 'Evaluación' })).toHaveStyle({
      minWidth: '60px',
    });
    expect(screen.getByRole('columnheader', { name: 'Rango' })).toHaveStyle({ minWidth: '60px' });
  });
});
