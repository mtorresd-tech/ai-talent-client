export * from './api/integracionesApi';
export type { ResultadoBluesite } from './bluesite/tipos';
export type { ResultadoCosinte } from './cosinte/tipos';
export type { ResultadoMedilaboral } from './medilaboral/tipos';

export {
  etiquetaSubestado,
  colorSubestado,
  type ColorSubestado,
} from './logica/etiquetasSubestado';
export { formatearFechaHora, SIN_FECHA } from './logica/formatoFecha';
export { nombreProveedor } from './logica/nombreProveedor';

export { BadgeSubestado, type BadgeSubestadoProps } from './components/BadgeSubestado';
export { TarjetaProveedor, type TarjetaProveedorProps } from './components/TarjetaProveedor';

export { parsearResultadoBluesite } from './bluesite/parseoResultado';
export { parsearResultadoCosinte } from './cosinte/parseoResultado';
export { parsearResultadoMedilaboral } from './medilaboral/parseoResultado';

export {
  DetalleResultadoBluesite,
  type DetalleResultadoBluesiteProps,
} from './bluesite/DetalleResultadoBluesite';
export {
  DetalleResultadoCosinte,
  type DetalleResultadoCosinteProps,
} from './cosinte/DetalleResultadoCosinte';
export {
  DetalleResultadoMedilaboral,
  type DetalleResultadoMedilaboralProps,
} from './medilaboral/DetalleResultadoMedilaboral';
