import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * `@geb/*` está enlazado con `link:` desde `geb-frontend-libs` (otro repo con
 * su propia copia de react/@mui/material/@emotion). Sin este alias, Vite
 * resuelve esos paquetes por archivo de origen y termina cargando DOS copias
 * de React — el árbol revienta al montar ("A React Element from an older
 * version of React was rendered"). Forzamos que todo resuelva contra las
 * copias de este repo. TODO: reevaluar si `geb-frontend-libs` sube sus
 * peers a las mismas versiones (ver riesgo conocido en la skill geb-lib).
 */
const forzarCopiaLocal = [
  'react',
  'react-dom',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
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
