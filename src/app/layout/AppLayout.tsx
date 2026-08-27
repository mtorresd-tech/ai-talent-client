import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GebAppLayout, type GebNavItem } from '@geb/ui';
import { useAuth } from '@geb/auth';
import { ROL_ADMINISTRADOR, ROL_LIDER, ROL_RECLUTADOR } from '../../shared/tipos/dominio';

/**
 * Navegación de ambos portales en un solo árbol: `GebAppLayout` filtra cada
 * entrada por `roles` contra el usuario autenticado.
 */
const navegacion: GebNavItem[] = [
  { etiqueta: 'Vacantes', ruta: '/vacantes', roles: [ROL_RECLUTADOR] },
  { etiqueta: 'Bandeja de aprobaciones', ruta: '/bandejas/RANKING', roles: [ROL_RECLUTADOR] },
  { etiqueta: 'Informes incógnitos', ruta: '/lider/informes', roles: [ROL_LIDER] },
  { etiqueta: 'Historial', ruta: '/lider/historial', roles: [ROL_LIDER] },
  { etiqueta: 'Configuración', ruta: '/configuracion', roles: [ROL_ADMINISTRADOR] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

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
      rutaActual={location.pathname}
      onNavegar={(ruta) => navigate(ruta)}
    >
      {/* @geb/ui está buildeado contra @types/react 18; el `as any` evita el
          choque de identidad de tipos con la 19 de este repo — son dos
          `ReactNode` estructuralmente distintos para TS (ver riesgo conocido
          en la skill geb-lib), no un error real de tipos. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </GebAppLayout>
  );
}
