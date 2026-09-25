# PRODUCT.md

## Qué es
Página web de una consultora independiente de Yanbal ([NOMBRE], [CIUDAD]).
Tres superficies:

| Ruta | Función | Modo |
|---|---|---|
| `/` | Invitar a mujeres a empezar como consultoras | Persuade |
| `/productos` | Catálogo, pedidos por WhatsApp | Persuade |
| `/mi-tienda` | Panel de administración | Operate |
| `/privacidad` | Aviso de datos personales | Read (heredado de Persuade) |

## Público
- **`/` y `/productos`**: mujeres de 25 a 60 años, en celular, llegando por un
  enlace de WhatsApp o Facebook. Sin experiencia previa con la marca.
- **`/mi-tienda`**: una sola usuaria, [NOMBRE], persona mayor sin experiencia
  técnica. Entra desde su celular, muchas veces con conexión lenta.

## Objetivo de negocio
Que una visitante de `/` escriba "quiero saber más" por WhatsApp o deje su
nombre y número. La venta de productos en `/productos` es secundaria.

## Restricciones que no se negocian
- Nada de logo, tipografía o imágenes oficiales de Yanbal.
- Sello "Página de consultora independiente Yanbal" siempre visible.
- Ninguna cifra de ingresos inventada; el aviso de que no son garantizados
  va siempre visible, nunca en un desplegable.
- El panel nunca se complica por una decisión estética: si algo dificulta
  una tarea que ella repite (agregar producto, marcar agotado, cambiar
  estado de una persona interesada), se descarta.
- Datos personales limitados: sin cédula, correo ni pagos en el formulario
  público.

## Restricción técnica real del proyecto
Tailwind v4 (`@import "tailwindcss"`) coloca sus utilidades en una capa de
menor prioridad que las clases propias de `globals.css`. Los ajustes de
espaciado de sección deben resolverse con clases propias
(ver convención `.is-*` ya establecida), no con utilidades de Tailwind
aplicadas directo sobre esas clases.
