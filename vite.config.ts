import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fuerza que react/@mui/material/@emotion/react-hook-form resuelvan contra
 * las copias de este repo, para no cargar dos copias de React por el `link:`
 * de `@geb/*`. `react-hook-form` se agrega por el mismo motivo que React: es
 * peer dependency de `@geb/forms`, que al estar enlazado con `link:` resuelve
 * sus propias copias de desarrollo (React 18) si no se fuerza aquí — se
 * manifiesta como `Cannot read properties of null (reading 'useRef')` al
 * montar cualquier formulario de `@geb/forms`. TODO: quitar cuando
 * `geb-frontend-libs` suba sus peers a las mismas versiones que este repo.
 */
const forzarCopiaLocal = [
  'react',
  'react-dom',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
  'react-hook-form',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: forzarCopiaLocal,
    alias: Object.fromEntries(
      forzarCopiaLocal.map((paquete) => [paquete, path.resolve(dirname, 'node_modules', paquete)]),
    ),
  },
});
