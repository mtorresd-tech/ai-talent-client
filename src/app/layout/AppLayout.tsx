import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { GebAppLayout, type GebNavItem } from '@geb/ui';
import { useAuth } from '@geb/auth';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../shared/tipos/dominio';
import { CATALOGO_ROLES_IA_TALENTO } from '../../shared/auth/catalogoRoles';
import { useClienteApi } from '../../shared/api/clienteApi';
import { useContadorNoLeidas } from '../../features/notificaciones/hooks/useContadorNoLeidas';

/**
 * Navegación real de ambos portales: Reclutador ve Procesos/Métricas/
 * Notificaciones; Líder ve Procesos/Notificaciones. "Procesos" es una sola
 * entrada compartida — la pantalla que renderiza depende del rol (ver
 * features/procesos/paginas/PaginaProcesos.tsx).
 */
const navegacion: GebNavItem[] = [
  {
    etiqueta: 'Procesos',
    ruta: '/procesos',
    roles: [ROL_RECLUTADOR, ROL_LIDER],
    icono: <AssignmentOutlinedIcon />,
  },
  {
    etiqueta: 'Métricas',
    ruta: '/metricas',
    roles: [ROL_RECLUTADOR],
    icono: <BarChartOutlinedIcon />,
  },
  {
    etiqueta: 'Notificaciones',
    ruta: '/notificaciones',
    roles: [ROL_RECLUTADOR, ROL_LIDER],
    icono: <NotificationsOutlinedIcon />,
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const clienteApi = useClienteApi();
  const contador = useContadorNoLeidas(clienteApi);

  // El sidebar resalta la entrada cuya `ruta` coincide con `rutaActual`; las
  // subpáginas (p. ej. `/procesos/candidato/:id`) se normalizan a su sección
  // base para que la entrada del sidebar siga activa.
  const rutaActual = location.pathname.startsWith('/procesos') ? '/procesos' : location.pathname;

  // `AppLayout` y `PaginaNotificaciones` son hermanos en el árbol: refrescar
  // el contador en cada cambio de ruta cubre el caso real de uso (el usuario
  // marca notificaciones como leídas y navega a otra sección) sin necesidad
  // de levantar estado compartido entre ambos. Se omite la primera ejecución
  // (montaje) porque `useContadorNoLeidas` ya consulta una vez por su cuenta.
  const montado = useRef(false);
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    contador.recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <GebAppLayout
      tituloApp="IA Talento"
      mostrarTituloApp={false}
      logo={
        <Box
          role="img"
          aria-label="Grupo Energía Bogotá"
          sx={{
            // `logo_geb.png` (1104x735) trae bastante margen transparente
            // alrededor de la marca real; se recorta por CSS (fondo + tamaño
            // y posición ajustados) para que el logo se vea a un tamaño
            // legible en la navbar en vez del PNG completo (que lo dejaba
            // diminuto).
            width: 99,
            height: 50,
            backgroundImage: 'url(/logo_geb.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '133.65px 88.98px',
            backgroundPosition: '-11.62px -23.61px',
          }}
        />
      }
      navegacion={navegacion}
      usuario={
        usuario
          ? {
              nombre: usuario.nombre,
              tenant: usuario.tenant,
              rol: usuario.roles[0]
                ? CATALOGO_ROLES_IA_TALENTO.etiqueta(usuario.roles[0])
                : undefined,
              roles: usuario.roles,
            }
          : undefined
      }
      onLogout={() => void logout()}
      rutaActual={rutaActual}
      onNavegar={(ruta) => navigate(ruta)}
      onNotificaciones={() => navigate('/notificaciones')}
      notificacionesSinLeer={contador.cantidad}
    >
      {/* @geb/ui está buildeado contra @types/react 18; el `as any` evita el
          choque de identidad de tipos con la 19 de este repo — son dos
          `ReactNode` estructuralmente distintos para TS, no un error real de
          tipos. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </GebAppLayout>
  );
}
