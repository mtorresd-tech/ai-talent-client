import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { GebThemeProvider } from '@geb/ui';

/**
 * Envuelve el árbol en `GebThemeProvider`: los componentes de `@geb/ui` que
 * leen tokens propios del theme corporativo (`theme.palette.status`, por
 * ejemplo `GebStatusChip`) los necesitan disponibles incluso en pruebas que no
 * montan la aplicación completa.
 */
export function renderConTema(ui: ReactElement): RenderResult {
  return render(
    <GebThemeProvider>
      {/* `@geb/ui` está compilado contra los tipos de React 18; su prop
          `children: ReactNode` choca de identidad con el `ReactNode` de
          React 19 de este repo, no es un error real. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {ui as any}
    </GebThemeProvider>,
  );
}
