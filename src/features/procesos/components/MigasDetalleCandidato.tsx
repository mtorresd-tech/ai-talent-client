import { Link as RouterLink } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export interface MigasDetalleCandidatoProps {
  /** Nombre visible del candidato (o alias). */
  nombre: string;
  /** Ruta de retorno a Procesos con la selección restaurada. */
  urlVolver: string;
}

/** Breadcrumb `Procesos › {candidato}`; "Procesos" vuelve al listado del proceso. */
export function MigasDetalleCandidato({ nombre, urlVolver }: MigasDetalleCandidatoProps) {
  return (
    <Breadcrumbs aria-label="Ruta de navegación" sx={{ minWidth: 0 }}>
      <Link component={RouterLink} to={urlVolver} underline="hover" color="inherit">
        Procesos
      </Link>
      <Typography color="text.primary" noWrap sx={{ maxWidth: { xs: 200, sm: 360 } }}>
        {nombre}
      </Typography>
    </Breadcrumbs>
  );
}
