import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Desmonta el árbol renderizado entre pruebas para que las consultas de una
// prueba no encuentren restos de la anterior.
afterEach(() => {
  cleanup();
});
