const CLAVE_RUTA_DESTINO = 'selecta:ruta-destino-login';

/** Guarda la ruta a la que volver tras iniciar sesión, en `sessionStorage`. */
export function guardarRutaDestino(ruta: string): void {
  try {
    sessionStorage.setItem(CLAVE_RUTA_DESTINO, ruta);
  } catch {
    // sessionStorage no disponible (p. ej. incógnito estricto): se omite el
    // guardado sin interrumpir el flujo de login.
  }
}

/** Lee la ruta guardada y la elimina de `sessionStorage` (lectura de un solo uso). */
export function leerYLimpiarRutaDestino(): string | null {
  try {
    const ruta = sessionStorage.getItem(CLAVE_RUTA_DESTINO);
    if (ruta !== null) {
      sessionStorage.removeItem(CLAVE_RUTA_DESTINO);
    }
    return ruta;
  } catch {
    return null;
  }
}
