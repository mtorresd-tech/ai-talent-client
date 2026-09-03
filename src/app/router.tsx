import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, RequireRole } from '@geb/auth';
import { AppLayout } from './layout/AppLayout';
import { PaginaInicioSesion } from '../features/auth';
import { PaginaProcesos, PaginaDetalleCandidato } from '../features/procesos';
import { PaginaMetricas } from '../features/metricas';
import { PaginaNotificaciones } from '../features/notificaciones';
import { PaginaConfiguracion } from '../features/configuracion';
import { ROL_ADMINISTRADOR, ROL_RECLUTADOR } from '../shared/tipos/dominio';

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
        <Route path="/" element={<Navigate to="/procesos" replace />} />
        <Route path="/procesos" element={<PaginaProcesos />} />
        <Route
          path="/procesos/candidato/:jobApplicationId"
          element={
            <RequireRole roles={[ROL_RECLUTADOR]}>
              <PaginaDetalleCandidato />
            </RequireRole>
          }
        />
        <Route
          path="/metricas"
          element={
            <RequireRole roles={[ROL_RECLUTADOR]}>
              <PaginaMetricas />
            </RequireRole>
          }
        />
        <Route path="/notificaciones" element={<PaginaNotificaciones />} />
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
