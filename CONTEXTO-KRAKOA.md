# CONTEXTO — Proyecto KRAKOA Web

Este archivo es un resumen del proyecto para pegar al inicio de un chat nuevo
con un asistente de IA. Actualizarlo cuando haya cambios importantes.

## Qué es

Sitio web de catálogo de remeras de la marca KRAKOA.
Stack: Astro 7, HTML + CSS + JavaScript vanilla (sin frameworks).
Deploy: GitHub Pages (repo `barriopuro/krakoa-web`).
URL actual: https://barriopuro.github.io/krakoa-web

## Estructura de archivos relevantes

```
/
├── ACTUALIZAR WEB.bat          ← script de publicación (doble click)
├── astro.config.mjs            ← config Astro (site + base)
├── package.json
├── CONTEXTO-KRAKOA.md          ← este archivo
│
├── catalogo/                   ← IMÁGENES ORIGINALES (jpg, las que agrega el usuario)
│   └── <categoria>/<modelo>/
│       ├── modelo.jpg
│       └── remera.jpg
│
├── talles/                     ← imágenes de tablas de talles (jpg)
│   ├── oversize.jpg
│   └── regular.jpg
│
├── public/                     ← lo que se sirve en el sitio
│   ├── catalogo/<categoria>/<modelo>/*.webp   (generado automáticamente)
│   ├── talles/*.webp                          (generado automáticamente)
│   ├── logos/
│   ├── favicon.ico / favicon.svg
│   └── og-image.jpg
│
├── scripts/
│   └── generar-catalogo.mjs    ← convierte jpg→webp y regenera catalogo.json
│
└── src/
    ├── data/catalogo.json      ← generado automáticamente
    └── pages/index.astro       ← TODA la web (HTML + CSS + JS en un solo archivo)
```

**Importante:** todo el sitio vive en `src/pages/index.astro`. No hay componentes
separados ni layouts en uso (se borraron los de ejemplo de Astro).

## Flujo de trabajo del usuario (para publicar)

1. Agregar fotos nuevas en `catalogo/<categoria>/<nuevo-modelo>/`
   - `modelo.jpg` (foto del modelo con la remera)
   - `remera.jpg` (foto del producto solo)
2. Doble click en `ACTUALIZAR WEB.bat`
3. Escribir una descripción del cambio cuando la pida
4. Esperar ~1-2 min. GitHub Pages publica solo.

El `.bat` hace: generar catálogo → build → git add/commit/push.

## Categorías actuales

Definidas en `scripts/generar-catalogo.mjs` en el objeto `categoryConfig`.
Cada una tiene `name` (visible) y `color` (hex para el punto de color).

- anime → "Anime" (#e53935)
- comics → "Comics" (#e84393)
- cine-series → "Cine y Series" (#f2c94c)
- deportes → "Deportes" (#f2994a)
- musica → "Música" (#2f80ed)
- videojuegos → "Videojuegos" (#27ae60)
- otros → "Otros" (#bb86fc)

Para agregar una categoría nueva: crear carpeta en `catalogo/` y agregar
entrada al `categoryConfig`.

## Cómo funciona el modal (importante)

Al hacer click en una tarjeta, se abre un modal con carrusel de 4 imágenes:
1. Modelo (foto de la persona)
2. Remera (foto del producto)
3. Talles Oversize
4. Talles Regular

Las rutas de talles se construyen con `base` (de `import.meta.env.BASE_URL`),
que se pasa al `<script>` con `define:vars={{ base }}`.
NO hardcodear `/krakoa-web/...` en el script.

## Decisiones técnicas ya tomadas

- **No migrar el `.bat` a npm scripts.** Funciona bien, el usuario no domina
  terminal, y "si algo anda no se toca".
- **No usar Content Collections de Astro.** El catálogo se genera desde
  carpetas de imágenes con un script propio. Funciona bien así.
- **No usar componentes separados.** Todo vive en `index.astro` para
  simplicidad. Si en el futuro crece mucho, se puede refactorizar.
- **`define:vars` para pasar `base` al script.** Es la forma oficial de Astro.

## Historial de cambios (más reciente arriba)

### Sesión 1 — Limpieza y des-hardcodeo
- **A1:** Borrados archivos basura: `src/components/Welcome.astro`,
  `src/layouts/Layout.astro`, `src/assets/astro.svg`, `src/assets/background.svg`.
- **A2:** Arreglado `formatName()` en `generar-catalogo.mjs` para que maneje
  correctamente la "ñ" y letras acentuadas (antes "El Señor" salía "El SeñOr").
- **A3:** Estandarizado color de "comics" a minúscula (#e84393).
- **A4:** Borrada variable `modalCounter` no usada en `index.astro`.
- **B:** Rutas de talles ya no están hardcodeadas. Ahora usan `base` pasado
  al script con `define:vars`. Si cambia el dominio, todo se adapta solo.

## Pendientes / Ideas para el futuro

### C — Mejoras visuales y UX (a discutir)
Ideas sueltas:
- Transición suave (fade) al cambiar de imagen en el modal.
- Indicador visual de "deslizá para ver más" en mobile.
- Otros a definir con el usuario.

### D — Integrar ideas de la versión de Google AI Studio
El usuario pasó el sitio por Google AI Studio y obtuvo una versión alternativa
con algunas cosas que le gustaron y otras que no. Pendiente: que el usuario
cuente qué le gustó y qué no, y evaluar cómo integrarlo a la versión actual
(sin reemplazarla).

### Mejoras menores detectadas pero no urgentes
- El `.bat` no verifica que Node, npm y git estén instalados antes de arrancar.
  Si faltan, los errores son crípticos.
- Los colores de categoría podrían moverse a un archivo de config separado
  si crecen en cantidad.

## Convenciones para el asistente

- **Idioma:** español rioplatense, tono informal pero claro. Evitar tecnicismos
  innecesarios; explicar lo técnico con analogías cuando haga falta.
- **El usuario no programa.** No asumir conocimientos de terminal, git, npm,
  etc. Dar pasos concretos y verificables.
- **Cambios chicos y verificables.** Preferir varias iteraciones cortas antes
  que una grande. Después de cada cambio, indicar cómo probarlo.
- **No romper el flujo del `.bat`.** Es la parte más sensible del proyecto.
- **Respetar la estructura de un solo archivo (`index.astro`).** No proponer
  refactorizaciones grandes sin acordarlo antes.  