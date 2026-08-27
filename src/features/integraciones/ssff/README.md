# integraciones/ssff

SuccessFactors no tiene un endpoint "integraciones" propio en el contrato del
backend — es el sistema de origen, no un proveedor que IA Talento consulte
de la misma forma que Bluesite/Cosinte/Medilaboral. Este submódulo queda
vacío a propósito hasta que exista un requirement concreto que necesite
tipos o helpers propios del lado del frontend.

**Regla a respetar cuando se agregue algo acá**: los campos custom de SFSF
nunca vienen tipados de forma confiable — por ejemplo
`cust_fechaconvocatoria` llega como string con espacios
(`"31 - 08 - 2026"`), no como fecha. Cualquier parseo debe ser defensivo y
validarse antes de usar, nunca asumir el tipo.
