import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth, RequireRole, hasAnyRole } from '@geb/auth';
import { AppLayout } from './layout/AppLayout';
import { PaginaInicioSesion, PantallaCargaSesion, PaginaSinAcceso } from '../features/auth';
import { PaginaProcesos, PaginaDetalleCandidato } from '../features/procesos';
import { PaginaMetricas } from '../features/metricas';
import { PaginaNotificaciones } from '../features/notificaciones';
import { ROL_LIDER, ROL_RECLUTADOR } from '../shared/tipos/dominio';
import { useSesionApi } from '../shared/auth/SesionApiContext';
import { leerYLimpiarRutaDestino } from '../shared/auth/rutaDestinoLogin';

export function AppRouter() {
  const { estado, usuario } = useAuth();
  const { sesionSinRol } = useSesionApi();
  const navigate = useNavigate();

  const autenticadoConRol =
    estado === 'autenticado' &&
    hasAnyRole(usuario?.roles, [ROL_RECLUTADOR, ROL_LIDER]) &&
    !sesionSinRol;

  // Restaura, una sola vez, la ruta profunda guardada antes del login (ver
  // `PaginaInicioSesion`) — `leerYLimpiarRutaDestino` es de un solo uso, así
  // que renders posteriores con `autenticadoConRol` en `true` no vuelven a
  // navegar.
  useEffect(() => {
    if (!autenticadoConRol) return;
    const rutaGuardada = leerYLimpiarRutaDestino();
    if (rutaGuardada) {
      navigate(rutaGuardada, { replace: true });
    }
  }, [autenticadoConRol, navigate]);

  if (estado === 'cargando') return <PantallaCargaSesion />;

  if (estado !== 'autenticado') {
    return <PaginaInicioSesion />;
  }

  if (!autenticadoConRol) {
    return <PaginaSinAcceso />;
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
      </Routes>
    </AppLayout>
  );
}
