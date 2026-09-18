import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { type GebColumna } from '@geb/ui';
import type { InformeIncognito } from '../api/bandejas';
import { formatearFecha } from '../logica/formatoFecha';
import { AvatarIniciales } from './AvatarIniciales';

/*
 * `@geb/ui` está compilado contra los tipos de React 18; sus `render` de
 * columna devuelven un `ReactNode` que TS ve como distinto del de React 19 de
 * este repo. El cast agrupa las columnas — es una diferencia de identidad de
 * tipos, no un error real.
 */
const comoColumnas = (columnas: unknown): readonly GebColumna<InformeIncognito>[] =>
  columnas as readonly GebColumna<InformeIncognito>[];

/** Marca de celda sin dato. */
const SIN_DATO = '—';

export interface ParametrosColumnasTablaInformesIncognito {
  onVerInforme: (informe: InformeIncognito) => void;
}

/**
 * Columnas de la tabla de informes anonimizados: alias del candidato, fecha de
 * generación, competencias y la acción de abrir el informe en el modal. El
 * resto del detalle (experiencia, nivel académico y afinidad IA) vive dentro
 * del modal.
 */
export function construirColumnasTablaInformesIncognito({
  onVerInforme,
}: ParametrosColumnasTablaInformesIncognito): readonly GebColumna<InformeIncognito>[] {
  return comoColumnas([
    {
      campo: 'alias',
      titulo: 'Candidato',
      render: (fila: InformeIncognito) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AvatarIniciales nombre={fila.alias} tamano={32} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {fila.alias}
          </Typography>
        </Box>
      ),
    },
    {
      campo: 'generadoEn',
      titulo: 'Generado',
      render: (fila: InformeIncognito) => formatearFecha(fila.generadoEn),
    },
    {
      campo: 'competencias',
      titulo: 'Competencias',
      render: (fila: InformeIncognito) => {
        const competencias = fila.competencias ?? [];
        if (competencias.length === 0) return SIN_DATO;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {competencias.map((competencia) => (
              <Chip key={competencia} size="small" label={competencia} />
            ))}
          </Box>
        );
      },
    },
    {
      campo: 'desgloseAfinidad',
      titulo: '',
      ancho: 56,
      render: (fila: InformeIncognito) => (
        <Tooltip title={`Ver informe de ${fila.alias}`}>
          <IconButton
            size="small"
            aria-label={`Ver informe de ${fila.alias}`}
            onClick={(evento) => {
              evento.stopPropagation();
              onVerInforme(fila);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]);
}
