import { GebEmptyState } from '@geb/ui';

export interface PasoEnConstruccionProps {
  /** Nombre de la etapa o sub-paso, para el texto del placeholder. */
  nombre?: string;
}

/**
 * Placeholder navegable para los pasos del pipeline que aún no operan
 * (Anonimización, Bluesite, Cosinte, Medilaboral, Oferta). No carga datos ni
 * expone acciones.
 */
export function PasoEnConstruccion({ nombre }: PasoEnConstruccionProps) {
  return (
    <GebEmptyState
      titulo={nombre ? `${nombre}: en construcción` : 'En construcción'}
      descripcion="Este paso todavía no está disponible. Puedes navegarlo, pero aún no muestra información ni permite acciones."
    />
  );
}
