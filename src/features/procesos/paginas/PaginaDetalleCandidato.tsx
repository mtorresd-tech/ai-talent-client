import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import { useClienteApi } from '../../../shared/api/clienteApi';
import { nombreCandidato } from '../logica/candidato';
import { useDetalleCandidato } from '../hooks/useDetalleCandidato';
import { useDetalleVacante } from '../hooks/useDetalleVacante';
import { useHistorialCandidato } from '../hooks/useHistorialCandidato';
import { usePrefiltroCandidato } from '../hooks/usePrefiltroCandidato';
import { usePipelineVacante } from '../hooks/usePipelineVacante';
import { useCatalogoEstados } from '../hooks/useCatalogoEstados';
import { useContextoOrigen } from '../hooks/useContextoOrigen';
import { EstadoError } from '../components/EstadoError';
import { MigasDetalleCandidato } from '../components/MigasDetalleCandidato';
import { LayoutDetalleCandidato } from '../components/LayoutDetalleCandidato';
import { TarjetaPerfilCandidato } from '../components/TarjetaPerfilCandidato';
import { TarjetaMatchIa } from '../components/TarjetaMatchIa';
import { InformacionPrefiltro } from '../components/InformacionPrefiltro';
import { LineaTiempoProceso } from '../components/LineaTiempoProceso';
import { EmbudoProceso } from '../components/EmbudoProceso';
import { SeguimientoTerceros } from '../components/SeguimientoTerceros';

const URL_PROCESOS = '/procesos';

/**
 * Subpágina de detalle del candidato del portal Reclutador. Orquesta la carga
 * independiente de cada región (perfil, match, prefiltro, línea de tiempo,
 * embudo, evaluaciones de terceros): una falla no tumba el resto. Muestra un
 * mensaje dedicado si el candidato no existe (404) y un error a pantalla
 * completa con reintento si la carga principal falla por otro motivo.
 */
export function PaginaDetalleCandidato() {
  const clienteApi = useClienteApi();
  const { jobApplicationId = null } = useParams<{ jobApplicationId: string }>();

  const candidato = useDetalleCandidato(clienteApi, jobApplicationId);
  const contexto = useContextoOrigen(candidato.datos);

  const vacante = useDetalleVacante(clienteApi, contexto.jobRequisitionId);
  const historial = useHistorialCandidato(clienteApi, jobApplicationId);
  const prefiltro = usePrefiltroCandidato(clienteApi, jobApplicationId);
  const pipeline = usePipelineVacante(clienteApi, contexto.jobRequisitionId);
  const catalogo = useCatalogoEstados(clienteApi);

  const contenedor = { minWidth: 0, contain: 'inline-size' as const };

  if (candidato.error?.problem.status === 404) {
    return (
      <Stack spacing={2} sx={contenedor}>
        <GebEmptyState
          titulo="No encontramos este candidato"
          descripcion="El candidato que intentas abrir no existe o ya no está disponible."
        />
        <Box>
          <Link component={RouterLink} to={URL_PROCESOS} underline="hover">
            Volver a Procesos
          </Link>
        </Box>
      </Stack>
    );
  }

  if (candidato.error) {
    return (
      <Box sx={contenedor}>
        <EstadoError error={candidato.error} onReintentar={candidato.recargar} />
      </Box>
    );
  }

  const nombre = candidato.datos ? nombreCandidato(candidato.datos) : 'Candidato';

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={contenedor}>
      <MigasDetalleCandidato nombre={nombre} urlVolver={contexto.urlVolver} />

      {!candidato.datos && candidato.cargando ? (
        <Skeleton variant="rounded" height={320} />
      ) : (
        <LayoutDetalleCandidato
          izquierda={
            <Stack spacing={2}>
              <TarjetaPerfilCandidato
                candidato={candidato.datos}
                catalogo={catalogo.datos}
                tituloVacante={vacante.datos?.titulo ?? null}
                cargando={candidato.cargando}
              />
              <TarjetaMatchIa
                desglose={candidato.datos?.desgloseAfinidad ?? null}
                scoreAfinidad={candidato.datos?.scoreAfinidad ?? null}
                cargando={candidato.cargando}
              />
              <InformacionPrefiltro prefiltro={prefiltro.datos} cargando={prefiltro.cargando} />
            </Stack>
          }
          derecha={
            <Stack spacing={3}>
              <LineaTiempoProceso
                historial={historial.datos}
                catalogo={catalogo.datos}
                cargando={historial.cargando}
                error={historial.error}
                onReintentar={historial.recargar}
              />
              <EmbudoProceso etapas={pipeline.datos} claveEtapaOrigen={contexto.claveEtapa} />
              <SeguimientoTerceros integraciones={candidato.datos?.integraciones ?? []} />
            </Stack>
          }
        />
      )}
    </Stack>
  );
}
