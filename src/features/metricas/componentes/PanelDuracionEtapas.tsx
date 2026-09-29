import type { ApiError } from '@geb/api-client';
import { GebDataTable, type GebColumna } from '@geb/ui';
import type { DuracionEtapa } from '../api/metricas';
import { EstadoError } from '../../procesos/components/EstadoError';

export interface PanelDuracionEtapasProps {
  datos: DuracionEtapa[] | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

const COLUMNAS: GebColumna<DuracionEtapa>[] = [
  { campo: 'nombre', titulo: 'Etapa' },
  { campo: 'promedioDias', titulo: 'Promedio (días)' },
  { campo: 'medianaDias', titulo: 'Mediana (días)' },
  {
    campo: 'porcentajeDelTotal',
    titulo: '% del tiempo total del proceso',
    render: (fila) => `${fila.porcentajeDelTotal}%`,
  },
];

/** Tabla de 6 filas fijas con la duración de cada etapa del pipeline, sin ordenar ni paginar. */
export function PanelDuracionEtapas({
  datos,
  cargando,
  error,
  onReintentar,
}: PanelDuracionEtapasProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  return (
    <GebDataTable
      columnas={COLUMNAS}
      filas={datos ?? []}
      obtenerId={(fila) => fila.clave}
      cargando={cargando}
    />
  );
}
