/**
 * `@geb/api-client` es axios sin `paramsSerializer` propio: por defecto
 * serializa los arrays como `estado[]=A&estado[]=B`. El contrato del backend
 * define el parámetro `estado` con `style: form, explode: false`, es decir
 * `?estado=A,B`. Este serializador produce esa forma y deja el resto de
 * parámetros con el comportamiento estándar de axios (`URLSearchParams`).
 */

/**
 * Serializa `params` a query string. Los arrays se unen con coma (sin
 * `explode`); el resto de valores se agrega tal cual. Los `null`/`undefined`
 * se omiten.
 */
export function paramsSerializerEstado(params: Record<string, unknown>): string {
  const partes: string[] = [];

  for (const [clave, valor] of Object.entries(params)) {
    if (valor === null || valor === undefined) continue;

    if (Array.isArray(valor)) {
      if (valor.length === 0) continue;
      // `form` sin `explode`: los valores se unen con coma literal (`?estado=A,B`),
      // no como `estado[]=A&estado[]=B` ni con la coma percent-encodeada.
      const unido = valor.map((elemento) => encodeURIComponent(String(elemento))).join(',');
      partes.push(`${encodeURIComponent(clave)}=${unido}`);
      continue;
    }

    const escalar = valor as string | number | boolean;
    partes.push(`${encodeURIComponent(clave)}=${encodeURIComponent(String(escalar))}`);
  }

  return partes.join('&');
}
