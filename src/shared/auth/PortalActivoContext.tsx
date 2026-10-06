import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@geb/auth';
import { ROL_LIDER, ROL_RECLUTADOR, type Portal } from '../tipos/dominio';

const CLAVE_PORTAL_ACTIVO = 'selecta:portal-activo';

export interface PortalActivoContextValue {
  /** Portal que gobierna la experiencia actual (navegación visible, vistas de "Procesos"/notificaciones). */
  portalActivo: Portal;
  /** Portales a los que el usuario actual podría cambiar, derivados de `usuario.roles`. */
  portalesDisponibles: Portal[];
  /** `true` solo si el usuario tiene ambos roles y puede alternar de portal. */
  tieneAmbosRoles: boolean;
  /** No tiene efecto si `tieneAmbosRoles` es `false`. */
  cambiarPortal: (portal: Portal) => void;
}

const PortalActivoContext = createContext<PortalActivoContextValue | undefined>(undefined);

function leerPortalGuardado(): Portal | null {
  try {
    const valor = sessionStorage.getItem(CLAVE_PORTAL_ACTIVO);
    return valor === 'RECLUTADOR' || valor === 'LIDER' ? valor : null;
  } catch {
    return null;
  }
}

function escribirPortalGuardado(portal: Portal): void {
  try {
    sessionStorage.setItem(CLAVE_PORTAL_ACTIVO, portal);
  } catch {
    // sessionStorage no disponible (p. ej. incógnito estricto): el portal
    // activo queda solo en memoria para esta sesión de pestaña.
  }
}

function limpiarPortalGuardado(): void {
  try {
    sessionStorage.removeItem(CLAVE_PORTAL_ACTIVO);
  } catch {
    // ver comentario de escribirPortalGuardado.
  }
}

function portalesDeRoles(roles: readonly string[] | undefined): Portal[] {
  const portales: Portal[] = [];
  if (roles?.includes(ROL_RECLUTADOR)) portales.push('RECLUTADOR');
  if (roles?.includes(ROL_LIDER)) portales.push('LIDER');
  return portales;
}

/**
 * Portal inicial para un conjunto de portales disponibles: la preferencia
 * guardada si sigue siendo válida para esos portales, o Reclutador por
 * defecto (Líder si Reclutador no está disponible).
 */
function portalInicial(portalesDisponibles: Portal[]): Portal {
  const guardado = leerPortalGuardado();
  if (guardado && portalesDisponibles.includes(guardado)) return guardado;
  if (portalesDisponibles.includes('RECLUTADOR')) return 'RECLUTADOR';
  return portalesDisponibles[0] ?? 'RECLUTADOR';
}

/**
 * Deriva el portal activo del usuario autenticado y expone el switch entre
 * "portal Reclutador" y "portal Líder" para quienes tienen ambos roles. La
 * preferencia vive en `sessionStorage`, por pestaña, y se limpia al cerrar
 * sesión para que no la herede quien inicie sesión después en la misma
 * pestaña.
 */
export function PortalActivoProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  const portalesDisponibles = useMemo(() => portalesDeRoles(usuario?.roles), [usuario]);
  const tieneAmbosRoles = portalesDisponibles.length === 2;

  const [portalActivo, setPortalActivo] = useState<Portal>(() =>
    portalInicial(portalesDisponibles),
  );

  // Si cambian los portales disponibles (otro usuario inició sesión en la
  // misma pestaña, o sus roles cambiaron) y el portal activo deja de ser
  // válido, se recalcula el default en vez de quedar en un valor inválido.
  // Ajuste de estado durante el render (no un efecto): se compara contra el
  // último valor de `portalesDisponibles` visto, guardado también en estado.
  const [portalesDisponiblesPrevios, setPortalesDisponiblesPrevios] = useState(portalesDisponibles);
  if (portalesDisponiblesPrevios !== portalesDisponibles) {
    setPortalesDisponiblesPrevios(portalesDisponibles);
    if (!portalesDisponibles.includes(portalActivo)) {
      setPortalActivo(portalInicial(portalesDisponibles));
    }
  }

  // Limpia la preferencia solo en una transición real de sesión-activa a
  // sesión-cerrada (logout) — nunca en el primer render, donde `usuario`
  // puede ser `null` de forma transitoria mientras se resuelve la sesión.
  const huboUsuario = useRef(false);
  useEffect(() => {
    if (usuario) {
      huboUsuario.current = true;
      return;
    }
    if (huboUsuario.current) {
      huboUsuario.current = false;
      limpiarPortalGuardado();
    }
  }, [usuario]);

  const value = useMemo<PortalActivoContextValue>(
    () => ({
      portalActivo,
      portalesDisponibles,
      tieneAmbosRoles,
      cambiarPortal: (portal) => {
        if (!tieneAmbosRoles) return;
        setPortalActivo(portal);
        escribirPortalGuardado(portal);
      },
    }),
    [portalActivo, portalesDisponibles, tieneAmbosRoles],
  );

  return <PortalActivoContext.Provider value={value}>{children}</PortalActivoContext.Provider>;
}

// El hook comparte módulo con el contexto y el provider a propósito, para
// mantener el estado de portal activo autocontenido en un solo archivo.
// eslint-disable-next-line react-refresh/only-export-components
export function usePortalActivo(): PortalActivoContextValue {
  const contexto = useContext(PortalActivoContext);
  if (!contexto) {
    throw new Error('usePortalActivo debe usarse dentro de PortalActivoProvider');
  }
  return contexto;
}
