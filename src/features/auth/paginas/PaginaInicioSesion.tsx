import { useAuth } from '@geb/auth';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { LayoutAutenticacion } from '../components/LayoutAutenticacion';
import { FormularioAccesoReal } from '../components/FormularioAccesoReal';
import { FormularioAccesoDesarrollo } from '../components/FormularioAccesoDesarrollo';

export function PaginaInicioSesion() {
  const { estado, login } = useAuth();
  const devAuth = useDevAuth();

  return (
    <LayoutAutenticacion>
      {devAuth ? (
        <FormularioAccesoDesarrollo />
      ) : (
        <FormularioAccesoReal estado={estado} onIniciarSesion={() => void login()} />
      )}
    </LayoutAutenticacion>
  );
}
