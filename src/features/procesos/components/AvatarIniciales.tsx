import Avatar from '@mui/material/Avatar';
import { calcularIniciales } from '../logica/candidato';

export interface AvatarInicialesProps {
  nombre: string;
  tamano?: number;
}

/** Avatar con iniciales sobre el gradiente de marca. */
export function AvatarIniciales({ nombre, tamano = 40 }: AvatarInicialesProps) {
  return (
    <Avatar
      sx={{
        width: tamano,
        height: tamano,
        fontSize: tamano * 0.38,
        fontWeight: 600,
        background: 'linear-gradient(135deg, #0b1a33, #16305c)',
        color: '#fff',
      }}
    >
      {calcularIniciales(nombre)}
    </Avatar>
  );
}
