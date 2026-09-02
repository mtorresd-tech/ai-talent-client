/**
 * Mock de `window.matchMedia` para las pruebas: jsdom no lo implementa, y
 * `useMediaQuery` de MUI lo necesita para resolver breakpoints.
 */

const ANCHO_ESCRITORIO = 1280;
let anchoViewport = ANCHO_ESCRITORIO;

/** Fija el ancho de viewport que verán las media queries de la prueba actual. */
export function establecerAnchoViewport(ancho: number): void {
  anchoViewport = ancho;
}

/** Devuelve el ancho de viewport al valor de escritorio por defecto. */
export function restablecerAnchoViewport(): void {
  anchoViewport = ANCHO_ESCRITORIO;
}

function consultaCoincide(consulta: string): boolean {
  const condiciones = [...consulta.matchAll(/\((min|max)-width:\s*([\d.]+)px\)/g)];
  if (condiciones.length === 0) return false;
  return condiciones.every(([, tipo, valor]) => {
    const limite = Number(valor);
    return tipo === 'min' ? anchoViewport >= limite : anchoViewport <= limite;
  });
}

/** Instala el mock en `window.matchMedia`. Se invoca una vez en el setup. */
export function instalarMatchMedia(): void {
  window.matchMedia = (consulta: string): MediaQueryList =>
    ({
      get matches() {
        return consultaCoincide(consulta);
      },
      media: consulta,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
