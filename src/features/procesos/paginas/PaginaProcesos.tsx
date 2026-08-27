import { useAuth } from '@geb/auth';
import { ROL_LIDER } from '../../../shared/tipos/dominio';
import { PaginaProcesosReclutador } from './PaginaProcesosReclutador';
import { PaginaProcesosLider } from './PaginaProcesosLider';

/**
 * "Procesos" es una sola entrada de sidebar en ambos portales, pero cada rol
 * ve una pantalla distinta — reclutador y líder son experiencias separadas,
 * no una pantalla compartida con el mismo contenido.
 */
export function PaginaProcesos() {
  const { usuario } = useAuth();
  const esLider = usuario?.roles.includes(ROL_LIDER) ?? false;

  return esLider ? <PaginaProcesosLider /> : <PaginaProcesosReclutador />;
}
