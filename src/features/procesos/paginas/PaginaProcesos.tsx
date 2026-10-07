import { usePortalActivo } from '../../../shared/auth/PortalActivoContext';
import { PaginaProcesosReclutador } from './PaginaProcesosReclutador';
import { PaginaProcesosLider } from './PaginaProcesosLider';

/**
 * "Procesos" es una sola entrada de sidebar en ambos portales, pero cada
 * portal ve una pantalla distinta — reclutador y líder son experiencias
 * separadas, no una pantalla compartida con el mismo contenido.
 */
export function PaginaProcesos() {
  const { portalActivo } = usePortalActivo();

  return portalActivo === 'LIDER' ? <PaginaProcesosLider /> : <PaginaProcesosReclutador />;
}
