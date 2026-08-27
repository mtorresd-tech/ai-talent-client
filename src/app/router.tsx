import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, RequireRole } from '@geb/auth';
import { AppLayout } from './layout/AppLayout';
import { PaginaInicioSesion } from '../features/auth';
import { PaginaListaVacantes, PaginaDetalleVacante } from '../features/vacantes';
import { PaginaDetalleCandidato } from '../features/candidatos';
import { PaginaPrefiltro } from '../features/prefiltro';
import { PaginaIntegraciones } from '../features/integraciones';
import { PaginaCalificarEntrevista } from '../features/entrevistas';
import { PaginaOferta } from '../features/oferta';
import { PaginaBandeja, PaginaInformesIncognito, PaginaHistorialLider } from '../features/bandejas';
import { PaginaConfiguracion } from '../features/configuracion';
import { ROL_ADMINISTRADOR, ROL_LIDER } from '../shared/tipos/dominio';

export function AppRouter() {
  const { estado } = useAuth();

  // TODO: pantalla de carga dedicada (@geb/ui no tiene una por defecto).
  if (estado === 'cargando') return null;

  if (estado !== 'autenticado') {
    return <PaginaInicioSesion />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/vacantes" replace />} />

        {/* Portal reclutador */}
        <Route path="/vacantes" element={<PaginaListaVacantes />} />
        <Route path="/vacantes/:jobRequisitionId" element={<PaginaDetalleVacante />} />
        <Route path="/vacantes/:jobRequisitionId/integraciones" element={<PaginaIntegraciones />} />
        <Route path="/candidatos/:jobApplicationId" element={<PaginaDetalleCandidato />} />
        <Route path="/candidatos/:jobApplicationId/prefiltro" element={<PaginaPrefiltro />} />
        <Route path="/candidatos/:jobApplicationId/oferta" element={<PaginaOferta />} />
        <Route
          path="/candidatos/:jobApplicationId/entrevistas/:tipo"
          element={<PaginaCalificarEntrevista />}
        />
        <Route path="/bandejas/:compuerta" element={<PaginaBandeja />} />

        {/* Portal líder */}
        <Route
          path="/lider/informes"
          element={
            <RequireRole roles={[ROL_LIDER]}>
              <PaginaInformesIncognito />
            </RequireRole>
          }
        />
        <Route
          path="/lider/historial"
          element={
            <RequireRole roles={[ROL_LIDER]}>
              <PaginaHistorialLider />
            </RequireRole>
          }
        />

        {/* Administración */}
        <Route
          path="/configuracion"
          element={
            <RequireRole roles={[ROL_ADMINISTRADOR]}>
              <PaginaConfiguracion />
            </RequireRole>
          }
        />
      </Routes>
    </AppLayout>
  );
}
