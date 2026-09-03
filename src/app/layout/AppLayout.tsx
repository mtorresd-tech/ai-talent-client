import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GebAppLayout, type GebNavItem } from '@geb/ui';
import { useAuth } from '@geb/auth';
import { ROL_ADMINISTRADOR, ROL_LIDER, ROL_RECLUTADOR } from '../../shared/tipos/dominio';

/**
 * Navegación real de ambos portales: Reclutador ve Procesos/Métricas/
 * Notificaciones; Líder ve Procesos/Notificaciones. "Procesos" es una sola
 * entrada compartida — la pantalla que renderiza depende del rol (ver
 * features/procesos/paginas/PaginaProcesos.tsx).
 */
const navegacion: GebNavItem[] = [
  { etiqueta: 'Procesos', ruta: '/procesos', roles: [ROL_RECLUTADOR, ROL_LIDER] },
  { etiqueta: 'Métricas', ruta: '/metricas', roles: [ROL_RECLUTADOR] },
  { etiqueta: 'Notificaciones', ruta: '/notificaciones', roles: [ROL_RECLUTADOR, ROL_LIDER] },
  { etiqueta: 'Configuración', ruta: '/configuracion', roles: [ROL_ADMINISTRADOR] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  // El sidebar resalta la entrada cuya `ruta` coincide con `rutaActual`; las
  // subpáginas (p. ej. `/procesos/candidato/:id`) se normalizan a su sección
  // base para que la entrada del sidebar siga activa.
  const rutaActual = location.pathname.startsWith('/procesos') ? '/procesos' : location.pathname;

  return (
    <GebAppLayout
      tituloApp="IA Talento"
      navegacion={navegacion}
      usuario={
        usuario
          ? { nombre: usuario.nombre, tenant: usuario.tenant, roles: usuario.roles }
          : undefined
      }
      onLogout={() => void logout()}
      rutaActual={rutaActual}
      onNavegar={(ruta) => navigate(ruta)}
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
