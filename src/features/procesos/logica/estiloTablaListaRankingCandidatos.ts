import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Estilos de la tabla de `ListaRankingCandidatos`. Se generan aparte del
 * componente porque son overrides de CSS de `GebDataTable`/MUI, no lógica de
 * columnas: aislarlos evita que un solo archivo mezcle ambas responsabilidades.
 */
export function estiloTablaListaRankingCandidatos(esSelecta: boolean): SxProps<Theme> {
  return {
    // `table-layout: fixed` obliga a cada columna a respetar su `ancho`: sin
    // esto, la columna "Candidato" (sin ancho fijo) crece con el contenido
    // (nombre + origen + fecha) y empuja la tabla a un scroll horizontal
    // innecesario en el layout de 340px del paso.
    '& .MuiTable-root': { tableLayout: 'fixed', width: '100%' },
    // Con el bloque de identidad a varias líneas (nombre + meta + "Ver
    // detalle"), alinear el contenido de cada celda arriba deja el avatar,
    // el checkbox y la afinidad a la altura del nombre, no flotando al
    // centro vertical de la fila.
    '& .MuiTableCell-root': { verticalAlign: 'top' },
    // Negrilla real en los encabezados de columna: `.MuiTableCell-head` cubre
    // la tabla de escritorio. En la vista de tarjetas mobile no hay
    // `TableCell` de header — el título de cada campo se pinta como
    // `Typography variant="caption"` dentro de la tarjeta, hijo directo de la
    // fila; el selector baja hasta ese nivel exacto para no afectar otros
    // textos en `caption` que pueda tener el contenido de cada campo.
    '& .MuiTableCell-head': { fontWeight: 700 },
    '& [data-geb="GebDataTable-tarjetas"] .MuiCard-root > .MuiCardContent-root > .MuiBox-root > .MuiTypography-caption':
      { fontWeight: 700 },
    ...(esSelecta
      ? {
          // Acerca el checkbox al avatar: recorta el relleno lateral entre
          // la primera columna (selección) y la segunda (candidato).
          '& td:first-of-type, & th:first-of-type': { pr: 0 },
          '& td:nth-of-type(2), & th:nth-of-type(2)': { pl: 0.5 },
        }
      : {}),
    // La paginación de GebDataTable no encoge sola en columnas angostas;
    // se compacta para que quepa sin scroll horizontal propio.
    '& .MuiTablePagination-toolbar': {
      flexWrap: 'wrap',
      minHeight: 'auto',
      rowGap: 0.25,
      pl: 1,
      pr: 0.5,
    },
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
      fontSize: '0.7rem',
    },
    '& .MuiTablePagination-select': {
      fontSize: '0.7rem',
    },
    '& .MuiTablePagination-actions': {
      ml: 0,
    },
    '& .MuiTablePagination-actions .MuiIconButton-root': {
      p: 0.5,
    },
  };
}
