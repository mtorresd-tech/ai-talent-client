import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { instalarMatchMedia, restablecerAnchoViewport } from './src/test/matchMedia.ts';

// jsdom no implementa `window.matchMedia`; se instala un mock configurable para
// poder probar el comportamiento responsive (`useMediaQuery`).
instalarMatchMedia();

// Desmonta el árbol renderizado entre pruebas para que las consultas de una
// prueba no encuentren restos de la anterior, y restablece el ancho de viewport
// al valor de escritorio por defecto.
afterEach(() => {
  cleanup();
  restablecerAnchoViewport();
});
