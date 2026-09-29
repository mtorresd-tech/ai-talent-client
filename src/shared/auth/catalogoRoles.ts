import { definirCatalogoRoles } from '@geb/auth';
import { ROL_LIDER, ROL_RECLUTADOR } from '../tipos/dominio';

/**
 * Catálogo de roles de aplicación de IA Talento para `@geb/auth`: los claims
 * `roles` del token de Entra ID se filtran a este conjunto antes de llegar a
 * `useAuth().usuario.roles`, y `etiqueta()` resuelve el nombre legible para
 * UI. Referencia estable (constante de módulo), pasada a `GebAuthProvider`.
 */
export const CATALOGO_ROLES_IA_TALENTO = definirCatalogoRoles({
  [ROL_RECLUTADOR]: 'Reclutador',
  [ROL_LIDER]: 'Líder de área',
});
