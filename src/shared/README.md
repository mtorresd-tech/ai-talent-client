# shared/

Pegamento **local** entre features: tipos de dominio compartidos (`tipos/`), el cliente API cableado a la sesión (`api/clienteApi.ts`) y UI genuinamente compartida entre features de este proyecto (`components/`), como `EncabezadoPagina`.

No es el lugar para componentes de UI ni lógica de negocio reutilizable entre proyectos GEB — eso se propone como paquete nuevo o mejora en `@geb/*`. Si algo en `shared/` empieza a crecer lo suficiente como para servir a otro proyecto GEB, es candidata a moverse allá, no a quedarse acá.
