import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const PUNTOS_BENEFICIO = [
  {
    icono: PsychologyOutlinedIcon,
    titulo: 'IA que entiende talento',
    descripcion: 'Analizamos hojas de vida y perfiles para identificar el mejor match.',
  },
  {
    icono: VerifiedOutlinedIcon,
    titulo: 'Evaluaciones confiables',
    descripcion: 'Integramos pruebas psicotécnicas, validaciones de seguridad y exámenes médicos.',
  },
  {
    icono: AssessmentOutlinedIcon,
    titulo: 'Decisiones basadas en datos',
    descripcion: 'Dashboards e informes para una gestión eficiente y transparente.',
  },
] as const;

/** Gradiente de marca del panel de autenticación, compartido con `LayoutAutenticacion`. */
export const GRADIENTE_MARCA_LOGIN =
  'linear-gradient(160deg, #e7f2e2 0%, #f4f8f1 45%, #ffffff 100%)';

/** Panel izquierdo de marca de la pantalla de inicio de sesión, visible desde `md`. */
export function PanelHeroLogin() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        flex: '1 1 50%',
        px: { md: '72px' },
        pt: { md: '40px' },
        pb: { md: '140px' },
        background: GRADIENTE_MARCA_LOGIN,
      }}
    >
      <Box
        role="img"
        aria-label="Grupo Energía Bogotá"
        sx={{
          // `logo_geb.png` (1104x735) trae bastante margen transparente
          // alrededor de la marca real. `GebLogo` centra la imagen COMPLETA
          // (con ese margen) dentro de su caja, así que un `width={148}
          // height={71}` como el del prototipo de referencia (que usa un
          // asset ya recortado) termina mostrando el logo mucho más chico
          // que 71px reales. Se recorta por CSS (mismo criterio que
          // `AppLayout.tsx`) para que el alto visible del logo sea
          // efectivamente 71px, igual que la referencia, y quede pegado al
          // borde izquierdo (alineado con el título de abajo).
          width: 141,
          height: 71,
          backgroundImage: 'url(/logo_geb.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '189.83px 126.36px',
          backgroundPosition: '-16.50px -33.52px',
          mb: '26px',
        }}
      />
      <Typography
        component="h1"
        sx={{
          color: 'text.primary',
          fontSize: '48px',
          lineHeight: '56px',
          fontWeight: 700,
          margin: 0,
          mb: '14px',
        }}
      >
        Selecta 2.0
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
          maxWidth: 400,
          fontSize: '14px',
          lineHeight: '21px',
          fontWeight: 400,
          margin: 0,
        }}
      >
        Plataforma de automatización de selección con IA.
      </Typography>
      <Stack spacing={4.5} sx={{ maxWidth: 400, mt: '28px' }}>
        {PUNTOS_BENEFICIO.map(({ icono: Icono, titulo, descripcion }) => (
          <Stack key={titulo} direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icono fontSize="small" />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  mb: '2px',
                }}
              >
                {titulo}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '12.5px', lineHeight: '18px' }}>
                {descripcion}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
