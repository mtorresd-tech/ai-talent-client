import type { EstudioInforme } from '../api/bandejas';

export type GrupoNivelAcademico = 'PREGRADO' | 'POSTGRADO' | 'DIPLOMADO';

const PALABRAS_POSTGRADO = ['especializ', 'maestr', 'magister', 'doctor'];
const PALABRAS_DIPLOMADO = ['diplomado', 'curso', 'certificac'];

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Grupo de nivel académico según palabras clave de `nivelAcademico` y
 * `nombreEstudio` combinados: contiene alguna de
 * `especializ`/`maestr`/`magister`/`doctor` clasifica como `POSTGRADO`;
 * `diplomado`/`curso`/`certificac` como `DIPLOMADO`; cualquier otro valor cae
 * en `PREGRADO` (grupo por defecto).
 */
export function grupoDeNivelAcademico(
  nivelAcademico: string,
  nombreEstudio?: string | null,
): GrupoNivelAcademico {
  const texto = sinTildes(`${nivelAcademico} ${nombreEstudio ?? ''}`.toLowerCase());
  if (PALABRAS_POSTGRADO.some((palabra) => texto.includes(palabra))) return 'POSTGRADO';
  if (PALABRAS_DIPLOMADO.some((palabra) => texto.includes(palabra))) return 'DIPLOMADO';
  return 'PREGRADO';
}

export interface GrupoEstudios {
  grupo: GrupoNivelAcademico;
  titulo: string;
  estudios: EstudioInforme[];
}

const TITULO_POR_GRUPO: Record<GrupoNivelAcademico, string> = {
  PREGRADO: 'Profesión / pregrado',
  POSTGRADO: 'Postgrados',
  DIPLOMADO: 'Diplomados',
};

const ORDEN_GRUPOS: GrupoNivelAcademico[] = ['PREGRADO', 'POSTGRADO', 'DIPLOMADO'];

/**
 * Agrupa `estudios[]` en "Profesión / pregrado", "Postgrados" y "Diplomados"
 * según `grupoDeNivelAcademico`. Solo devuelve los grupos con al menos un
 * estudio, en el orden fijo de `ORDEN_GRUPOS`. El encabezado agrupa, no
 * reemplaza: cada `EstudioInforme` dentro del grupo conserva su
 * `nivelAcademico`/`nombreEstudio`/`institucion` reales tal como llegaron.
 */
export function agrupaEstudios(estudios: EstudioInforme[]): GrupoEstudios[] {
  const porGrupo = new Map<GrupoNivelAcademico, EstudioInforme[]>();
  for (const estudio of estudios) {
    const grupo = grupoDeNivelAcademico(estudio.nivelAcademico, estudio.nombreEstudio);
    const lista = porGrupo.get(grupo) ?? [];
    lista.push(estudio);
    porGrupo.set(grupo, lista);
  }

  return ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    titulo: TITULO_POR_GRUPO[grupo],
    estudios: porGrupo.get(grupo) ?? [],
  })).filter((item) => item.estudios.length > 0);
}
