import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import { FASES_SAP, PASOS_PIPELINE, type FaseSap } from '../logica/pipelineReclutador';

interface FaseVisible {
  fase: FaseSap;
  numero: number;
}

/** Explica qué representa el hueco entre dos fases visibles no consecutivas. */
const MENSAJE_FASES_OCULTAS =
  'Hay fases intermedias que no se muestran en IA Talento; consúltalas en SuccessFactors';

/**
 * Marca el hueco entre dos tarjetas de fase visibles no consecutivas: indica
 * que hay fases intermedias de SuccessFactors sin soporte en IA Talento. El
 * mensaje se expone como tooltip (hover y foco por teclado) además de
 * `aria-label`, para que también sea visible sin lector de pantalla.
 */
function IndicadorFasesOcultas() {
  return (
    <Tooltip title={MENSAJE_FASES_OCULTAS}>
      <Box
        role="separator"
        aria-orientation="vertical"
        aria-label={MENSAJE_FASES_OCULTAS}
        tabIndex={0}
        sx={{
          flexShrink: 0,
          width: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        …
      </Box>
    </Tooltip>
  );
}

export interface RailPipelineProps {
  /** Clave del paso interno activo. */
  pasoActivo: string | null;
  onSeleccionarPaso: (clave: string) => void;
}

/**
 * Fracción del ancho visible del rail que avanza cada click de flecha. Un valor
 * menor que 1 deja una ficha de solapamiento entre "pantallas" para no perder
 * el hilo del recorrido.
 */
const FRACCION_DESPLAZAMIENTO = 0.8;

/** Desplazamiento mínimo por click, para viewports muy angostos. */
const DESPLAZAMIENTO_MINIMO_PX = 160;

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
  // Sin desbordamiento horizontal (el rail completo cabe en el viewport), las
  // flechas no tienen nada que hacer: se ocultan en vez de mostrarse deshabilitadas.
  const [hayDesbordamiento, setHayDesbordamiento] = useState(false);

  const actualizarFlechas = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setPuedeIzquierda(rail.scrollLeft > 2);
    setPuedeDerecha(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2);
    setHayDesbordamiento(rail.scrollWidth > rail.clientWidth + 2);
  }, []);

  useEffect(() => {
    actualizarFlechas();
    window.addEventListener('resize', actualizarFlechas);
    return () => window.removeEventListener('resize', actualizarFlechas);
  }, [actualizarFlechas]);

  const desplazar = (direccion: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const tramo = Math.min(
      rail.scrollWidth,
      Math.max(DESPLAZAMIENTO_MINIMO_PX, rail.clientWidth * FRACCION_DESPLAZAMIENTO),
    );
    rail.scrollBy?.({ left: direccion * tramo, behavior: 'smooth' });
  };

  const indiceActivo = PASOS_PIPELINE.findIndex((paso) => paso.clave === pasoActivo);

  // El número de cada fase es su posición real dentro de las 10 fases de
  // `FASES_SAP`, no la posición dentro del subconjunto visible: se calcula
  // antes de filtrar para no perderla al ocultar fases intermedias.
  const fasesConNumero: FaseVisible[] = FASES_SAP.map((fase, indice) => ({
    fase,
    numero: indice + 1,
  }));
  const fasesVisibles: FaseVisible[] = fasesConNumero.filter(({ fase }) => !fase.oculta);

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.5 }}>
      {hayDesbordamiento && (
        <IconButton
          aria-label="Fases anteriores"
          size="small"
          disabled={!puedeIzquierda}
          onClick={() => desplazar(-1)}
          sx={{
            alignSelf: 'center',
            p: { xs: 1, sm: 0.5 },
            minWidth: { xs: 44, sm: 'auto' },
            minHeight: { xs: 44, sm: 'auto' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      )}

      <Box
        ref={railRef}
        role="group"
        aria-label="Fases del pipeline"
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
        {fasesVisibles.map(({ fase, numero }, indiceEnVisibles) => {
          const anterior = fasesVisibles[indiceEnVisibles - 1];
          const hayFasesOcultasAntes = anterior != null && numero - anterior.numero > 1;
          const indicesPasos = fase.pasos.map((clave) =>
            PASOS_PIPELINE.findIndex((paso) => paso.clave === clave),
          );
          const contieneActivo = fase.pasos.includes(pasoActivo ?? '');
          const faseCompleta =
            indiceActivo >= 0 &&
            indicesPasos.length > 0 &&
            indicesPasos.every((i) => i >= 0 && i < indiceActivo);

          return (
            <Fragment key={fase.clave}>
              {hayFasesOcultasAntes && <IndicadorFasesOcultas />}
              <Box
                sx={{
                  flex: '1 0 auto',
                  minWidth: { xs: 200, sm: 150 },
                  maxWidth: { xs: 260, sm: 190 },
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
                    data-testid={`numero-fase-${fase.clave}`}
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
                    {faseCompleta ? <CheckIcon sx={{ fontSize: 13 }} /> : numero}
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
                            minHeight: { xs: 44, sm: 0 },
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
                            py: { xs: 1, sm: 0.5 },
                            fontSize: { xs: 12, sm: 11 },
                            fontWeight: 600,
                            lineHeight: 1.25,
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 8, sm: 6 },
                              height: { xs: 8, sm: 6 },
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
            </Fragment>
          );
        })}
      </Box>

      {hayDesbordamiento && (
        <IconButton
          aria-label="Fases siguientes"
          size="small"
          disabled={!puedeDerecha}
          onClick={() => desplazar(1)}
          sx={{
            alignSelf: 'center',
            p: { xs: 1, sm: 0.5 },
            minWidth: { xs: 44, sm: 'auto' },
            minHeight: { xs: 44, sm: 'auto' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </Box>
  );
}
