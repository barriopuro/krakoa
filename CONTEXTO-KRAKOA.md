# CONTEXTO — Proyecto KRAKOA Web

> Archivo de contexto para abrir chat nuevo con IA.
> Versión: Sesión 20 (2026).
>
> **Cómo actualizarlo:** ver §0. Cada sesión nueva se agrega como un
> bloque al final del §11. No hace falta tocar el resto.

---

## §0 — Cómo actualizar este archivo

**Cada sesión nueva:** al cerrar el chat, la IA te da **un bloque** que
pegás al final del archivo (§11). Ese bloque tiene dos partes:

- **Parte A (siempre):** entrada de historial de la sesión.
- **Parte B (opcional):** cambios al cuerpo del archivo, en formato
  "Buscá esto / Reemplazá por". Solo si la sesión cambió algo
  estructural (nueva deuda, deuda cerrada, decisión tomada, cambio de
  stack, etc.).

**Cada 10-15 sesiones:** reescritura completa del archivo (compresión
del historial viejo + reorganización). La IA te guía.

**Regla de oro:** si dudás, no toques §1–§10. Agregá todo al historial
del §11 y listo. El cuerpo se mantiene estable.

---

## §1 — El proyecto

**Qué es:** sitio web de catálogo de remeras de la marca KRAKOA.

**Stack:** Astro ^7.3.5 + HTML + CSS + JavaScript vanilla. Sin
frameworks. Todo el sitio vive en `src/pages/index.astro` (HTML +
CSS + JS en un solo archivo). Node >=22.12.0. Dependencias:
`astro` (framework) y `sharp` (procesa imágenes en el script de
catálogo).

**Deploy:** GitHub Pages, repo `barriopuro/krakoa`. Workflow de GitHub
Actions en `.github/workflows/deploy.yml` que corre en cada push a
`main`. Source de Pages configurado en "GitHub Actions" (NO en "Deploy
from a branch").

**URL de producción:** https://barriopuro.github.io/krakoa

**URL corta (Netlify):** https://krakoa.netlify.app — redirige a
GitHub Pages mediante un `_redirects`. La config vive en el repo de
Netlify (separado del repo de GitHub).

> ⚠️ La bio de Instagram usa la URL de **GitHub Pages**, NO la corta.
> Motivo: Instagram agrega una serie de prefijos a los links de la bio
> que rompen el redirect de Netlify (da error de "sitio no encontrado").
> Todo lo demás (compartir, otros links) puede usar la corta.

**Repo secundario:** `barriopuro/krakoa-web` — solo contiene un
`index.html` con redirect automático a la URL nueva, para que links
viejos compartidos sigan funcionando. No tiene código del sitio.

**Remote de git local:** apunta a `barriopuro/krakoa` (no a `-web`).
Si GitHub rechaza un push, chequear con `git remote -v`.

**Frecuencia de cambios:** el sitio se considera "prácticamente
perfecto" en estética y funcionalidad. Las próximas sesiones son de
detalle fino, nuevas features puntuales, o mantenimiento de catálogo.
No hace falta refactorizar nada grande.

---

## §2 — Estructura de archivos
/
├── ACTUALIZAR WEB.bat ← script de publicación (doble click)
├── astro.config.mjs ← config Astro (site + base)
├── package.json
├── CONTEXTO-KRAKOA.md ← este archivo
├── .github/workflows/deploy.yml ← workflow de deploy (push a main)
│
├── catalogo/ ← IMÁGENES ORIGINALES (jpg)
│ └── <categoria>/<modelo>/
│ ├── modelo.jpg
│ ├── remera.jpg
│ └── extra-*.jpg (opcionales, ver convención abajo)
│
├── talles/ ← imágenes de tablas de talles
│ ├── oversize.jpg
│ └── regular.jpg
│
├── promo/ ← imágenes de promo + config.json
│ ├── config.json
│ └── (imágenes .jpg)
│
├── public/ ← lo que se sirve en el sitio
│ ├── catalogo/<cat>/<modelo>/.webp (generado por el script)
│ ├── talles/.webp (generado)
│ ├── promo/.webp (generado)
│ ├── fonts/
│ │ └── krakoafont.ttf (Payback renombrada, se sube tal cual)
│ ├── logos/
│ │ ├── krakoalogo-horizontal.webp
│ │ ├── krakoalogo-isotipo.webp
│ │ └── krakoalogo-vertical.webp
│ │ (los PNG fuente NO viven en el repo; si hay que regenerar,
│ │ copiar temporalmente el PNG a public/logos/, correr el .bat,
│ │ y volver a borrarlo)
│ ├── favicon.ico / favicon.svg
│ ├── og-image.jpg
│ └── sitemap.xml (generado por el script)
│
├── scripts/
│ └── generar-catalogo.mjs ← convierte jpg→webp, optimiza
│ logos, regenera catalogo.json +
│ promo.json + sitemap.xml
│
└── src/
├── data/catalogo.json ← generado automáticamente
├── data/promo.json ← generado automáticamente
└── pages/index.astro ← TODA la web


**Importante:** no hay componentes separados ni layouts en uso. Todo
vive en `index.astro`.

**Script de publicación (`ACTUALIZAR WEB.bat`):**

1. `node scripts\generar-catalogo.mjs` → genera catálogo + sitemap.
2. `npm run build` → build de Astro.
3. `git add .` + `git commit -m "<descripción>"` → pide descripción
   al usuario (default: "Actualizacion de KRAKOA").
4. `git push` → dispara el workflow de GH Actions.

Si algo falla en cualquier paso, muestra el error y queda con `pause`
para que se pueda leer. No se migra a npm scripts (decisión tomada,
"si algo anda no se toca").

**Convención de nombres de carpetas:**

- Producto: `nombre-del-modelo` (guiones, sin caracteres raros).
- Tags de búsqueda: `nombre _(tag1, tag2)` al final del nombre de
  carpeta. El script los separa y los mete en `data-tags`.
- Fotos extra: `extra-N-descripcion.jpg` (N = orden) o
  `extra-descripcion.jpg` (sin orden).

**Categorías actuales** (en `scripts/generar-catalogo.mjs`, objeto
`categoryConfig`):

| id | name | color |
|---|---|---|
| anime | Anime | #e53935 |
| comics | Comics | #e84393 |
| cine-series | Cine y Series | #f2c94c |
| deportes | Deportes | #f2994a |
| musica | Música | #2f80ed |
| videojuegos | Videojuegos | #27ae60 |
| otros | Otros | #bb86fc |

Para agregar una categoría nueva: crear carpeta en `catalogo/` y
agregar entrada al `categoryConfig`. El catálogo se ordena con
intercalado round-robin por categoría (no todos los de una juntos).

---

## §3 — El sitio: mapa general

Orden de arriba a abajo en `index.astro`:

### Header (`<header class="site-header">`)

- **Desktop (≥701px):** logo horizontal (175px), nav con "Catálogo",
  "Cómo Comprar", "Materiales", buscador (input 200px), botón
  Instagram (rosa, "@krakoa.sw"), botón carrito.
- **Tablet (≤1000px):** buscador 150px, Instagram sin label (solo
  ícono).
- **Mobile (≤700px):** logo horizontal (115px), botón lupa, botón
  Instagram (solo ícono), botón carrito, botón hamburguesa.

El buscador en mobile se despliega: al tocar la lupa, el header se
transforma en "input + ×" (clase `.search-open` en `.site-header`).
El logo, nav, IG, carrito, menú y lupa se ocultan; el input ocupa todo
el ancho con foco automático. El × cierra, limpia y restaura el
catálogo. Escape también cierra.

El header tiene **glitch** ocasional (borde + placeholder + × + lupa,
sin flash de fondo) al abrir/cerrar en mobile, y al hacer focus en el
input en desktop (≥701px). Ver §4 "Glitches".

### Hero

- Fondo con imágenes del catálogo que rotan cada ~5.5s. La primera
  es estática (con `fetchpriority="high"`, es el LCP); las otras 5 se
  agregan por JS al azar. Opacidad 0.32. Zoom + paneo lento con
  `transition` sobre `transform`.
- Ancho completo: sale de `<main>` con `left: 50%; width: 100vw;
  transform: translateX(-50%)`. Sin border-radius.
- `::after` con scanlines horizontales + vignette radial + degradado
  vertical.
- `<h1>` con **glitch + typewriter + cursor** (ver §4 "Glitches").
- **Reveal por letra** la primera vez que carga (después del loader):
  las letras de "CATALOGO" aparecen una por una. Al terminar,
  restaura el HTML normal.

### Marquesina

Cinta con keywords (`marqueeText` en el frontmatter) que se desplaza
infinitamente. Al hover (solo desktop), se pausa y el ítem apuntado
se pinta en amarillo KRA (#ffd655).

### Catálogo (`<section id="catalogo" class="catalog">`)

- **Barra de categorías sticky** (`top: 0`, `z-index: 100`, backdrop
  blur). Cada botón:
  - Elevación en hover (solo desktop ≥901px) y en `.active` (todos).
  - Badge con el conteo de productos de esa categoría (esquina
    superior-derecha), con pop-in.
  - Glitch del texto + borde (spans reales, scrambles angostos,
    sin cambiar el ancho del botón).
  - Toggle: click en un botón activo lo desactiva (vuelve a "todas").
- **Grilla full-width** (`100vw` + `translateX(-50%)`).
- **Tinte de fondo por categoría:** dos capas apiladas (#catalogTintA
  / B) con `clip-path`. Slide de derecha a izquierda al cambiar de
  categoría (0.55s).
- **Tarjetas:**
  - Dos `<img>` apiladas: base (modelo) y hover (remera).
  - En hover (desktop ≥901px): crossfade puro de `opacity` (la base
    se va, la hover aparece). **Sin scale ni transform** (rompía con
    shift de 1-2px).
  - Overlay con degradado tintado (`color-mix` del `--category-color`
    con negro). En hover, el overlay se desliza hacia abajo y se
    desvanece.
  - `object-fit: cover`, `object-position: 50% 50%`.
  - Skeleton loader (shimmer) mientras carga la base.

### Cómo Comprar (`#como-comprar`)

Acordeón con 5 preguntas. Header centrado. Bloque "¿Tenés una consulta
especial?" con botón de WhatsApp. Solo uno abierto a la vez.

### Calidad y Materiales (`#calidad`)

4 pilares + guía de cuidado. Header centrado (kicker, h2, subtítulo).
Las tarjetas del care-grid siguen con texto interno a la izquierda.

### Footer

- Tres columnas centradas como bloque (logo vertical + texto
  institucional + links).
- Partículas blancas subiendo (22, creadas por JS).
- Copyright centrado abajo ("© 2026 KRAKOA powered by BARRIOPURO").

### Overlays (por z-index)

| z-index | Overlay |
|---|---|
| 100 | Barra de categorías sticky |
| 900 | Botón "volver arriba" (con anillo SVG de progreso) |
| 1000 | Modal de producto |
| 1010 | Flechas de producto del modal (desktop, afuera) |
| 1100 | Carrito (drawer) |
| 1200 | Menú mobile (drawer) |
| 1250 | Promo (popup) |
| 1300 | Zoom de imagen |
| 9500 | Barra de progreso de scroll |

El botón atrás del navegador deshace la última acción (ver §4 "History
stack").

### Loader inicial (`#krakoa-loader`)

Overlay con fade in del isotipo + glitch. Se oculta cuando
`DOMContentLoaded` (o a los 1.5s por seguridad). Dispara el evento
`krakoa:loaded` para que arranque el reveal por letra del hero.

---

## §4 — Sistemas transversales

### Sistema de precios

Los precios **no dependen del producto, del corte ni del talle**.
Dependen únicamente de la **cantidad total de prendas del pedido**.
Definidos en `PRICE_TIERS` dentro del `<script>` de `index.astro`:

| Cantidad | Precio unitario |
|---|---|
| 1 remera | $25.000 |
| 2 a 4 remeras | $23.000 c/u |
| 5 o más | $20.000 c/u |

Regla clave: el descuento aplica al **total de prendas**, no por
renglón. Si alguien tiene 3 modelos distintos, las 3 salen a $23.000
c/u.

**Precios SIN envío.** El envío se coordina aparte por WhatsApp, lo
paga el comprador.

**Helpers:** `formatPrice()`, `getUnitPrice(totalQty)`,
`getNextTier(totalQty)`.

**Dónde se ve:**

- **NO** en las tarjetas del catálogo (decisión: sobrecarga visual).
- **Modal:** bloque de precio con tabla de tiers siempre visible,
  fila activa resaltada, precio grande en color de categoría, badge
  verde "Agregá X más y todas salen a $Y" cuando faltan ≤3 para el
  próximo tier, total del pedido, "(sin envío)". Flash verde/rojo
  cuando cambia el unitario. Sin flash al abrir el modal
  (`lastUnitPrice` se resetea a null).
- **Carrito:** cada ítem muestra solo el total de su línea. Footer
  con "N prendas × $Y c/u", subtotal, "Envío: A coordinar" (gris
  itálica, sin monto), banner verde/rojo temporal (4s) cuando cambia
  el tier.
- **WhatsApp:** desglose por ítem (nombre, corte, talle, cantidad,
  unitario, subtotal), más subtotal de prendas, unitario aplicado,
  envío a coordinar.

**Contador en "Ver carrito" del modal:** "Ver carrito (N)" si hay N.
Actualizado desde `updateCartBadge()`.

**Cobro online:** no por ahora. Transferencia por alias/CBU
(recomendado) o link de Mercado Pago (secundario). NO integrar MP en
la web (es un proyecto aparte).

### Carrito

- **Persistencia:** `localStorage`, clave `krakoa_cart`.
- **Estructura:** `{ key, name, image, fit, size, quantity, color }`.
  `key = ${name}__${fit}__${size}`. Si en el futuro se agrega selector
  de color, el `key` tiene que incluirlo (rompe compatibilidad con
  localStorage viejo, es aceptable).
- **Funciones:** `saveCart`, `getTotalCount`, `updateCartBadge`,
  `addToCart`, `removeFromCart`, `changeQuantity`, `clearCart`,
  `renderCartDrawer(animate)`, `buildWhatsAppOrderMessage`.
- **WhatsApp:** `5491132372306`. Se abre con `window.open` y el
  mensaje va con `encodeURIComponent`.
- **Drawer:** se desliza desde la derecha, transición bidireccional
  (abre Y cierra). Header, body scrolleable, footer.

### History stack (botón atrás)

Sistema que hace que el botón "atrás" del navegador **deshaga la
última acción** (abrir modal, carrito, zoom, menú, promo, cambiar
categoría) en vez de salir de la web.

- `historyStack` es un **array de objetos**: `{ kind, state }`.
  Kinds: `"modal" | "cart" | "image-zoom" | "mobile-menu" | "promo" |
  "category"`.
- `pushHistory(kind, state)` → `pushState` + push al array.
- `popHistory()` → `history.back()` (dispara `popstate`).
- `closeTopOverlay()` → la usa `popstate`. Saca el último y deshace.
- Cada overlay tiene 2 cierres: `closeX()` (chequea si está en el
  tope → `popHistory()`) y `closeXDirect()` (cierre real, la usa el
  `popstate`).

**Caso particular: links del menú mobile.** Al tocar un link interno,
NO se hace `popHistory()`. Se hace `history.replaceState`, se saca
`"mobile-menu"` del stack con `splice`, se cierra el menú directo y
se scrollea suave. Esto es para que "atrás" después del scroll vuelva
al header (y no saque al usuario del navegador).

**Producto compartido por hash:** `openProductFromHash` hace un
`pushState` extra. Al cerrar con back, funciona normal.

**Caso conocido:** si el usuario entra por un link con hash y toca
"atrás", el navegador lo saca de la web (vuelve al sitio de donde
vino). Es el comportamiento esperado: probablemente quiera volver.

### Modal de producto

- **Layout desktop:** 2 columnas (1.15fr / 1fr). Izquierda: galería.
  Derecha: header (categoría + título), body (selectores + precio),
  footer (botones).
- **Layout mobile (<800px):** una columna. El `.modal-grid` es el
  único scroller.
- **Contenido del body (de arriba a abajo):** corte → talle (+ alto ×
  ancho en cm) → cantidad → bloque de precio.
- **Galería:** dos `<img>` apiladas (`#modal-image-a` /
  `#modal-image-b`) para la transición direccional. Slides: modelo,
  remera, extras (si hay), y **siempre** las 2 tablas de talles
  (Oversize, Regular).
- **Transición entre imágenes:** `renderModalImage(direction)` con
  `"next"` / `"prev"` / `"fade"`. Duración 0.32s.
- **Flechas de producto:**
  - Desktop grande (≥1281px): afuera del modal, a los costados de la
    pantalla. 60×60px, border-radius 12px, borde con
    `--category-color`.
  - ≤1280px: dentro del header del modal, al lado del título.
    44×44px, border-radius 8px.
  - Por qué el breakpoint está en 1280px: el modal mide 1100px +
    margen 24px a cada lado + flechas de 60px → necesita ~1268px.
    A 1280px ya empieza a tocar.
- **Animación de cambio de producto:** fade + slide del `.modal-grid`.
  Clases `.switching-next` / `.switching-in-next` (y `-prev`).
- **Navegación:** orden ACTUAL del DOM (alfabético si hay categoría
  activa, aleatorio si es el home). Se consulta con
  `document.querySelectorAll("#products .product-card")` en vivo
  (NO el NodeList `products`, que no se actualiza al reordenar).
  Wrap-around: del último al primero.
- **Reset al cambiar:** Oversize, L, 1. Scroll al inicio en mobile.
- **Teclado:** Shift + ← / → cambia de producto. ← / → cambia de
  imagen.
- **Apertura/cierre:**
  - Desktop: `translateY(60px) scale(0.97)` → 0/1, opacity 0 → 1.
    0.42s, cubic-bezier(0.22, 1, 0.36, 1).
  - Mobile: fade puro (sin transform). 0.3s.
  - La clase `.open` se agrega con doble `requestAnimationFrame`
    después de `aria-hidden="false"`. Reduce el "tirón".
- **Scroll lock:** `lockScroll()` compensa el ancho de la barra con
  `padding-right` en el body.
- **Link compartido:** `#slug-del-producto`. Se maneja con
  `openProductFromHash` + truco de historial.

### Zoom de imagen

- Overlay a pantalla completa con la foto agrandada. Fondo negro al
  93%.
- Se abre con click/tap sobre la imagen grande del modal (NO sobre
  las miniaturas, NO sobre las tablas de talles).
- Slides zoomeables: solo los de fotos (`isZoomableSlide(index,
  total) → index < total - 2`).
- Mobile: pinch-to-zoom nativo permitido. Ícono de lupa
  semitransparente en la esquina inferior derecha (armado con
  `::after` y SVG inline).
- Desktop: cursor `zoom-in`. Click sobre la imagen **cierra**.
- Cerrar: click fuera (con pointerdown + pointerup para evitar
  accidentales), × en la esquina, Escape, botón atrás.
- Navegación: flechas ‹ › a los lados de la imagen, swipe en mobile,
  teclado ← → en desktop. Índice propio (`zoomImageIndex`), independiente
  del carrusel del modal.
- **Bug fix importante:** las flechas del zoom se disparan con
  `pointerdown` + `stopPropagation` (sin el `stopPropagation`, el
  `pointerup` del overlay cerraba el zoom).

### Colores de categoría

Al abrir el modal, se lee `--category-color` del `.product-overlay`
de la tarjeta (NO del `.product-category`) y se setea como variable
CSS en `.modal-content`. Ese color se aplica a:

- Borde de la miniatura activa.
- Botón de corte/talle activo.
- Números "1." / "2." de los labels.
- Botón "Agregar al Pedido", "Ver carrito".
- Subrayado de "Ver tabla de talles".
- Borde de las flechas de producto.
- Precio grande del bloque de precio.
- Fila activa de la tabla de tiers.

**Ojo:** hay dos lugares del JS que leen `--category-color`:
`openModal` y `loadProductIntoModal`. Ambos leen del `.product-overlay`.
Si se mueve, actualizar los dos.

### Buscador

- Vive en el header. `#search` (input) + `.search-toggle` (lupa, solo
  mobile). Filtra por nombre (`product.dataset.name`) y tags
  (`product.dataset.tags`). Multi-palabra con AND. Debounce 150ms.
- `.search-bar` envuelta en `:global()` por seguridad (Astro no le
  asignaba el `data-astro-cid`).
- En mobile, el × cierra, limpia el input y restaura el catálogo.

### Promo (popup)

- Carpeta `promo/` con `config.json` + imágenes.
- `config.json`: `activa`, `noMostrarDuracionHoras` (24),
  `autoRotateSegundos` (5), `mostrarBotonNoMostrar`, `link`, `texto`.
- El script genera `src/data/promo.json` con
  `{ activa, imagenes, hash, config }`.
- Hash = nombre + tamaño en bytes de cada imagen. Si cambia, la promo
  se muestra a todos aunque hayan tocado "No mostrar".
- Sin imágenes O `activa:false` → no hay popup.
- Se abre a los 2s. Auto-rotate cada 5s (se detiene al interactuar
  con flechas/miniaturas/swipe, no se reanuda).
- Cerrar con × → solo por esta sesión (`sessionStorage`).
- "No mostrar de nuevo" → `localStorage` con `{ hash, timestamp }`,
  dura 24h (configurable).
- `historyStack` con kind `"promo"`.
- Los campos `link` y `texto` están en el JSON pero todavía no tienen
  UI.
- Efectos visuales: flicker de encendido + pulso de neón + scanlines.

### Glitches (sistema unificado)

Todos los glitches usan la misma técnica (definida en el hero y
replicada en todos lados):

- **Spans reales** con `textContent` scrambled (NO `content: attr()` —
  es poco confiable en runtime).
- **10 keyframes** de `clip-path` con tiras y bloques (`inset` de 4
  lados).
- **Flips** (`scaleX` / `scaleY`) en frames clave.
- **RGB split dinámico** en el `text-shadow` (magenta `#ff0055` +
  cian `#00fff0` a la vez).
- **Flicker** en paralelo.
- **`steps(9, end)`** para saltos digitales.
- Duración estándar: 420ms.

**Aplica a:**

- **Hero:** título. Cada 5-9s, 420ms. Con symbols scrambled ratio 0.4.
- **Loader:** isotipo. Primer glitch a 600ms + periódico cada 2.5s
  mientras el loader esté visible.
- **Categorías:** texto + borde. Dos cadenas de timers desfasadas
  (800ms / 2600ms), un botón al azar (no activo) cada 3-7s, 400ms.
  Símbolos scrambled **angostos** (`!|/\+~^_-=`).
- **Buscador:** borde del input + placeholder + borde del × + el × +
  borde de la lupa + ícono SVG. Trigger mobile: `openSearch` /
  `closeSearch`. Trigger desktop: `focus` en el input (≥701px).
- **Modal:** título del producto. Al abrir (200ms de delay, 400ms) y
  cada 15-20s mientras esté abierto (300ms).
- **Logo del header:** cada 15-30s, 420ms.

Todos respetan `prefers-reduced-motion: reduce`.

### Typewriter del hero

Cada 8-14s (aleatorio), el título se borra letra por letra, se
escribe "KRAKOA", se mantiene 700ms, se borra, y se vuelve a escribir
"CATALOGO". Función `setText(content)`.

- `formatHeroText(text)`: si es prefijo de "KRAKOA", envuelve las
  primeras 3 letras en `<span class="hero-kra">` (amarillo #ffd655).
- Cuando es prefijo de KRAKOA, el `<h1>` recibe `.is-krakoa` y aplica
  **KrakoaFont** (Payback).
- `height: calc(clamp(...) * 0.88)` fijo en el `<h1>` para que el
  cambio de fuente no cambie la altura del hero (métricas distintas).
- **Cursor titilante:** el `_` final titila con `cursorBlink 1s
  step-end infinite`. Forzado a `font-family: Arial` (Payback no
  tiene `_` o lo tiene feo).

### KrakoaFont (Payback)

Tipografía del logo de KRAKOA (renombrada a `krakoafont.ttf`). Vive
en `public/fonts/krakoafont.ttf`. 8kb.

Se carga con `<style is:inline set:html={...}>` (necesario para
interpolar `${base}`).

**Dónde se usa:**

- Hero: cuando el typewriter escribe "KRAKOA" (o prefijo).
- "Cómo Comprar en KRAKOA": con `<span class="brand-inline">`.
- NO en footer ni copyright (a 12-14px los cortes decorativos no se
  leen).

**Reglas de uso del logo (jerarquía):**

- **Tratamiento completo** (Payback + KRA amarilla): solo en
  contextos grandes (hero, títulos con "KRAKOA").
- **Solo KRA amarilla** (sin Payback): en párrafos de presentación
  medianos (Materiales, footer institucional).
- **Sin tratamiento**: texto chico (copyright, alt text, metadata).

Las clases `.hero-kra` (amarillo) y `.brand-inline` (Payback) son
independientes. Juntas = logo completo.

### Tinte de categoría

Ver §3 "Catálogo".

### Skeleton loader

`::before` en `.product-image`. Cuando el contenedor NO tiene
`.loaded`, se pone opaco y anima el shimmer. Cuando el JS agrega
`.loaded` (al cargar la imagen base), se desvanece.

### Fade-in al scrollear

Las secciones "Cómo Comprar", "Calidad" y el footer arrancan con
`.section-observe` (opacity 0, translateY(30px)). Un
`IntersectionObserver` les agrega `.is-visible` al entrar al viewport
y deja de vigilarlas. Si el usuario tiene reduce-motion, ni siquiera
se agrega la clase.

### Timers pausados cuando no están en viewport

`IntersectionObserver` pausa: rotación del hero, glitch del título,
typewriter, partículas del footer.

### URL y título dinámicos

- `?cat=<id>` refleja el filtro activo (vía `replaceState`).
- `#<producto-id>` refleja el producto abierto.
- El `<title>` cambia según el contexto: producto abierto → "KRAKOA |
  Nombre", filtro → "KRAKOA | Categoría", default → "KRAKOA |
  REMERAS".

---

## §5 — Reglas técnicas (CRÍTICAS)

### `:global()` en Astro

**Ante la duda, `:global()`.** Es más seguro y ahorra debugging.

Astro auto-limita (scoped) el CSS dentro de `<style>` en `.astro`,
agregando un atributo random (`data-astro-cid-...`) a cada selector.
El CSS solo matchea elementos que tienen ese atributo. Los elementos
que crea el JavaScript (`createElement`, `innerHTML`) NO lo tienen, y
quedan sin estilo.

**Casos que SIEMPRE llevan `:global()`:**

- Elementos creados por JS (`createElement`, `innerHTML`).
- Clases que agrega o quita JS sobre elementos estáticos
  (`.glitching`, `.active`, `.is-added`, `.search-open`, etc.).
- Elementos fuera de `<main>`: footer, header, modales, drawers,
  overlays, promo, menú mobile.
- Pseudo-elementos (`::before`, `::after`) que combinan HTML
  estático con cosas que maneja el JS.
- Selectores compuestos con `:hover` que combinan dos clases.
- Cualquier selector donde una de las clases la maneja el JS, aunque
  el elemento base sea estático.

**⚠️ Regla específica:** cuando un selector **combina un elemento
estático con uno creado por JS** (o con una clase que maneja el JS),
**cada parte va en su propio `:global()`**, separadas por espacio.
Ejemplo correcto:

```css
:global(.category-button.glitching) :global(.cat-glitch-a) { ... }

NO alcanza con envolver solo la primera parte.

Casos que NO llevan :global(): elementos HTML estáticos dentro
de <main> cuyas clases NO toca el JS (ej: .cart-price-summary,
.cart-subtotal-line, .cart-shipping-line — son estáticos, el JS
solo cambia textContent, no classList).

${base} en <style>
${base} NO se interpola dentro de <style> (ni con
is:inline). Para URLs en CSS (fuentes, background-image), usar
<style is:inline set:html={...}> con template literal, o rutas
relativas al documento (sin / inicial).

Dev server cacheando
Si un cambio de CSS no se ve reflejado, antes de asumir que el
cambio está mal, cerrar el dev server (Ctrl+C) y volver a correr
npm run dev. Astro a veces cachea <style> y no recompila. Aplica
especialmente a cambios en <style> y al agregar assets nuevos en
public/ (fuentes, imágenes).

Sticky hover en mobile
Los navegadores touch aplican :hover y lo dejan "pegado" hasta el
próximo tap. Solución: envolver los :hover persistentes en
@media (hover: hover) and (pointer: fine). En mobile, el estado
touch se maneja con .active.

Faux bold en fuentes custom
Si una @font-face declara font-weight: normal y el CSS pide
font-weight: 900, el browser sintetiza bold (faux bold). Para
evitarlo, cuando .is-krakoa / .brand-inline están activas, forzar
font-weight: normal. Aplica a cualquier fuente de un solo peso.

Fuentes con métricas distintas
Cambian la altura del line-box y producen layout shift. Solución:
height: calc(...) fijo en el contenedor (ej: <h1> en el hero).

attr() en content no es confiable
Para scrambles y animaciones de texto con valores que cambian en
runtime, usar spans reales + textContent. Funciona siempre.

Drawers con transición de cierre
cart-drawer y mobile-menu usan transition + visibility
diferido, no animation. Patrón:

Cerrado: opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.28s ease, visibility 0s linear 0.28s;

Abierto (.open): opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 0.28s ease, visibility 0s linear 0s;

Nunca display: none (impide animar el cierre).

Precios NO en las tarjetas
Decisión tomada: solo en el modal y el carrito. Las tarjetas no
muestran precio (sobrecarga visual).

Intercalado round-robin
El catálogo se ordena con intercalado por categoría (no todos los de
anime juntos, después todos los de comics, etc.). Se hace en el
script (generar-catalogo.mjs) y se re-mezcla en el cliente con
Fisher-Yates al cargar, guardando el orden aleatorio en
window.__krakoaRandomOrder para poder restaurarlo cuando el usuario
saque el filtro de categoría.

overflow-x: clip en el body
No hidden (rompería el sticky).

§6 — Convenciones de trabajo con la IA
Idioma y tono
Español rioplatense, informal pero claro. Explicar lo técnico con
analogías cuando haga falta. Evitar tecnicismos innecesarios.

El usuario no programa
No asumir conocimientos de terminal, git, npm, etc. Dar pasos
concretos y verificables. Cuando el usuario dice "no entendí",
simplificar. No debatir opciones.

🔴 Mecánica de trabajo estricta (NO NEGOCIABLE)
El usuario copia y pega, no edita a mano. Todos los cambios de
código se dan con este formato exacto:

"Buscá esto:" + bloque de código exacto (lo que está
actualmente en el archivo, copiado textualmente).

"Reemplazá por:" + bloque de código nuevo completo.

Si es un agregado nuevo (no reemplazo), decir "Buscá el final de X"
y "Agregá debajo:", pero el bloque de "buscá" tiene que ser
concreto y verificable (copiable textualmente).

Si hay múltiples cambios en el mismo archivo, numerarlos:
"Cambio 1 de 4", "Cambio 2 de 4", etc.

Cada cambio tiene que ser autocontenido y verificable.

PROHIBIDO usar estas frases:

"Después de X"

"Antes de Y"

"Al final del bloque Z"

"Justo después de la línea N"

"Agregá una línea"

"Cambiá el valor de X"

"Modificá la función X"

Cualquier instrucción que requiera que el usuario interprete o edite.

🔴 :global() primero
Antes de proponer CSS nuevo, revisar si el selector involucra JS o
elementos fuera de <main>. Si sí, proponerlo directamente con
:global(). No esperar a que el usuario reporte "no se ve el
estilo".

Otras reglas
No actualizar Astro ni dependencias sin que el usuario lo pida
explícitamente. El aviso de "nueva versión disponible" es
informativo, no hay que accionarlo.

No agregar features nuevas que no se pidieron, aunque parezcan
buena idea. Si surgen, mencionarlas al final como sugerencia, no
implementarlas en el mismo cambio.

No cambiar decisiones ya tomadas (ver §5, §7) sin discutirlo
primero.

Si algo no funciona, primero pedir un test en la consola del
navegador (F12) para diagnosticar, en lugar de proponer fixes a
ciegas.

Mantener el tono de las tandas: cambios chicos, numerados,
verificables. No mezclar muchos cambios grandes en un mismo
mensaje.

Al final de cada tanda, incluir una sección "Cómo probarlo" con
pasos concretos.

### Protocolo de fin de sesión

Al cerrar un bloque de trabajo importante, la IA entrega **un solo
bloque** para pegar al final de este archivo. Ver §0 para el
formato exacto (Parte A + Parte B opcional).

§7 — Decisiones descartadas (no re-proponer)
Decisión	Motivo
Cobro online / integrar Mercado Pago en la web	Proyecto aparte (credenciales, webhooks, rechazos). Con ventas bajas no se justifica. Se coordina por WhatsApp.
Migrar el .bat a npm scripts	"Si algo anda no se toca". El usuario no domina terminal.
Content Collections de Astro	El catálogo se genera desde carpetas de imágenes con un script propio.
Componentes separados / layouts	Todo vive en index.astro por simplicidad. Si crece mucho, reevaluar.
Override de nombres con caracteres especiales (X-Men, A Perfect Circle, etc.)	Costo de mantener tabla actualizada por producto no lo justifica. Los nombres siguen la convención de carpeta (guiones, sin caracteres raros).
Búsqueda por categoría en el buscador	La barra de categorías está visible y sticky. Redundante.
Lupa con seguimiento del mouse en desktop (estilo Zara/Nike)	Requiere imágenes en alta resolución (las actuales no dan para zoom 2x). Se implementó overlay a pantalla completa en su lugar.
Botón "Modelo / Remera" en cada tarjeta (C1 del plan original)	Se resolvió con el hover de segunda imagen en desktop.
Vista rápida en cada tarjeta (mini-modal sin abrir el modal grande)	Descartado hace varias sesiones.
Contador global de modelos ("7 categorías · 99 diseños")	Se desistió. Hay contadores individuales por categoría (badge en hover/active).
Selector de color de tela (subcarpetas por color)	Se mantiene como idea futura, no implementado. Ver §8.
Cálculo de envío en la web (tabla de zonas / API Correo Argentino / moto por km)	Se mantiene como idea futura. Por ahora todo "a coordinar" por WhatsApp.
Productos relacionados en el modal	Casi descartado. Se puede retomar si surge la necesidad.
§8 — Ideas futuras (vivas, sin implementar)
Selector de color de tela. Algunos modelos pueden tener la
opción de elegir color (blanco, negro, y alguno más). Máximo 3-4
colores, solo en modelos puntuales. Plan acordado:

Subcarpetas por color dentro de la carpeta del modelo.

generar-catalogo.mjs: detectar subcarpetas → armar
colors: { negro: {...}, blanco: {...} }.

index.astro: selector de color arriba del de corte (solo si
hay más de uno). Cambiar de color reemplaza URLs de imágenes.

Tarjeta del catálogo usa el color default.

El key del carrito tiene que incluir el color
("Naruto negro talle M" ≠ "Naruto blanco talle M"). Rompe
compatibilidad con localStorage viejo (aceptable).

Mapeo COLOR_NAMES para nombres lindos ("Negro azabache",
"Off-white").

Sistema de envíos. Opciones evaluadas:

Tabla de zonas con precios fijos: simple, predecible,
requiere mantenimiento. Recomendado para arrancar.

API de Correo Argentino (MiCorreo) por CP: precio real, pero
requiere cuenta de desarrollador, credenciales, definir
peso/medidas. No ahora.

Cálculo por distancia para moto (Google Maps + tarifa por km):
nunca va a ser exacto. No vale la pena.

Decisión actual: todo "a coordinar" por WhatsApp. Cuando haya
volumen, evaluar tabla de zonas.

Productos relacionados en el modal (casi descartado).

Usar KrakoaFont en otros lugares a futuro:

Una sección "Sobre KRAKOA" o "Nuestra historia".

Una pantalla 404 custom.

Una página de "Gracias por tu pedido".

Todos contextos donde el tratamiento completo tiene sentido.

§9 — Pendientes
Nada urgente. La web está estable y optimizada.

Contenido de `_redirects` (Netlify):** una sola línea:
  /*  https://barriopuro.github.io/krakoa/  301
  
Redirige cualquier path al equivalente en GitHub Pages con redirect permanente (301).

Revisar performance del backdrop-filter en mobile de gama muy
baja (hoy blur(6px)). No se reprodujo problema hasta ahora.

§10 — Protocolo para abrir chat nuevo
Cuándo: cada ~20-30 mensajes, al cerrar un bloque grande de
trabajo, o cuando las respuestas del asistente empiecen a sentirse
lentas.

Cómo:

Si hay cambios sin commitear, correr el .bat una última vez.

Abrir chat nuevo.

Pegar el contenido de CONTEXTO-KRAKOA.md como primer mensaje.

Subir también src/pages/index.astro, scripts/generar-catalogo.mjs,
package.json y promo/config.json (la IA no necesita más para
tener todo el estado actual).

Continuar desde donde quedamos.

Recomendación: hacerlo idealmente al cerrar un bloque (no a mitad).

§11 — Historial de sesiones
Las sesiones nuevas se agregan al final. Cada una es un bloque
con formato fijo. Las sesiones viejas (S1–S15) están comprimidas.

S1 — Limpieza y des-hardcodeo
Base del proyecto. Se sacaron valores hardcodeados, se armó la
estructura inicial.

S2 — Deploy fix
Fix del workflow de deploy a GitHub Pages.

S3 — Carrito + modal nuevo (Bloque A completo)
Sistema de carrito con persistencia en localStorage. Modal de
producto nuevo.

S4 — Secciones "Cómo Comprar" y "Calidad y Materiales"
Acordeón de FAQ + pilares de calidad + guía de cuidado.

S5 — Header con menú + fix del botón atrás en mobile
Header desktop y mobile. Menú mobile (drawer). Primer fix del botón
atrás en mobile.

S6 — Hero con imágenes rotando + footer completo
Fondo del hero con imágenes rotando + marquesina. Footer con 3
columnas + partículas.

S7 — Loader inicial + fix back-to-top
Loader con fade in del isotipo. Fix del botón "volver arriba".

S8 — Catálogo variado + barra de categorías + URL nueva
Intercalado round-robin. Barra de categorías estilo
"shadow-button-set". Migración de URL.

S9 — Fondo dinámico por categoría + fix de remote
Tinte con slide. Fix del remote de git (apuntaba a krakoa-web).

S10 — Tinte por categoría + animaciones del modal
Tinte con clip-path y dos capas. Link "Compartir" con #hash.
Animación de apertura/cierre del modal.

S11 — Optimización + "Ver tabla de talles"
fetchPriority en el hero. og:image:width/height (fix de la
miniatura en WhatsApp). Debounce en filterProducts.

S12 — Zoom de imagen + refactor del history lock
Zoom de imagen (overlay a pantalla completa). Refactor del
historyLock a historyStack (pila).

S13 — Aleatorización + zoom navegable
Aleatorización del catálogo con round-robin (client-side). Zoom
navegable (flechas, swipe, teclado).

S14 — Tags, extras, Clarity, promo, flechas de producto
Búsqueda por tags (_(tag1, tag2)). Fotos extra (extra-*.jpg).
Microsoft Clarity. Popup de promo. Scroll al filtrar. Menú sticky
en desktop. Flechas para cambiar de producto. Título/categoría dentro
de la imagen. Grilla full-width.

S15 — Buscador en el header + hover con segunda imagen
Buscador movido al header. Hover con segunda imagen en las tarjetas
(desktop). Click sobre la imagen del zoom cierra el zoom (solo
desktop).

S16 — Precios, carrito con totales, hero con glitch + typewriter
Sistema de precios con tiers. Bloque de precio en modal. Carrito con
totales y banner de cambio de tier. Mensaje de WhatsApp con desglose.
Hero con glitch + typewriter + cursor titilante. Flechas de producto
cuadradas con borde de color. Overlay de tarjeta animado en hover.

S17 — Glitch extendido, KrakoaFont, badge de categorías, navegación deshacible
Glitch del menú de categorías. Hero con glitch mejorado (10
keyframes, flips, RGB split dinámico). Hero con KrakoaFont (Payback)

KRA amarilla. Badge con conteo de modelos por categoría. Buscador
con glitch. historyStack refactorizado a objetos { kind, state }
con "category" como acción deshacible. Drawers con transición de
cierre. Secciones centradas (FAQ, Calidad, footer). Flecha de
Instagram en el footer.

### S19 — Optimización de performance, unificación de glitches y loader
(Nota histórica: el número S18 se salteó por error. El historial no tiene hueco funcional.)

Calidad WebP bajada de 82 a 75, resize máximo a 1000px. Peso del
catálogo a la mitad.

Loader cambiado de window.load a DOMContentLoaded + timeout
de seguridad 1500ms. MIN_TIME bajado a 300ms.

Hero LCP: primera imagen estática en el HTML con
fetchpriority="high". JS agrega las 5 rotativas.

JSON-LD consolidado en 1 solo <script> con @graph (antes eran
117 scripts inline).

Timers pausados vía IntersectionObserver cuando no están en
viewport (rotación del hero, glitch, typewriter, partículas).

Scroll optimizado con requestAnimationFrame + { passive: true }.

will-change quitado de las imágenes del catálogo (solo en hover).

Todos los glitches unificados con la técnica del hero.

URL y título dinámicos: ?cat=... y #producto, <title> según
contexto.

Botón "Volver arriba" con anillo SVG de progreso circular.

Filtro de categorías con fade-in escalonado y reordenamiento sin
saltos.

Métricas finales (Fast 4G, Lighthouse Mobile):

Performance: 79 (antes 60-70)

LCP: 3.8s (antes 12.3s)

Peso total: 22.5 MB (antes 41 MB)

DOMContentLoaded: 2.07s (antes 3.2s)

S20 — Fix de CSS, efectos en Promo, URL corta
Hover de tarjetas: se eliminaron will-change y los scale() del
hover (causaban shift de 1-2px). Ahora es crossfade puro de
opacity.

Scanner de Vite: se sacaron SCHEMA_PRICES y SCHEMA_ORG del
frontmatter (rolldown fallaba). JSON-LD ahora va inline en el
<head> con @graph.

Popup Promo: efectos visuales (flicker de encendido, pulso neón,
scanlines). Flechas se ocultan si hay una sola imagen.

URL corta: krakoa.netlify.app con _redirects a GitHub Pages.
La bio de Instagram usa la URL de GitHub (Instagram agrega prefijos
que rompen el redirect de Netlify).

<!-- Pegar al final de CONTEXTO-KRAKOA.md -->

## Parte A (Historial)

### S21 — Cotizador offline y definición de Roadmap
Se creó un cotizador de costos y precios completo en un archivo único (`cotizador.html`) con HTML/CSS/JS. Incluye cálculo de pliegos DTF con algoritmo "Guillotine Best-Area-Fit", configuración de márgenes de borde y entre estampas, gráfico visual SVG de los pliegos, y cálculo de precios sugeridos con margen sobre costo o venta.
Se charló extensamente sobre mejoras a futuro para la web (Bottom Sheet, auto-rotación, lazy loading, etc.) y se definió el orden de implementación (Roadmap).

---

## Parte B (Cambios al cuerpo del archivo)

**Buscá esto:**
(Sección §8 — Ideas futuras)

**Reemplazá por:**
(Agregar en la sección §8 el siguiente texto antes de "Selector de color de tela")

**§13 — Roadmap de Implementación (Acordado en S21)**
Prioridad de fases para las próximas sesiones:
- **Fase 0 (Urgente):** Lazy loading en el catálogo (cargar de a 20-30 tarjetas en vez de las 150 de golpe).
- **Fase 1 (Mobile Flow):** Rediseño del modal a "Bottom Sheet", quitar contador "1/4" de fotos, swipe para cambiar de producto (solo desde la zona de info/título).
- **Fase 2 (Vida):** Auto-rotación de imágenes en tarjetas, Feedback táctil (vibración y glitch al tocar).
- **Fase 3 (Scroll):** Parallax en hero y fade+glitch en tarjetas (optimizado: Parallax y glitch completo solo en Desktop, en Mobile solo fade limpio).
- **Fase 4 (Detalles):** Sugerencia de Tiers en el carrito, buscador con "Sin resultados" inteligente (tabla de sinónimos), página 404 personalizada.
- **Fase 5 (Relacionados):** Productos relacionados en el modal (recomendaciones por categoría).
- **Fase 6 (Grandes):** Selector de color de remera (con subcarpetas), Lista de favoritos (Wishlist).

**Nota sobre el Cotizador:**
Existe un archivo externo `cotizador.html` (no vive en el repo de la web) que se usa para calcular costos de DTF y precios de venta. Se mantiene independiente del deploy de KRAKOA.

## Parte A (Historial)

### S22 — Modal: CRT + switch glitch + limpieza del carrusel
Se reemplazó la animación de apertura/cierre del modal. Ahora usa **CRT Power On/Off con scanlines** (colapso/expansión vertical + flicker + barrido de scanlines durante la apertura), tanto en desktop como en mobile. La clase `.is-closing` se agrega al cerrar y se limpia a los ~380ms con un timer (`modalCloseTimer`) para dar tiempo a que termine la animación.

Se reemplazó la animación de cambio de producto (antes era `translateX` + fade) por **RGB split suave + ruido teal + viñeta** aplicados **solo sobre la zona de la imagen** (`.modal-image-area`):
- **RGB split** en el `.modal-grid` (drop-shadows magenta/cian, steps(7), 0.24s).
- **Ruido teal** en `.modal-image-area::before` (SVG `feTurbulence` + `feColorMatrix` con R=0.03, G=0.12, B=0.10 — verde azulado casi negro, grano rústico `baseFrequency=0.25`, tile 500x500). z-index 1.
- **Viñeta W2A** en `.modal-image-area::after` (radial gradient, centro 0.5, transición al 25%, borde 0.97). z-index 2.
- Las flechas (‹ ›) y el overlay quedaron en z-index 3 y 4 respectivamente para no taparse.
- La columna de info (título, precio, selectores) **NO** recibe ruido ni viñeta: queda limpia, así no se "flashea" el texto.

Se eliminó el overlay `"Modelo" / "1 / 4"` del carrusel del modal (HTML, CSS y las 2 constantes JS `modalImageLabel` / `modalImageCounter` + sus usos en `renderModalImage`).

**Bug encontrado y corregido:** había quedado un bloque CSS remanente de un demo anterior (`switchStaticNoise`, ruido fino con `baseFrequency=0.9` y z-index 15) que se **sumaba** encima del ruido teal nuevo y causaba un flash blanco. Se eliminó ese bloque completo.

**Técnica del ruido (para reusar en futuros efectos):** `feTurbulence` genera píxeles blancos puros (0-255) que sobre fondo oscuro se leen como "flash" sin importar cuán bajo sea el `slope`. La solución es `feColorMatrix` para teñir el ruido de un color oscuro (verde, teal, etc.) en vez de gris/blanco.

---

## Parte B (Cambios al cuerpo del archivo)

**Buscá esto** (en §3, sección "Modal de producto"):

> **Apertura/cierre:**
> - Desktop: `translateY(60px) scale(0.97)` → 0/1, opacity 0 → 1.
>   0.42s, cubic-bezier(0.22, 1, 0.36, 1).
> - Mobile: fade puro (sin transform). 0.3s.

**Reemplazá por:**

> **Apertura/cierre (CRT):**
> - Desktop y mobile: CRT Power On/Off. Apertura `scaleY(0.005) scaleX(0.5)` → `scaleY(1) scaleX(1)` con overshoot (0.55s), flicker de brightness, y scanlines que aparecen y se van solas en 0.6s. Cierre inverso (0.35s). La clase `.is-closing` se agrega al cerrar y se limpia a los 380ms con `modalCloseTimer`.

**Buscá esto** (en §3, sección "Modal de producto", "Navegación"):

> **Navegación:** orden ACTUAL del DOM (alfabético si hay categoría
> activa, aleatorio si es el home). Se consulta con
> `document.querySelectorAll("#products .product-card")` en vivo
> (NO el NodeList `products`, que no se actualiza al reordenar).
> Wrap-around: del último al primero.

**Reemplazá por:**

> **Navegación:** orden ACTUAL del DOM (alfabético si hay categoría
> activa, aleatorio si es el home). Se consulta con
> `document.querySelectorAll("#products .product-card")` en vivo
> (NO el NodeList `products`, que no se actualiza al reordenar).
> Wrap-around: del último al primero.
>
> **Animación de cambio de producto:** RGB split + ruido teal + viñeta W2A, todos aplicados solo sobre `.modal-image-area`. El contenido se reemplaza a los 110ms (pico del efecto) y las clases se limpian a los 260ms. Ver §4 para el detalle del ruido.

<!-- Próxima sesión: pegar acá abajo el bloque nuevo. -->