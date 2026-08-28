import { GebErrorState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';

export interface EstadoErrorProps {
  error: ApiError;
  onReintentar?: () => void;
}

/**
 * Adapta un `ApiError` de `@geb/api-client` a las props del `GebErrorState`
 * del design system: título del Problem Details, detalle e id de correlación
 * para soporte.
 */
export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <GebErrorState
      titulo={error.problem.title}
      descripcion={error.problem.detail}
      idCorrelacion={error.idCorrelacion ?? error.problem.idCorrelacion}
      onReintentar={onReintentar}
    />
  );
}
