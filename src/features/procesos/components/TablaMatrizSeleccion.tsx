import { useId, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import type { Theme } from '@mui/material/styles';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { GebEmptyState } from '@geb/ui';
import {
  COMPETENCIAS,
  ETIQUETA_COMPETENCIA,
  ETIQUETA_DESEMPENO_ULTIMO_ANIO,
  ETIQUETA_TIEMPO_VINCULACION,
  type ConfiguracionMatriz,
  type FilaMatriz,
  type MatrizSeleccion,
} from '../api/matriz';
import { nombreCandidato } from '../logica/candidato';
import { MATRIZ_SIN_PUNTAJES } from '../logica/candidatosMatriz';
import {
  colorBordeFilaActiva,
  colorFilaActiva,
  colorFilaEnviada,
  colorFilaObjetada,
  colorFondoMatriz,
  colorIconoEnviado,
  colorIconoObjecion,
  colorTextoMatriz,
  colorTextoObjetado,
  coloresConfiguracionMatriz,
  type BloqueMatriz,
  type NivelColorMatriz,
} from '../logica/coloresMatriz';
import { estadoEnvioMatriz, idsObjetados, objecionDe } from '../logica/estadoEnvioMatriz';
import { formatearPeso, formatearPuntaje } from '../logica/formatoMatriz';

interface ColumnaMatriz {
  clave: string;
  titulo: string;
  bloque: BloqueMatriz;
  nivel: NivelColorMatriz;
  /** Primera columna de su grupo: lleva el separador vertical. */
  inicioGrupo?: boolean;
  /** Valor textual (etiqueta de catálogo) que puede ocupar varias líneas en la celda. */
  textoLargo?: boolean;
  valor: (fila: FilaMatriz) => string;
}

/**
 * Anchos, en unidades de espaciado del tema, de la columna "Candidato" (120 px)
 * y mínimos de las de sub-ítems (40 px) y de texto largo (60 px): con ellos la
 * matriz entra sin scroll horizontal en el ancho de contenido de un escritorio
 * de 1280 px.
 */
const ANCHO_COLUMNA_CANDIDATO = 15;
const ANCHO_MINIMO_COLUMNA = 5;
const ANCHO_MINIMO_COLUMNA_TEXTO = 7.5;

/** Clase de las cabeceras de sub-ítems: texto pequeño en varias líneas para ganar ancho. */
const CLASE_SUBITEM = 'matriz-subitem';
/** Celdas de la banda de configuración, con texto más compacto que el de los criterios. */
const CLASE_CONFIGURACION = 'matriz-configuracion';
const CLASE_VALOR_CONFIGURACION = 'matriz-configuracion-valor';
const CLASE_PREGUNTA_CONFIGURACION = 'matriz-configuracion-pregunta';
const CLASE_TITULO_CONFIGURACION = 'matriz-configuracion-titulo';

function columnasCriterios(entrevistasArea: 1 | 2): ColumnaMatriz[] {
  return [
    ...COMPETENCIAS.map((competencia, indice): ColumnaMatriz => ({
      clave: competencia,
      titulo: ETIQUETA_COMPETENCIA[competencia],
      bloque: 'criterioI',
      nivel: 'cruda',
      inicioGrupo: indice === 0,
      valor: (fila) => formatearPuntaje(fila.calificacion.competencias[competencia]),
    })),
    {
      clave: 'mediana',
      titulo: 'Mediana',
      bloque: 'criterioI',
      nivel: 'intermedia',
      valor: (fila) => formatearPuntaje(fila.resultado.medianaCompetencias),
    },
    {
      clave: 'resultadoCompetencias',
      titulo: '% Resultado',
      bloque: 'criterioI',
      nivel: 'resultado',
      valor: (fila) => formatearPuntaje(fila.resultado.resultadoCompetencias),
    },
    {
      clave: 'pruebaTecnica',
      titulo: 'Prueba técnica',
      bloque: 'criterioII',
      nivel: 'cruda',
      inicioGrupo: true,
      valor: (fila) => formatearPuntaje(fila.calificacion.pruebaTecnica),
    },
    {
      clave: 'resultadoPruebaTecnica',
      titulo: '% Prueba técnica',
      bloque: 'criterioII',
      nivel: 'resultado',
      valor: (fila) => formatearPuntaje(fila.resultado.resultadoPruebaTecnica),
    },
    {
      clave: 'talentoHumano',
      titulo: 'Talento Humano',
      bloque: 'criterioIII',
      nivel: 'cruda',
      inicioGrupo: true,
      valor: (fila) => formatearPuntaje(fila.calificacion.talentoHumano),
    },
    {
      clave: 'resultadoTalentoHumano',
      titulo: '% Resultados',
      bloque: 'criterioIII',
      nivel: 'resultado',
      valor: (fila) => formatearPuntaje(fila.resultado.resultadoTalentoHumano),
    },
    ...Array.from({ length: entrevistasArea }, (_, indice): ColumnaMatriz => ({
      clave: `entrevistaJefe${indice + 1}`,
      titulo: `Entrevista jefe ${indice + 1}`,
      bloque: 'criterioIV',
      nivel: 'cruda',
      inicioGrupo: indice === 0,
      valor: (fila) => formatearPuntaje(fila.calificacion.entrevistasJefe[indice]),
    })),
    {
      clave: 'conceptoArea',
      titulo: 'Concepto área',
      bloque: 'criterioIV',
      nivel: 'intermedia',
      valor: (fila) => formatearPuntaje(fila.resultado.conceptoArea),
    },
    {
      clave: 'resultadoConceptoArea',
      titulo: '% Concepto área',
      bloque: 'criterioIV',
      nivel: 'resultado',
      valor: (fila) => formatearPuntaje(fila.resultado.resultadoConceptoArea),
    },
  ];
}

const esInterno = (fila: FilaMatriz) => fila.tipoCandidato === 'INTERNO';

const COLUMNAS_ADICIONALES: ColumnaMatriz[] = [
  {
    clave: 'desempeno',
    titulo: 'Evaluación',
    bloque: 'adicionales',
    nivel: 'cruda',
    inicioGrupo: true,
    textoLargo: true,
    valor: (fila) =>
      esInterno(fila) && fila.calificacion.desempenoUltimoAnio
        ? ETIQUETA_DESEMPENO_ULTIMO_ANIO[fila.calificacion.desempenoUltimoAnio]
        : '',
  },
  {
    clave: 'bonoDesempeno',
    titulo: 'Puntos',
    bloque: 'adicionales',
    nivel: 'resultado',
    valor: (fila) => (esInterno(fila) ? formatearPuntaje(fila.resultado.bonoDesempeno) : ''),
  },
  {
    clave: 'vinculacion',
    titulo: 'Rango',
    bloque: 'adicionales',
    nivel: 'cruda',
    textoLargo: true,
    valor: (fila) =>
      esInterno(fila) && fila.calificacion.tiempoVinculacion
        ? ETIQUETA_TIEMPO_VINCULACION[fila.calificacion.tiempoVinculacion]
        : '',
  },
  {
    clave: 'bonoVinculacion',
    titulo: 'Puntos',
    bloque: 'adicionales',
    nivel: 'resultado',
    valor: (fila) => (esInterno(fila) ? formatearPuntaje(fila.resultado.bonoVinculacion) : ''),
  },
];

const contarColumnas = (columnas: ColumnaMatriz[], bloque: BloqueMatriz) =>
  columnas.filter((columna) => columna.bloque === bloque).length;

const SEPARADOR_GRUPO = { borderLeft: 2, borderLeftColor: 'divider' } as const;

/** Columna "Candidato" y su cabecera: fija a la izquierda, con fondo opaco para tapar lo que se desplaza por debajo. */
const ESTILO_COLUMNA_FIJA = {
  position: 'sticky',
  left: 0,
  bgcolor: 'background.paper',
  borderRight: 2,
  borderRightColor: 'divider',
  minWidth: (theme: Theme) => theme.spacing(ANCHO_COLUMNA_CANDIDATO),
  maxWidth: (theme: Theme) => theme.spacing(ANCHO_COLUMNA_CANDIDATO),
} as const;

/** Nombre en hasta dos líneas; el resto se corta con puntos suspensivos. */
const ESTILO_NOMBRE_DOS_LINEAS = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  whiteSpace: 'normal',
  minWidth: 0,
} as const;

/** Capa de color superpuesta a todas las celdas de una fila, sin ocultar el color de cada columna. */
const capa = (color: string) => `linear-gradient(${color}, ${color})`;

function estiloCabecera(bloque: BloqueMatriz, nivel: NivelColorMatriz, inicioGrupo?: boolean) {
  return {
    bgcolor: (theme: Theme) => colorFondoMatriz(theme, bloque, nivel),
    color: (theme: Theme) => colorTextoMatriz(theme, bloque),
    fontWeight: 700,
    textAlign: 'center' as const,
    lineHeight: 1.3,
    ...(inicioGrupo ? SEPARADOR_GRUPO : {}),
  };
}

function estiloSubitem(columna: ColumnaMatriz) {
  return {
    ...estiloCabecera(columna.bloque, columna.nivel, columna.inicioGrupo),
    fontWeight: 600,
    minWidth: (theme: Theme) =>
      theme.spacing(columna.textoLargo ? ANCHO_MINIMO_COLUMNA_TEXTO : ANCHO_MINIMO_COLUMNA),
  };
}

const PREGUNTA_PRUEBA_TECNICA = '¿Se requiere prueba técnica o assessment center?';
const PREGUNTA_ENTREVISTAS =
  '¿El nivel de cargo requiere 1 (hasta Profesional Senior) o 2 (a partir de Asesor I) entrevistas del área?';

interface BandaConfiguracionMatrizProps {
  configuracion: ConfiguracionMatriz;
  /** Columnas de los criterios I a IV visibles, para alinear cada pregunta con sus criterios. */
  columnas: ColumnaMatriz[];
}

/**
 * Dos primeras filas de la cabecera con la configuración de la matriz, en
 * solo lectura: la etiqueta sobre "Candidato" y el Criterio I, la pregunta de prueba
 * técnica sobre los Criterios II y III, la de entrevistas sobre el Criterio IV
 * y una celda vacía sobre TOTAL y adicionales. Cada valor queda debajo de su
 * pregunta, con el mismo `colSpan` y asociado a ella con `headers`. La
 * etiqueta y la celda vacía ocupan las dos filas, así que la fila de valores
 * solo tiene las dos celdas de valor.
 */
function BandaConfiguracionMatriz({ configuracion, columnas }: BandaConfiguracionMatrizProps) {
  const id = useId();
  const idPruebaTecnica = `${id}-prueba-tecnica`;
  const idEntrevistas = `${id}-entrevistas`;
  const columnasPruebaTecnica =
    contarColumnas(columnas, 'criterioII') + contarColumnas(columnas, 'criterioIII');
  const fondoBanda = (theme: Theme) => coloresConfiguracionMatriz(theme).banda;
  const estiloVacia = { bgcolor: fondoBanda, ...SEPARADOR_GRUPO };
  const estiloPregunta = {
    ...estiloVacia,
    color: 'text.primary',
    fontWeight: 600,
    textAlign: 'center' as const,
  };
  const estiloValor = {
    ...estiloVacia,
    color: 'text.primary',
    fontWeight: 700,
    textAlign: 'center' as const,
  };

  return (
    <>
      <TableRow>
        <TableCell
          component="th"
          scope="colgroup"
          rowSpan={2}
          colSpan={1 + contarColumnas(columnas, 'criterioI')}
          className={CLASE_CONFIGURACION}
          sx={{
            bgcolor: (theme) => coloresConfiguracionMatriz(theme).etiqueta,
            color: 'text.primary',
            textAlign: 'left',
          }}
        >
          <Box
            component="span"
            className={CLASE_TITULO_CONFIGURACION}
            sx={{ display: 'block', fontWeight: 700 }}
          >
            Configuración de la matriz
          </Box>
          <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
            Definida en SuccessFactors
          </Box>
        </TableCell>
        <TableCell
          component="th"
          scope="colgroup"
          id={idPruebaTecnica}
          className={`${CLASE_CONFIGURACION} ${CLASE_PREGUNTA_CONFIGURACION}`}
          colSpan={columnasPruebaTecnica}
          sx={estiloPregunta}
        >
          {PREGUNTA_PRUEBA_TECNICA}
        </TableCell>
        <TableCell
          component="th"
          scope="colgroup"
          id={idEntrevistas}
          className={`${CLASE_CONFIGURACION} ${CLASE_PREGUNTA_CONFIGURACION}`}
          colSpan={contarColumnas(columnas, 'criterioIV')}
          sx={estiloPregunta}
        >
          {PREGUNTA_ENTREVISTAS}
        </TableCell>
        <TableCell
          component="td"
          rowSpan={2}
          colSpan={1 + COLUMNAS_ADICIONALES.length}
          className={CLASE_CONFIGURACION}
          sx={estiloVacia}
        />
      </TableRow>
      <TableRow>
        <TableCell
          component="td"
          headers={idPruebaTecnica}
          aria-describedby={idPruebaTecnica}
          colSpan={columnasPruebaTecnica}
          className={`${CLASE_CONFIGURACION} ${CLASE_VALOR_CONFIGURACION}`}
          sx={estiloValor}
        >
          {configuracion.requierePruebaTecnica ? 'Sí' : 'No'}
        </TableCell>
        <TableCell
          component="td"
          headers={idEntrevistas}
          aria-describedby={idEntrevistas}
          colSpan={contarColumnas(columnas, 'criterioIV')}
          className={`${CLASE_CONFIGURACION} ${CLASE_VALOR_CONFIGURACION}`}
          sx={estiloValor}
        >
          {configuracion.entrevistasArea}
        </TableCell>
      </TableRow>
    </>
  );
}

export interface TablaMatrizSeleccionProps {
  matriz: MatrizSeleccion;
  /** Candidato con la fila resaltada (el elegido en la tabla). */
  candidatoActivoId?: string | null;
  onSeleccionarCandidato?: (jobApplicationId: string) => void;
}

/**
 * Tabla comparativa de la matriz de selección, con la misma distribución y
 * colores por criterio que la plantilla de Excel que reemplaza: la banda de
 * configuración en solo lectura, tres filas de cabecera (criterio → subgrupo
 * → columna), Criterios I a IV, TOTAL y los criterios adicionales de internos.
 * Los valores se muestran tal cual llegan del backend. La columna "Candidato"
 * (nombre o alias) queda fija al desplazar la tabla dentro de su propio
 * contenedor. Cada fila se elige con clic, Enter o Espacio; la del candidato
 * enviado al líder queda resaltada siempre y los objetados se atenúan con un
 * ícono que muestra el motivo.
 */
export function TablaMatrizSeleccion({
  matriz,
  candidatoActivoId,
  onSeleccionarCandidato,
}: TablaMatrizSeleccionProps) {
  if (matriz.candidatos.length === 0) {
    return (
      <GebEmptyState
        titulo={MATRIZ_SIN_PUNTAJES.titulo}
        descripcion={MATRIZ_SIN_PUNTAJES.descripcion}
      />
    );
  }

  const { pesos } = matriz;
  const columnas = columnasCriterios(matriz.configuracion.entrevistasArea);
  const objetados = idsObjetados(matriz);
  // El enviado objetado se marca como objetado, no como enviado.
  const enviadoId =
    matriz.seleccion && estadoEnvioMatriz(matriz) !== 'OBJETADA'
      ? matriz.seleccion.jobApplicationId
      : null;

  const alTeclado = (evento: KeyboardEvent<HTMLTableRowElement>, jobApplicationId: string) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      onSeleccionarCandidato?.(jobApplicationId);
    }
  };

  return (
    <Box
      sx={{
        overflowX: 'auto',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        minWidth: 0,
      }}
    >
      <Table
        size="small"
        aria-label="Matriz de selección"
        sx={(theme) => ({
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& th, & td': { px: 1, py: 0.75, fontSize: theme.typography.body2.fontSize },
          '& thead th': { verticalAlign: 'middle' },
          [`& .${CLASE_SUBITEM}`]: {
            px: 0.5,
            fontSize: theme.typography.pxToRem(10),
            lineHeight: 1.25,
            whiteSpace: 'normal',
            hyphens: 'auto',
            overflowWrap: 'break-word',
          },
          [`& .${CLASE_CONFIGURACION}`]: {
            px: 0.75,
            py: 0.5,
            fontSize: theme.typography.pxToRem(10),
            lineHeight: 1.25,
            whiteSpace: 'normal',
            hyphens: 'auto',
            overflowWrap: 'break-word',
          },
          [`& .${CLASE_VALOR_CONFIGURACION}`]: { fontSize: theme.typography.pxToRem(11) },
          [`& .${CLASE_PREGUNTA_CONFIGURACION}`]: { fontSize: theme.typography.pxToRem(9.5) },
          [`& .${CLASE_TITULO_CONFIGURACION}`]: { fontSize: theme.typography.pxToRem(12) },
        })}
      >
        <TableHead>
          <BandaConfiguracionMatriz configuracion={matriz.configuracion} columnas={columnas} />
          <TableRow>
            <TableCell
              component="th"
              scope="col"
              rowSpan={3}
              sx={{ ...ESTILO_COLUMNA_FIJA, zIndex: 3, fontWeight: 700, textAlign: 'left' }}
            >
              Candidato
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={contarColumnas(columnas, 'criterioI')}
              sx={estiloCabecera('criterioI', 'cabecera', true)}
            >
              Criterio I — {formatearPeso(pesos.competencias)}
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={contarColumnas(columnas, 'criterioII')}
              sx={estiloCabecera('criterioII', 'cabecera', true)}
            >
              Criterio II — {formatearPeso(pesos.pruebaTecnica)}
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={contarColumnas(columnas, 'criterioIII')}
              sx={estiloCabecera('criterioIII', 'cabecera', true)}
            >
              Criterio III — {formatearPeso(pesos.talentoHumano)}
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={contarColumnas(columnas, 'criterioIV')}
              sx={estiloCabecera('criterioIV', 'cabecera', true)}
            >
              Criterio IV — {formatearPeso(pesos.conceptoArea)}
            </TableCell>
            <TableCell
              component="th"
              scope="col"
              rowSpan={3}
              sx={estiloCabecera('total', 'cabecera', true)}
            >
              TOTAL
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={COLUMNAS_ADICIONALES.length}
              sx={estiloCabecera('adicionales', 'cabecera', true)}
            >
              Criterios adicionales para candidatos internos
            </TableCell>
          </TableRow>
          <TableRow>
            {columnas.map((columna) => (
              <TableCell
                key={columna.clave}
                component="th"
                scope="col"
                rowSpan={2}
                className={CLASE_SUBITEM}
                sx={estiloSubitem(columna)}
              >
                {columna.titulo}
              </TableCell>
            ))}
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={2}
              sx={estiloCabecera('adicionales', 'subgrupo', true)}
            >
              Desempeño último año
            </TableCell>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={2}
              sx={estiloCabecera('adicionales', 'subgrupo')}
            >
              Tiempo de vinculación
            </TableCell>
          </TableRow>
          <TableRow>
            {COLUMNAS_ADICIONALES.map((columna) => (
              <TableCell
                key={columna.clave}
                component="th"
                scope="col"
                className={CLASE_SUBITEM}
                sx={estiloSubitem(columna)}
              >
                {columna.titulo}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {matriz.candidatos.map((fila) => {
            const activa = fila.jobApplicationId === candidatoActivoId;
            const enviada = fila.jobApplicationId === enviadoId;
            const objetado = objetados.has(fila.jobApplicationId);
            const objecion = objetado ? objecionDe(matriz, fila.jobApplicationId) : null;
            const motivo = objecion?.motivo ?? 'Sin motivo registrado';
            const nombre = nombreCandidato(fila);
            // La capa de la fila activa va encima de la del enviado o del objetado.
            const capaActiva =
              activa || enviada || objetado
                ? (theme: Theme) =>
                    [
                      ...(activa ? [capa(colorFilaActiva(theme))] : []),
                      ...(enviada ? [capa(colorFilaEnviada(theme))] : []),
                      ...(objetado ? [capa(colorFilaObjetada(theme))] : []),
                    ].join(', ')
                : undefined;

            const estiloCelda = (columna: ColumnaMatriz) => ({
              bgcolor: (theme: Theme) => colorFondoMatriz(theme, columna.bloque, columna.nivel),
              backgroundImage: capaActiva,
              color: (theme: Theme) =>
                objetado ? colorTextoObjetado(theme) : colorTextoMatriz(theme, columna.bloque),
              textAlign: 'center' as const,
              whiteSpace: columna.textoLargo ? ('normal' as const) : ('nowrap' as const),
              ...(columna.inicioGrupo ? SEPARADOR_GRUPO : {}),
            });

            return (
              <TableRow
                key={fila.jobApplicationId}
                hover={Boolean(onSeleccionarCandidato)}
                aria-selected={activa}
                data-enviada={enviada || undefined}
                data-objetada={objetado || undefined}
                tabIndex={onSeleccionarCandidato ? 0 : undefined}
                onClick={
                  onSeleccionarCandidato
                    ? () => onSeleccionarCandidato(fila.jobApplicationId)
                    : undefined
                }
                onKeyDown={
                  onSeleccionarCandidato
                    ? (evento) => alTeclado(evento, fila.jobApplicationId)
                    : undefined
                }
                sx={{ cursor: onSeleccionarCandidato ? 'pointer' : 'default' }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    ...ESTILO_COLUMNA_FIJA,
                    zIndex: 1,
                    backgroundImage: capaActiva,
                    boxShadow: activa
                      ? (theme) => `inset 3px 0 0 ${colorBordeFilaActiva(theme)}`
                      : undefined,
                    color: objetado ? 'text.secondary' : 'text.primary',
                    fontWeight: activa || enviada ? 700 : 500,
                    textAlign: 'left',
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" title={nombre} sx={ESTILO_NOMBRE_DOS_LINEAS}>
                      {nombre}
                    </Box>
                    {enviada && (
                      <Tooltip title="Enviado al líder">
                        <TaskAltIcon
                          role="img"
                          aria-hidden={false}
                          aria-label="Enviado al líder"
                          fontSize="small"
                          sx={{ flexShrink: 0, color: (theme) => colorIconoEnviado(theme) }}
                        />
                      </Tooltip>
                    )}
                    {objetado && (
                      <Tooltip title={`Objetado por el líder: ${motivo}`}>
                        <ThumbDownOffAltIcon
                          role="img"
                          aria-hidden={false}
                          aria-label={`Objetado por el líder: ${motivo}`}
                          fontSize="small"
                          sx={{ flexShrink: 0, color: (theme) => colorIconoObjecion(theme) }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                {columnas.map((columna) => (
                  <TableCell key={columna.clave} sx={estiloCelda(columna)}>
                    {columna.valor(fila)}
                  </TableCell>
                ))}
                <TableCell
                  aria-label={fila.resultado.total === null ? 'Pendiente' : undefined}
                  sx={{
                    ...estiloCelda({
                      clave: 'total',
                      titulo: 'TOTAL',
                      bloque: 'total',
                      nivel: 'resultado',
                      inicioGrupo: true,
                      valor: () => '',
                    }),
                    color: (theme) => colorTextoMatriz(theme, 'total'),
                    fontWeight: 700,
                  }}
                >
                  {formatearPuntaje(fila.resultado.total)}
                </TableCell>
                {COLUMNAS_ADICIONALES.map((columna) => (
                  <TableCell key={columna.clave} sx={estiloCelda(columna)}>
                    {columna.valor(fila)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
