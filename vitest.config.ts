import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fuerza que react/@mui/material/@emotion resuelvan contra las copias de este
 * repo (igual que en la config de build), para no cargar dos copias de React
 * por el `link:` de `@geb/*`. TODO: quitar cuando esa librería suba sus peers
 * a las mismas versiones que este repo.
 */
const forzarCopiaLocal = [
  'react',
  'react-dom',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
];

export default defineConfig({
  resolve: {
    dedupe: forzarCopiaLocal,
    alias: Object.fromEntries(
      forzarCopiaLocal.map((paquete) => [paquete, path.resolve(dirname, 'node_modules', paquete)]),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    // Default de Vitest (5000ms) alcanza a fallar por contención de CPU en
    // corridas con paralelismo de archivos en esta máquina, no por un test
    // lento de verdad — se sube para absorber esa variabilidad.
    testTimeout: 20000,
    hookTimeout: 20000,
    // `v8` reporta 0% aquí: el `%20` literal en la ruta del proyecto rompe su
    // emparejamiento de archivos. `istanbul` no depende de esa ruta.
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.d.ts', 'src/main.tsx'],
      reporter: ['text', 'html'],
    },
  },
});
