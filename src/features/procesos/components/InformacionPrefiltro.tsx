import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { Prefiltro } from '../api/prefiltro';

export interface InformacionPrefiltroProps {
  prefiltro: Prefiltro | null;
  cargando?: boolean;
  /**
   * Envuelve el contenido en una tarjeta con borde (por defecto). En `false` se
   * renderiza plano, para anidarlo dentro de otra tarjeta que ya aporta el
   * marco y el encabezado.
   */
  conBorde?: boolean;
}

const formateadorCop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function textoBooleano(valor: boolean | null): string | null {
  if (valor === null) return null;
  return valor ? 'Sí' : 'No';
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor}</Typography>
    </Box>
  );
}

/** Región "Información del prefiltro": datos de la llamada previa a la anonimización. */
export function InformacionPrefiltro({
  prefiltro,
  cargando,
  conBorde = true,
}: InformacionPrefiltroProps) {
  if (cargando && !prefiltro) {
    return <Skeleton variant="rounded" height={180} />;
  }

  if (!prefiltro) {
    return (
      <GebEmptyState
        titulo="Sin prefiltro"
        descripcion="Aún no se ha diligenciado el prefiltro telefónico de este candidato."
      />
    );
  }

  return (
    <Box
      sx={{
        ...(conBorde
          ? { border: '1px solid', borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 2.5 } }
          : {}),
        minWidth: 0,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Información del prefiltro
      </Typography>
      <Stack spacing={1.25} sx={{ mt: 1.5 }}>
        <Fila
          etiqueta="Aspiración salarial"
          valor={
            prefiltro.aspiracionSalarial === null
              ? null
              : formateadorCop.format(prefiltro.aspiracionSalarial)
          }
        />
        <Fila etiqueta="Disponibilidad" valor={prefiltro.disponibilidad} />
        <Fila etiqueta="Desempeño del último año" valor={prefiltro.desempenoUltimoAnio} />
        <Fila etiqueta="Interés en continuar" valor={textoBooleano(prefiltro.interesContinuidad)} />
        <Fila etiqueta="Cumple el perfil" valor={textoBooleano(prefiltro.cumplePerfil)} />
        <Fila etiqueta="Tiempo de vinculación" valor={prefiltro.tiempoVinculacion} />
        <Fila
          etiqueta="Sancionado en el último año"
          valor={textoBooleano(prefiltro.sancionadoUltimoAnio)}
        />
        <Fila
          etiqueta="Promovido en el último año"
          valor={textoBooleano(prefiltro.promovidoUltimoAnio)}
        />
        <Fila etiqueta="Observaciones" valor={prefiltro.observaciones} />
      </Stack>
    </Box>
  );
}
