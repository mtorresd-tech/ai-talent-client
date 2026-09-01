import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import { FASES_SAP, PASOS_PIPELINE } from '../logica/pipelineReclutador';

export interface RailPipelineProps {
  /** Clave del paso interno activo. */
  pasoActivo: string | null;
  onSeleccionarPaso: (clave: string) => void;
}

const DESPLAZAMIENTO_PX = 320;

/**
 * Rail del pipeline con dos niveles: fases de referencia de SuccessFactors en
 * tarjetas, con los pasos internos de IA Talento anidados como pills
 * navegables. Las fases sin soporte en IA Talento muestran solo una nota. El
 * rail se desplaza en horizontal con flechas.
 */
export function RailPipeline({ pasoActivo, onSeleccionarPaso }: RailPipelineProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [puedeIzquierda, setPuedeIzquierda] = useState(false);
  const [puedeDerecha, setPuedeDerecha] = useState(false);

  const actualizarFlechas = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setPuedeIzquierda(rail.scrollLeft > 2);
    setPuedeDerecha(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2);
  }, []);

  useEffect(() => {
    actualizarFlechas();
    window.addEventListener('resize', actualizarFlechas);
    return () => window.removeEventListener('resize', actualizarFlechas);
  }, [actualizarFlechas]);

  const desplazar = (direccion: -1 | 1) => {
    railRef.current?.scrollBy?.({ left: direccion * DESPLAZAMIENTO_PX, behavior: 'smooth' });
  };

  const indiceActivo = PASOS_PIPELINE.findIndex((paso) => paso.clave === pasoActivo);

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.5 }}>
      <IconButton
        aria-label="Fases anteriores"
        size="small"
        disabled={!puedeIzquierda}
        onClick={() => desplazar(-1)}
        sx={{ alignSelf: 'center' }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box
        ref={railRef}
        onScroll={actualizarFlechas}
        sx={{
          display: 'flex',
          gap: 1.25,
          overflowX: 'auto',
          flex: 1,
          minWidth: 0,
          py: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {FASES_SAP.map((fase, indice) => {
          const indicesPasos = fase.pasos.map((clave) =>
            PASOS_PIPELINE.findIndex((paso) => paso.clave === clave),
          );
          const contieneActivo = fase.pasos.includes(pasoActivo ?? '');
          const faseCompleta =
            indiceActivo >= 0 &&
            indicesPasos.length > 0 &&
            indicesPasos.every((i) => i >= 0 && i < indiceActivo);

          return (
            <Box
              key={fase.clave}
              sx={{
                flex: '1 0 auto',
                minWidth: { xs: 132, sm: 150 },
                maxWidth: 190,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1.5px solid',
                borderStyle: fase.externa ? 'dashed' : 'solid',
                borderColor: contieneActivo ? 'primary.main' : 'divider',
                bgcolor: fase.externa ? 'transparent' : 'background.paper',
                boxShadow: contieneActivo ? 3 : 0,
                p: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1 }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1.5px solid',
                    borderColor: faseCompleta
                      ? 'success.main'
                      : contieneActivo
                        ? 'primary.main'
                        : 'divider',
                    bgcolor: faseCompleta
                      ? 'success.main'
                      : contieneActivo
                        ? 'primary.main'
                        : 'background.default',
                    color:
                      faseCompleta || contieneActivo ? 'primary.contrastText' : 'text.secondary',
                  }}
                >
                  {faseCompleta ? <CheckIcon sx={{ fontSize: 13 }} /> : indice + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: fase.externa ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {fase.nombre}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  justifyContent: 'flex-end',
                }}
              >
                {fase.pasos.length === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', fontStyle: 'italic', lineHeight: 1.3 }}
                  >
                    {fase.nota ?? '—'}
                  </Typography>
                ) : (
                  fase.pasos.map((clave) => {
                    const paso = PASOS_PIPELINE.find((p) => p.clave === clave);
                    if (!paso) return null;
                    const activo = paso.clave === pasoActivo;
                    const indicePaso = PASOS_PIPELINE.findIndex((p) => p.clave === clave);
                    const completado =
                      indiceActivo >= 0 && indicePaso >= 0 && indicePaso < indiceActivo;
                    return (
                      <Box
                        key={paso.clave}
                        component="button"
                        type="button"
                        aria-pressed={activo}
                        onClick={() => onSeleccionarPaso(paso.clave)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: activo
                            ? 'primary.main'
                            : completado
                              ? 'success.light'
                              : 'divider',
                          bgcolor: activo
                            ? 'primary.main'
                            : completado
                              ? 'success.light'
                              : 'background.default',
                          color: activo
                            ? 'primary.contrastText'
                            : completado
                              ? 'success.dark'
                              : 'text.secondary',
                          px: 0.75,
                          py: 0.5,
                          fontSize: 11,
                          fontWeight: 600,
                          lineHeight: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            flexShrink: 0,
                            bgcolor: 'currentColor',
                          }}
                        />
                        {paso.nombre}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <IconButton
        aria-label="Fases siguientes"
        size="small"
        disabled={!puedeDerecha}
        onClick={() => desplazar(1)}
        sx={{ alignSelf: 'center' }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
