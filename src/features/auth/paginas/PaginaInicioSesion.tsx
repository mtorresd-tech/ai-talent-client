import { useAuth } from '@geb/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { guardarRutaDestino } from '../../../shared/auth/rutaDestinoLogin';
import { LayoutAutenticacion } from '../components/LayoutAutenticacion';
import { FormularioAccesoReal } from '../components/FormularioAccesoReal';
import { FormularioAccesoDesarrollo } from '../components/FormularioAccesoDesarrollo';

export function PaginaInicioSesion() {
  const { estado, login } = useAuth();
  const devAuth = useDevAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Antes de disparar `loginRedirect()` (vía `login()`), se guarda la ruta
  // profunda actual y se navega a "/" por dentro de React Router: así, el
  // punto de retorno que MSAL captura de `window.location.href` es siempre
  // "/" (una ruta que el hosting sabe servir), nunca la ruta profunda
  // original — `AppRouter` restaura esa ruta guardada tras autenticar.
  const alIniciarSesion = () => {
    const rutaActual = `${location.pathname}${location.search}`;
    if (rutaActual !== '/') {
      guardarRutaDestino(rutaActual);
      navigate('/');
    }
    void login();
  };

  return (
    <LayoutAutenticacion>
      {devAuth ? (
        <FormularioAccesoDesarrollo />
      ) : (
        <FormularioAccesoReal estado={estado} onIniciarSesion={alIniciarSesion} />
      )}
    </LayoutAutenticacion>
  );
}
