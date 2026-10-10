import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useController, useFormContext } from 'react-hook-form';

export interface CampoTextoLargoProps {
  /** Nombre del campo dentro del formulario. */
  name: string;
  label: string;
  /** Máximo de caracteres: el campo no deja escribir más y muestra el contador. */
  maximo: number;
  requerido?: boolean;
  ayuda?: string;
  filasMinimas?: number;
}

/**
 * Campo de texto multilínea conectado al formulario de `@geb/forms` (por
 * contexto de react-hook-form), con límite de caracteres, contador "n / máx."
 * y el mensaje de error del esquema.
 */
export function CampoTextoLargo({
  name,
  label,
  maximo,
  requerido,
  ayuda,
  filasMinimas = 3,
}: CampoTextoLargoProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const valor = typeof field.value === 'string' ? field.value : '';
  const mensaje = fieldState.error?.message ?? ayuda;

  return (
    <TextField
      inputRef={field.ref}
      name={field.name}
      value={valor}
      onChange={field.onChange}
      onBlur={field.onBlur}
      label={label}
      required={requerido}
      error={Boolean(fieldState.error)}
      multiline
      minRows={filasMinimas}
      fullWidth
      slotProps={{ htmlInput: { maxLength: maximo } }}
      helperText={
        <Box component="span" sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Box component="span" sx={{ minWidth: 0 }}>
            {mensaje}
          </Box>
          <Box component="span" sx={{ flexShrink: 0 }}>
            {valor.length} / {maximo}
          </Box>
        </Box>
      }
    />
  );
}
