import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * `@geb/*` está enlazado con `link:` desde otro repo que trae su propia copia
 * de react/@mui/material/@emotion. Sin este alias, la resolución de módulos
 * carga DOS copias de React y el árbol revienta al montar en las pruebas
 * ("A React Element from an older version of React was rendered"). Se fuerza
 * que todo resuelva contra las copias de este repo, igual que en la config de
 * build. TODO: reevaluar/quitar este alias si la librería enlazada sube sus
 * peers (react/@mui/material/@emotion) a las mismas versiones que este repo.
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
  },
});
