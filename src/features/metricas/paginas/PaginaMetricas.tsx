import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';
import { useClienteApi } from '../../../shared/api/clienteApi';
import type { Compuerta } from '../../../shared/tipos/dominio';
import { useResumenMetricas } from '../hooks/useResumenMetricas';
import { useEmbudoMetricas } from '../hooks/useEmbudoMetricas';
import { useDuracionEtapas } from '../hooks/useDuracionEtapas';
import { useEfectividadEtapa } from '../hooks/useEfectividadEtapa';
import { FiltroRangoFechas } from '../componentes/FiltroRangoFechas';
import { PanelResumen } from '../componentes/PanelResumen';
import { PanelEmbudo } from '../componentes/PanelEmbudo';
import { PanelDuracionEtapas } from '../componentes/PanelDuracionEtapas';
import { PanelEfectividadEtapa } from '../componentes/PanelEfectividadEtapa';

function PanelCard({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
          {titulo}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Panel de métricas del reclutador: cuatro indicadores independientes
 * (Resumen, Embudo temprano de Selecta, Duración de etapas, Efectividad por
 * compuerta), cada uno con su propia carga/error, filtrables por rango de
 * fechas.
 */
export function PaginaMetricas() {
  const clienteApi = useClienteApi();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [etapa, setEtapa] = useState<Compuerta | null>(null);

  const resumen = useResumenMetricas(clienteApi, { desde, hasta });
  const embudo = useEmbudoMetricas(clienteApi, { desde, hasta });
  const duracionEtapas = useDuracionEtapas(clienteApi, { desde, hasta });
  const efectividad = useEfectividadEtapa(clienteApi, { etapa, desde, hasta });

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0, contain: 'inline-size' }}>
      <EncabezadoPagina
        titulo="Métricas"
        subtitulo="Consulta indicadores sobre el desempeño de tus procesos de selección."
      />

      <FiltroRangoFechas
        desde={desde}
        hasta={hasta}
        onCambioDesde={setDesde}
        onCambioHasta={setHasta}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <PanelCard titulo="Resumen">
          <PanelResumen
            datos={resumen.datos}
            cargando={resumen.cargando}
            error={resumen.error}
            onReintentar={resumen.recargar}
          />
        </PanelCard>

        <PanelCard titulo="Embudo temprano de Selecta">
          <PanelEmbudo
            datos={embudo.datos}
            cargando={embudo.cargando}
            error={embudo.error}
            onReintentar={embudo.recargar}
          />
        </PanelCard>

        <PanelCard titulo="Duración de etapas">
          <PanelDuracionEtapas
            datos={duracionEtapas.datos}
            cargando={duracionEtapas.cargando}
            error={duracionEtapas.error}
            onReintentar={duracionEtapas.recargar}
          />
        </PanelCard>

        <PanelCard titulo="Efectividad por compuerta">
          <PanelEfectividadEtapa
            etapa={etapa}
            onCambioEtapa={setEtapa}
            datos={efectividad.datos}
            cargando={efectividad.cargando}
            error={efectividad.error}
            onReintentar={efectividad.recargar}
          />
        </PanelCard>
      </Box>
    </Stack>
  );
}
