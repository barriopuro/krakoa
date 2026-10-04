# CONTEXTO — Proyecto KRAKOA Web

Este archivo es un resumen del proyecto para pegar al inicio de un chat nuevo
con un asistente de IA. Actualizarlo cuando haya cambios importantes.

## Qué es

Sitio web de catálogo de remeras de la marca KRAKOA.
Stack: Astro 7, HTML + CSS + JavaScript vanilla (sin frameworks).
Deploy: GitHub Pages (repo `barriopuro/krakoa`).
URL actual: https://barriopuro.github.io/krakoa

El deploy se hace con un workflow de GitHub Actions que corre en cada push
a `main` (`.github/workflows/deploy.yml`). El Source de Pages está en
"GitHub Actions" (NO en "Deploy from a branch").

Nota: existe un segundo repo `barriopuro/krakoa-web` que solo contiene
un index.html con un redirect automático a la URL nueva. Es para que
los links viejos que se hayan compartido sigan funcionando. No tiene
código del sitio.

IMPORTANTE: el remote de git local apunta a `barriopuro/krakoa` (no a
`-web`). Si alguna vez hay que pushear y GitHub rechaza, chequear con
`git remote -v`.

## Estructura de archivos relevantes

/
├── ACTUALIZAR WEB.bat ← script de publicación (doble click)
├── astro.config.mjs ← config Astro (site + base)
├── package.json
├── CONTEXTO-KRAKOA.md ← este archivo
├── .github/workflows/deploy.yml ← workflow de deploy (push a main)
│
├── catalogo/ ← IMÁGENES ORIGINALES (jpg, las agrega el usuario)
│ └── <categoria>/<modelo>/
│ ├── modelo.jpg
│ └── remera.jpg
│
├── talles/ ← imágenes de tablas de talles (jpg)
│ ├── oversize.jpg
│ └── regular.jpg
│
├── public/ ← lo que se sirve en el sitio
│ ├── catalogo/<categoria>/<modelo>/.webp (generado automáticamente)
│ ├── talles/.webp (generado automáticamente)
│   ├── logos/
│   │   ├── krakoalogo-horizontal.webp
│   │   ├── krakoalogo-isotipo.webp
│   │   └── krakoalogo-vertical.webp
│   │       (los PNG fuente NO viven en el repo. Si hay que
│   │        regenerar los .webp: copiar temporalmente el PNG a
│   │        public/logos/, correr el .bat, y volver a borrarlo.)
│ ├── favicon.ico / favicon.svg
│ └── og-image.jpg
│
├── scripts/
│ └── generar-catalogo.mjs ← convierte jpg→webp, optimiza logos PNG→WebP, regenera catalogo.json
│
└── src/
├── data/catalogo.json ← generado automáticamente
└── pages/index.astro ← TODA la web (HTML + CSS + JS en un solo archivo)

**Importante:** todo el sitio vive en `src/pages/index.astro`. No hay
componentes separados ni layouts en uso.

## Flujo de trabajo del usuario (para publicar)

1. Agregar fotos nuevas en `catalogo/<categoria>/<nuevo-modelo>/`
   - `modelo.jpg` (foto del modelo con la remera)
   - `remera.jpg` (foto del producto solo)
2. **Cerrar `npm run dev` si está abierto** (importante, sino el build puede
   tirar warnings raros).
3. Doble click en `ACTUALIZAR WEB.bat`
4. Escribir una descripción del cambio cuando la pida
5. Esperar ~1-2 min. GitHub Actions publica solo.

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
entrada al `categoryConfig`. El catálogo se ordena con un intercalado
round-robin por categoría (no todos los de una categoría juntos).

## ADVERTENCIA CRÍTICA: `:global()` en Astro

Astro **auto-limita (scoped)** el CSS dentro de `<style>` en un `.astro`,
agregando un atributo random a cada selector. Los elementos HTML estáticos
matchean las reglas; **los elementos que crea el JavaScript NO**, así que
quedan sin estilo (fondo blanco, letra negra, etc. = estilo por defecto).

**Regla de oro:** cualquier elemento que cree el JS (`createElement`,
`innerHTML = ...`, etc.) debe tener sus reglas CSS envueltas en
`:global(selector)`.

**Ampliación importante:** además del JS, algunos elementos
ESTÁTICOS del HTML también pueden necesitar `:global()`. Casos concretos:
- el `<footer class="site-footer">` (está fuera de `<main>`, Astro no le
  asigna el `data-astro-cid-...`).
- el `<div class="search-bar">` (aunque está dentro de `<main>`, tampoco
  recibía el atributo por algún motivo de Astro).
- las `<img class="modal-image-el">` del modal (las clases dinámicas
  `active`, `enter-from-right`, etc. no matcheaban bien sin `:global`).

**Regla general:** si un bloque del HTML se ve "sin estilo" y no está
dentro de `<main>` (o sus clases las maneja el JS), probarlo con `:global()`.

**Regla rápida:** todo lo que esté dentro del `<footer>`, del modal,
del carrito, del menú mobile o del zoom de imagen necesita `:global()`.
Astro saca esos elementos del scope (no les asigna el `data-astro-cid-...`),
así que el CSS normal no los agarra. Si algo "no toma estilo" y vive en uno
de esos bloques, envolvelo en `:global()` antes de investigar otra cosa.

Casos nuevos confirmados:
- el botón "Ver tabla de talles" (`.modal-chart-button`).
- todo el overlay del zoom de imagen (`.image-zoom`, `.image-zoom-img`,
  `.image-zoom-close`, `.modal-image-wrapper.is-zoomable`).

## Cómo funciona el carrito

### Estado y persistencia
- Clave en `localStorage`: `krakoa_cart`
- Estructura de cada item:
  ```js
  { key, name, image, fit, size, quantity, color }
key = ${name}__${fit}__${size} (un item único por modelo+corte+talle).

Si se agrega el mismo modelo+corte+talle, se suma la cantidad.

cartItems se serializa a JSON y se guarda después de cada cambio.

Al cargar la página, se lee de localStorage y se restauran los items.

Funciones principales (en index.astro)
saveCart() — guarda en localStorage.

getTotalCount() — suma de cantidades.

updateCartBadge() — actualiza el badge del header.

addToCart(product) — agrega o suma cantidad.

removeFromCart(key) — borra un item.

changeQuantity(key, delta) — suma/resta cantidad (si llega a 0, borra).

clearCart() — vacía todo.

renderCartDrawer() — regenera el HTML del drawer (con innerHTML).

buildWhatsAppOrderMessage() — arma el texto del pedido para WhatsApp.

WhatsApp
Número: 5491132372306 (definido en WHATSAPP_NUMBER).

El mensaje se arma con encodeURIComponent y se abre con
window.open('https://wa.me/...', '_blank').

UI
Header: ícono de bolsa + badge (aparece solo cuando hay items).

Drawer: se desliza desde la derecha. Header, body scrolleable y footer.

Item: foto (60x76), nombre, "Corte · Talle X", selector −/+ y botón ×.

Botón "Vaciar lista" arriba de todo.

Footer del drawer: "Total de prendas: N" + botón verde
"Enviar Pedido por WhatsApp".

z-index (importante para overlays apilados)
Modal: 1000.

Carrito: 1100 (por encima del modal).

Menú mobile: 1200.

Zoom de imagen: 1300 (arriba de todo).

Barra de categorías sticky en mobile: 100.

El carrito se puede abrir desde el modal (botón "Ver carrito") y queda
por encima. Al cerrarlo, el modal sigue abierto detrás.

Cómo funciona el modal de producto
Estructura
Layout de 2 columnas en desktop (grid-template-columns: 1.15fr 1fr):

Izquierda: galería (imagen grande + flechas ‹ › + overlay con label
y contador + 4 miniaturas).

Derecha: header (categoría con punto de color + título), body
(selectores) y footer (botón agregar + acciones).

En mobile (< 800px): una sola columna, el .modal-grid es el único
scroller.

Carrusel de imágenes
Son 4 slides siempre:

Modelo — ${base}/catalogo/.../modelo.webp
Remera — ${base}/catalogo/.../remera.webp
Talles Oversize — ${base}/talles/oversize.webp
Talles Regular — ${base}/talles/regular.webp
Hay dos <img> apiladas (#modal-image-a y #modal-image-b) para
poder animar la transición. La variable modalImageActive indica cuál
está visible.

Transición direccional entre imágenes
renderModalImage(direction) recibe "next", "prev" o "fade".

"next" → la nueva entra desde la derecha, la vieja sale hacia la izquierda.

"prev" → al revés.

"fade" → solo crossfade, sin desplazamiento (lo usa "Ver tabla de talles").

Duración 0.32s, curva cubic-bezier(0.22, 1, 0.36, 1).

Todas las formas de cambiar imagen (flechas, teclado, swipe, miniaturas,
"Ver tabla de talles") pasan por renderModalImage con la dirección correcta.

El swipe se escucha en .modal-image-wrapper (no en cada img).

Selectores
Corte: Oversize / Regular Fit. Cambiar de corte puede resetear el
talle si el actual no existe en el nuevo corte.

Talle: se muestran los del corte activo. En el label "2." al lado
aparece el alto × ancho en cm (ej: "76 cm alto × 59 cm ancho").

Cantidad: botones − / + (mínimo 1, máximo 20).

Tabla de talles (SIZE_CHART en el script)
Regular Fit (alto × ancho en cm):

S: 65 × 45 | M: 67 × 49 | L: 69 × 53 | XL: 71 × 56 | 2XL: 74 × 58

3XL: 76 × 58 | 4XL: 78 × 60 | 5XL: 81 × 62

Oversize (alto × ancho en cm):

S: 72 × 55 | M: 74 × 57 | L: 76 × 59 | XL: 78 × 61 | 2XL: 80 × 63

El usuario pide mostrar primero el ALTO y después el ANCHO, porque así
está en las imágenes de las tablas.

Colores de categoría
Al abrir el modal, se lee --category-color del .product-category de la
tarjeta y se setea como variable CSS en .modal-content.

Ese color se aplica a: borde de la miniatura activa, botón de corte activo,
botón de talle activo, número "1." y "2." de los labels, botón
"Agregar al Pedido", botón "Ver carrito", subrayado de "Ver tabla de talles", etc.

Animación de apertura/cierre
Desktop: el modal entra con translateY(60px) scale(0.97) → 0/1
y opacity 0 → 1. Duración 0.42s. Misma curva.

Mobile: fade puro (sin transform). El slide se veía trabado en
muchos celus por el costo del re-layout del contenido. Duración 0.3s.

La clase .open se agrega con un doble requestAnimationFrame
después de poner aria-hidden="false". Así el navegador tiene un frame
para calcular layout antes de animar. Reduce el "tirón" inicial.

El cierre es al revés: saca .open y espera la animación (por el
visibility con delay).

Compensación de scrollbar
Cuando el modal se abre, el body pierde la barra de scroll (por
overflow: hidden en body.modal-open). Para que el layout no salte,
lockScroll() calcula el ancho de la barra
(window.innerWidth - document.documentElement.clientWidth) y lo aplica
como padding-right al body. unlockScroll() lo limpia al cerrar.

Botones del modal
"Agregar al Pedido" (arriba del todo).

"Ver carrito" — abre el drawer del carrito por encima del modal.

"Compartir" — genera un link con #hash del producto
(.../#nombre-del-modelo) y lo comparte con navigator.share o lo copia
al portapapeles.

Link compartido (#hash)
Cada producto tiene data-id (slug del nombre, ej: naruto-shippuden).

Cuando se abre la página con un #hash que matchea un producto, se abre
el modal de ese producto automáticamente (openProductFromHash).

El truco del historial: al abrir por hash, se hace replaceState + un
pushState extra, así al tocar "atrás" el usuario queda en la home
sin salir de la web.

Se usa una bandera hashHandled para que no se procese dos veces.

NO hay listener de hashchange: antes lo había y generaba bucles
raros con el propio pushState. Si el usuario cambia el hash a mano,
recarga y listo.

Caso conocido: si el usuario entra por un link compartido con hash
y toca "atrás", el navegador lo saca de la web (vuelve al sitio de
donde vino). Es el comportamiento esperado, no un bug: el usuario que
llegó por link probablemente quiera volver. Cerrar con X o click afuera
funciona perfecto.

ZOOM DE IMAGEN (nuevo)
Qué es
Overlay a pantalla completa con la foto del modal agrandada, para que el
usuario pueda ver el detalle. Reemplaza la idea original de "lupa al pasar
el mouse" (que era más compleja y requería imágenes de más resolución).

Cómo funciona
Se abre con click/tap sobre la imagen grande del carrusel del modal
(no sobre las miniaturas, no sobre las tablas de talles).

La imagen se agranda lo máximo posible respetando proporción (max 92vw
x 92vh).

En mobile se permite pinch-to-zoom nativo (touch-action: pinch-zoom).

En desktop no hay zoom extra programado.

Fondo negro al 93%.

Transición de fade corta (220ms).

Indicadores visuales
Desktop: cursor zoom-in sobre las fotos del modal.

Mobile: ícono de lupa semitransparente en la esquina inferior derecha
de la foto (armado con ::after y un SVG inline como data URI).

Slides zoomeables
Solo los slides de fotos (modelo, remera). No las tablas de talles.

Se controla con el array ZOOMABLE_SLIDES = [true, true, false, false]
y la clase .is-zoomable en .modal-image-wrapper (se togglea en
renderModalImage).

Formas de cerrar
Click/tap en cualquier parte del overlay (con lógica de pointerdown +
pointerup para evitar cierres accidentales si el toque empieza sobre
la imagen y termina afuera, o al revés).

Botón × en la esquina superior derecha.

Tecla Escape.

Botón atrás del celular (vía la pila del historial).

Evitar que el click de zoom se dispare al hacer swipe
En mobile, el usuario puede estar haciendo swipe en el carrusel.

Se usa un flag zoomMoved que se activa si el dedo se movió más de 8px
en touchstart → touchmove. Si se movió, el click no abre el zoom.

Funciones
openImageZoom(src, alt) — abre el overlay y hace pushHistory("image-zoom").

closeImageZoom() — cierra vía popHistory() si está en el tope de
la pila, o directo si no.

closeImageZoomDirect() — cierre real (la llama el popstate).

History stack (botón atrás) — REFACTOR IMPORTANTE
Qué es
Sistema que hace que el botón "atrás" del celular cierre el overlay que
está arriba de todo (modal, carrito, zoom, menú) en vez de salir de la web.

Cómo funciona
historyStack es un array de strings (no una variable única).

Cada overlay que se abre hace pushHistory("modal" | "cart" | "image-zoom" | "mobile-menu"), que hace history.pushState(...) y
agrega el tipo al final del array.

Cuando el usuario toca "atrás", el popstate llama a closeTopOverlay(),
que saca el último de la pila y cierra ese overlay.

Cuando el usuario cierra un overlay con la X o Escape, se llama a
popHistory() (que hace history.back()) → dispara el popstate →
cierra. Nunca se cierra el overlay directamente sin pasar por el
popstate, así el "atrás" del celular y el click en la X quedan
sincronizados.

Ventaja sobre el sistema viejo
El sistema viejo tenía una variable única (historyLock) y casos
particulares ("si el modal está abierto y se abre el carrito, cambiar
el lock a cart y después volver a modal..."). Eso generaba bugs cuando
se apilaban overlays (zoom sobre modal, etc.).

Con la pila no hay casos particulares: el "atrás" siempre cierra el de
arriba. Zoom sobre modal → ["modal", "image-zoom"] → primer atrás
cierra zoom → ["modal"] → segundo atrás cierra modal → [].

Funciones
isTopOfHistory(kind) — ¿el overlay "kind" es el que está arriba?

pushHistory(kind) — agrega a la pila + pushState.

popHistory() — history.back() (dispara el popstate).

closeTopOverlay() — la usa el popstate. Saca el último de la pila
y llama al closeXDirect() correspondiente.

Cada overlay tiene 2 funciones de cierre:

closeX() — chequea si está en el tope de la pila → popHistory();
si no, closeXDirect().

closeXDirect() — cierra sin tocar el historial (la usa el popstate).

Caso particular: links del menú mobile
Al tocar un link del menú mobile (#catalogo, #calidad, etc.),
NO se hace popHistory(). En cambio:

history.replaceState(null, "", href) — reemplaza la entrada del
menú por la del hash.

Se saca "mobile-menu" de historyStack con splice.

closeMobileMenuDirect() — cierra el menú sin tocar el historial.

window.scrollTo({top, behavior: "smooth"}) — scroll suave.

Esto es para que el "atrás" del Android después del scroll vuelva al
header (y no saque al usuario del navegador).

Header y navegación
Desktop (≥ 701px)
Izquierda: logo horizontal (175px).

Centro: nav con links "Catálogo", "Cómo Comprar", "Materiales".

Derecha: botón Instagram (ícono rosa + @krakoa.sw) + botón carrito.

Mobile (≤ 700px)
Izquierda: logo horizontal (135px).

Centro: (vacío, no hay nav).

Derecha: botón Instagram (solo ícono) + botón carrito + botón hamburguesa.

Al tocar la hamburguesa se abre el menú mobile (drawer desde la derecha)
con links: Catálogo, Cómo Comprar, Materiales, Instagram (con flechita ↗).

Hero con imágenes rotando
El .hero tiene fondo con imágenes del catálogo que rotan cada ~5.5s.

Las imágenes se eligen al azar en cada visita desde los .webp del
catálogo (hasta 6, barajadas con shuffleArray).

Cada imagen hace un zoom lento + paneo hacia un costado. Las pares
(nth-child(even)) panean hacia el otro lado.

Se usa transition sobre transform, NO animation.

Opacidad de las fotos: 0.32.

Ancho completo: el hero sale de <main> con left: 50%,
width: 100vw, transform: translateX(-50%). No tiene border-radius.

El contenido interno (.hero-content) sí está limitado a
min(1400px, 90vw) para alinear con el resto.

Debajo del hero hay una marquesina con keywords que se desplaza
infinitamente. El array de textos está en marqueeText en el frontmatter.

Valores para calibrar rápido
Opacidad: opacity: 0.32 en .hero-bg img.active.

Cantidad de fotos: .slice(0, 6) en el JS del hero.

Velocidad de rotación: el 5500 en el setInterval.

Velocidad de la marquesina: el 45s en animation: marqueeScroll.

Intensidad del zoom: scale(1.1) en las transiciones del hero.

Paneo lateral: translateX(±1.5%).

Fondo tintado por categoría
Cuando el usuario selecciona una categoría, el fondo de la sección
#catalogo se pinta con el color de esa categoría.

Cómo funciona
Hay dos capas (#catalogTintA y #catalogTintB) apiladas dentro de
la sección, con position: absolute, z-index: -1 y opacity: 0.16.

La visibilidad la controla el clip-path:

Cerrado: clip-path: inset(0 0 0 100%) (recortado desde la izquierda).

Visible: clip-path: inset(0 0 0 0).

Saliendo: clip-path: inset(0 100% 0 0) (recortado desde la derecha).

Dos capas permiten que el cambio de una categoría a otra sea un
slide (no un fade): la capa nueva entra desde la derecha mientras la
vieja sale hacia la izquierda.

Duración del slide: 0.55s. La variable de JS tintTimer está en 600.

El color viene de --category-color del .category-wrap.

Para que el tinte llegue a los bordes de la ventana: left: 50%,
width: 100vw, transform: translateX(-50%).

El tinte arranca un poco arriba del borde superior de la sección con
top: -13px (para dar aire arriba).

Funciones de JS
showTint(color) — activa el tinte con el color dado. Hace el swap
entre capas si ya había un tinte activo.

hideTint() — desactiva el tinte (cuando el usuario deselecciona la
categoría).

commitTintSwap() — fuerza el fin de un swap en curso.

Buscador
El buscador está fuera de <section class="catalog">, entre la
marquesina y la sección. Está centrado.

Clase .search-bar (con :global porque Astro no le asignaba el
data-astro-cid).

Ancho del input: min(420px, 100%). En mobile es 100%.

Filtra por nombre (product.dataset.name) en tiempo real.

Tiene debounce de 150ms.

Barra de categorías
Botones envueltos en <span class="category-wrap"> con el color de la
categoría como background.

El botón se "despega" con transform: translate(-14px, -14px) en hover
y cuando está activo.

Click en el wrap también dispara el handler (no solo el botón). Se
hace con event.stopPropagation() en el botón y un listener aparte en
el wrap, ambos llaman a handleClick.

Toggle: tocar el botón ya activo lo desactiva y vuelve a mostrar todo.

Centrados horizontalmente: justify-content: center en .categories.

En mobile: sticky (position: sticky; top: 0; z-index: 100),
fondo rgba(11, 11, 11, 0.72) con backdrop-filter: blur(10px) para
dejar ver el tinte detrás.

Footer completo
Tres columnas:

Logo vertical (krakoalogo-vertical.webp) a 70px (desktop) / 58px (mobile).
Texto institucional (SEO) justificado.
Menú vertical con links: Catálogo, Cómo Comprar, Materiales, Instagram.
Abajo: línea fina con "© 2026 KRAKOA powered by BARRIOPURO".

Fondo: partículas blancas tenues que suben lentamente (creadas por JS, con
:global(.footer-particle)). Cantidad: 22 partículas. El @keyframes floatUp
hace que suban ~420px y se desvanezcan.

IMPORTANTE: todas las reglas CSS del footer van con :global() porque
el <footer> está fuera de <main>.

Secciones de la página
Orden de arriba a abajo:

#krakoa-loader — overlay de carga inicial (fade in del isotipo).
Va en el <body> antes del header. Estilos inline críticos para
evitar FOUC.

<header class="site-header">

#mobile-menu (drawer, oculto por defecto)

<main>

<section class="hero"> — fondo de imágenes rotando + título CATALOGO.

<div class="marquee"> — cinta con keywords.

<div class="search-bar"> — buscador (fuera de la sección catálogo).

<section id="catalogo" class="catalog"> — barra de categorías centrada,
grilla, tinte por categoría.

<section id="como-comprar" class="faq-section"> — acordeón con 5
preguntas + bloque "¿Tenés una consulta especial?" con botón WhatsApp.

<section id="calidad" class="quality-section"> — 4 pilares (algodón,
estampado, moldería, pre-encogido) + guía de cuidado (4 items).

#product-modal — modal de producto.

#image-zoom — overlay de zoom de imagen (nuevo).

#cart-drawer — drawer del carrito.

<footer class="site-footer"> — footer completo con 3 columnas + partículas.

#back-to-top — botón flotante "↑".

Secciones pendientes (plan original)
C1: Botón "Modelo / Remera" en cada tarjeta del catálogo (cambia la
foto sin abrir el modal). Inspirado en la versión de Google AI Studio.
El usuario pidió PAUSARLO por ahora, lo va a pensar mejor.

Ideas futuras / deuda técnica
Fotos extra por producto (charlado, no implementado)
Algunos modelos pueden necesitar más de 2 fotos (estampa extra atrás,
detalle lateral, etc.).

Plan acordado: cualquier .jpg extra en la carpeta del modelo
(catalogo/<categoria>/<modelo>/) se toma como foto extra y se agrega
al carrusel del modal, entre la remera y las tablas de talles.

Convención de nombres: extra-1.jpg, extra-2.jpg, extra-3.jpg, etc.
(predecible, no depende de que el usuario recuerde nombres específicos).

Cambios necesarios:

generar-catalogo.mjs: escanear la carpeta y armar un array extras: [...].

index.astro: el carrusel arma los slides dinámicamente a partir de
ese array, en vez de tener los 4 hardcodeados.

El contador de slides y las miniaturas se generan solos.

Las fotos extra son zoomeables (mismo sistema que las fotos base).

No afecta a los productos que solo tienen las 2 fotos de siempre.

Selector de color de tela (charlado, no implementado)
Algunos modelos pueden tener la opción de elegir color de tela
(blanco, negro, y alguno más). Máximo 3-4 colores por producto, y solo
en modelos puntuales.

Plan acordado: subcarpetas por color dentro de la carpeta del modelo:

text
catalogo/anime/naruto/
├── negro/
│   ├── modelo.jpg
│   └── remera.jpg
├── blanco/
│   ├── modelo.jpg
│   └── remera.jpg
└── gris/
    ├── modelo.jpg
    └── remera.jpg
El "color principal" (el que se ve en la tarjeta del catálogo) sería el
primero de la lista o uno marcado como default.

Cambios necesarios:

generar-catalogo.mjs: detectar si la carpeta del modelo tiene
subcarpetas de color. Si sí, armar colors: { negro: {...}, blanco: {...} }.
Si no, formato actual (un solo color implícito).

index.astro: si product.colors tiene más de uno, mostrar el
selector de color arriba del de corte. Cambiar de color reemplaza las
URLs de las imágenes (con la animación direccional que ya existe).

La tarjeta del catálogo usa el color default.

El key del carrito tendría que incluir el color: "Naruto negro
talle M" y "Naruto blanco talle M" son items distintos. Esto rompe
el formato de localStorage viejo (no es grave, pero decidirlo).

Para nombres lindos de color ("Negro azabache", "Off-white"): mapeo
COLOR_NAMES en el script.

Otras deudas técnicas
Regenerar krakoalogo-isotipo.webp a ~180px de ancho (hoy está
a 400px y se muestra a 158px, pesa de más).

width y height explícitos en las <img> del catálogo (evita
el salto de layout al cargar).

Vista rápida en cada tarjeta (mini-modal sin abrir el modal grande).

Productos relacionados en el modal (4 productos de la misma
categoría, abajo de todo).

Referencia externa
Hay una versión alternativa hecha con Google AI Studio (React + Vite +
Tailwind, componentes separados) en
https://sensational-faloodeh-68f992.netlify.app — el usuario tiene los
archivos fuente por si hacen falta. NO copiar código de ahí (es otro
stack), solo inspirarse en ideas.

Decisiones tomadas (no implementadas)
Nombres de productos con caracteres especiales
Se evaluó agregar un mapeo de nombres (PRODUCT_NAME_OVERRIDES) en
generar-catalogo.mjs para que productos como "X-Men" o "A Perfect
Circle" aparezcan con su grafía exacta (guiones internos, mayúsculas
especiales, símbolos como &, /, ?).

Decisión: NO implementar por ahora. El problema es cosmético
("X Men" en lugar de "X-MEN") y el costo de mantener una tabla
actualizada por producto no lo justifica. Si en el futuro hay muchos
productos con nombres que se vean mal, reevaluar.

Los nombres de carpeta siguen la regla actual: guiones en lugar de
espacios, sin caracteres raros de Windows.

Búsqueda por categoría en el buscador
Se evaluó que el buscador también matchee contra el nombre de la
categoría (escribir "anime" filtra por esa categoría). Decisión:
NO implementar. La barra de categorías está visible y sticky a 15
píxeles del buscador, así que es redundante. Si en el futuro hay
muchas categorías (que la barra se haga scrolleable) o se agregan
tags secundarios (ofertas, ediciones limitadas), reevaluar.

Lupa con seguimiento del mouse en desktop
Se evaluó hacer zoom con una lupa que sigue el cursor (estilo Zara,
Nike) en desktop. Decisión: NO implementar. Requiere imágenes de
alta resolución (las actuales no dan para un zoom 2x sin pixelarse),
es complicado de que se sienta bien en mobile, y agrega bastante JS.
Se implementó en su lugar un overlay a pantalla completa (ver sección
"ZOOM DE IMAGEN").

Decisiones técnicas ya tomadas
No migrar el .bat a npm scripts. Funciona bien, el usuario no domina
terminal, y "si algo anda no se toca".

No usar Content Collections de Astro. El catálogo se genera desde
carpetas de imágenes con un script propio. Funciona bien así.

No usar componentes separados. Todo vive en index.astro para
simplicidad. Si en el futuro crece mucho, se puede refactorizar.

define:vars para pasar base al script. Es la forma oficial de Astro.

:global() para todo lo que cree el JS, y también para elementos
estáticos fuera de <main> (ver advertencia más arriba).

El carrito se guarda en localStorage. Persiste entre visitas.

Talles Regular Fit hasta 5XL, Oversize hasta 2XL.

Los logos se optimizan a WebP automáticamente desde el script.

Las tarjetas del catálogo usan object-fit: cover.

El modal en mobile usa fade puro (no slide) por performance.

El hero va a ancho completo (fuera de <main>).

El fondo tintado va a ancho completo y con clip-path (no
translateX), para no romper el position: sticky de las categorías.

El body tiene overflow-x: clip (no hidden, para no romper el sticky).

El sistema de historial usa una pila (historyStack), no una
variable única. Ver sección "History stack".

Historial de cambios (más reciente arriba)
Sesión 12 — Zoom de imagen + refactor del history lock a pila
Zoom de imagen (feature nueva):

Overlay a pantalla completa con la foto del modal agrandada.

Se abre con click/tap sobre la foto grande del carrusel (modelo o
remera). No sobre las tablas de talles. No desde las tarjetas del
catálogo.

Cierra con: click/tap afuera, botón ×, Escape, o botón atrás del celu.

En mobile se permite pinch-to-zoom nativo; en desktop no hay zoom extra.

Desktop: cursor zoom-in sobre las fotos. Mobile: ícono de lupa
discreto en la esquina inferior derecha.

Fondo negro al 93%, transición de fade corta (220ms).

Se evita que el click de zoom se dispare al hacer swipe (flag
zoomMoved con umbral de 8px).

Refactor del history lock → history stack (importante):

El sistema viejo usaba una variable única (historyLock) con casos
particulares ("si el modal está abierto y se abre el carrito, cambiar
el lock a cart y después volver a modal"). Eso generaba bugs cuando
se apilaban overlays (zoom sobre modal).

Se reemplazó por una pila (historyStack = []). Cada overlay que
se abre hace pushHistory(kind). El popstate saca el último de la
pila y cierra ese overlay. Sin casos particulares.

Funciones nuevas: isTopOfHistory(kind), pushHistory(kind),
popHistory(), closeTopOverlay().

Los closeX() de cada overlay ahora chequean isTopOfHistory(kind)
→ popHistory() → history.back() → popstate → closeXDirect().

Los closeXDirect() ya no tocan el historial (los llama el popstate).

Esto resolvió los bugs de sincronización del botón atrás con overlays
apilados.

Caso conocido: los links compartidos con hash te sacan de la web al
apretar "atrás". Es el comportamiento esperado del navegador (el
usuario llegó desde otro sitio y probablemente quiera volver). No se
va a arreglar.

Sesión 11 — Optimización (mejoras concretas) + "Ver tabla de talles"
Se hizo una tanda de mejoras de optimización y limpieza, tras un
análisis con PageSpeed (79 mobile / 93 desktop, sin urgencia).
Ninguna feature nueva.

Imágenes y performance:

fetchPriority en el hero: la primera imagen (la LCP) lleva
fetchPriority="high" y loading="eager"; las otras 5 llevan
fetchPriority="low" y loading="lazy". Esto bajó el LCP.

decoding="async" agregado a las <img> del modal (#modal-image-a
y #modal-image-b) y a las que se generan dinámicamente en
renderModalImage.

will-change: opacity, transform movido de .hero-bg img (todas)
a .hero-bg img.active (solo la que está animando). Antes había 6
capas de GPU vivas, ahora solo 1. Libera memoria de video en mobile.

og:image:width (1200) y og:image:height (630) agregados al
<head>. Con esto por fin funciona la miniatura en WhatsApp
(era el bug histórico). El og-image.jpg ya estaba en 1200x630.

Limpieza de código:

Eliminado el parche modalAddClone (se clonaba el botón "Agregar
al Pedido" para pisar el listener viejo). Ahora hay un solo
listener directo sobre modalAdd.

--category-color se setea al final de openModal, justo antes
de aria-hidden="false". Antes se seteaba arriba, lo que dejaba
el color del producto anterior pegado si algo fallaba en el medio.

filterProducts ahora tiene debounce de 150ms en el input del
buscador. Con 99 productos no se nota, pero escala.

Borrado el CSS muerto .care-num (no se usaba en el HTML).

box-sizing: border-box aplicado también a *::before y
*::after, no solo a *.

Cambio estético:

El botón "Ver gráfico" se movió de al lado de "Elegí el corte"
a abajo de los botones de talle.

Se renombró a "Ver tabla de talles".

Ahora tiene estilo de botón (borde, fondo oscuro, hover con
--category-color), ya no es un link subrayado.

Clase nueva: .modal-chart-button (con :global(), obvio).

El id sigue siendo #modal-see-chart, así que el JS no se tocó.

Decisiones de NO hacer (con criterio):

Búsqueda por categoría en el buscador: descartada, redundante con
la barra de categorías visible.

Mapeo de nombres de producto (PRODUCT_NAME_OVERRIDES): descartada,
el problema ("X Men" vs "X-MEN") es cosmético y no justifica el
costo de mantenimiento.

Pendientes anotados para el futuro (si alguna vez se quiere):

Regenerar krakoalogo-isotipo.webp a ~180px de ancho (hoy está
a 400px y se muestra a 158px, pesa de más).

width y height explícitos en las <img> del catálogo (evita
el salto de layout al cargar).

Vista rápida en cada tarjeta (mini-modal sin abrir el modal grande).

Productos relacionados en el modal (4 productos de la misma
categoría, abajo de todo).

Sesión 10 — Tinte por categoría, buscador afuera, animaciones del modal
Fondo tintado por categoría:

Nuevo fondo en la sección #catalogo que se pinta con el color de la
categoría activa, con slide direccional (derecha → izquierda) y dos
capas apiladas. Cuando se cambia de categoría, la nueva entra desde la
derecha y la vieja sale hacia la izquierda (no fade).

El tinte va a ancho completo (100vw, left: 50%, translateX(-50%)).

Arranca con top: -13px para dar aire arriba.

El color se toma de --category-color del .category-wrap.

Buscador:

Movido fuera de <section class="catalog">, entre la marquesina y
el catálogo, centrado.

Clase .search-bar envuelta en :global() (Astro no le asignaba el
data-astro-cid).

Ancho: min(420px, 100%).

Barra de categorías:

Centrada horizontalmente (justify-content: center).

Click en el .category-wrap también activa la categoría (no solo el
botón), para que la "sombra" del botón despegado sea clickeable.

En mobile: fondo semitransparente con blur para dejar ver el tinte.

Hero:

Ahora va a ancho completo (sale de <main> con 100vw + translateX).

Se sacó el border-radius.

El contenido interno sigue alineado con el resto.

Modal:

Animación de apertura/cierre: slide + scale en desktop, fade puro en
mobile.

Compensación del ancho de la barra de scroll al abrir el modal (evita
el "salto" del layout en PC).

Botón "Consultar por WhatsApp" reemplazado por "Ver carrito" (abre el
drawer por encima del modal).

Link "Compartir" ahora genera #hash del producto. Al abrir un link
con hash, el modal se abre solo.

Transición direccional entre imágenes: dos capas apiladas, slide
direccional (next/prev) + fade para "Ver gráfico".

El doble requestAnimationFrame para agregar .open reduce el "tirón"
inicial en mobile.

History lock:

Arreglado para el caso del modal por hash (se hace replaceState +
pushState extra para que "atrás" quede en la web).

Arreglado para el caso del carrito sobre modal: openCartDrawer pushea
una entrada extra y cambia el lock a "cart". Al cerrar el carrito, si
el modal sigue abierto, el lock vuelve a "modal".

Se eliminó el listener de hashchange (generaba bucles con el
pushState).

Sesión 9 — Fondo dinámico por categoría + fix de remote
Nuevo fondo tintado en la sección catálogo, con slide de derecha a
izquierda, color según la categoría activa. Dos capas apiladas para que
el cambio entre categorías también sea slide (no fade).

Buscador movido afuera de <section class="catalog">, centrado debajo
de la marquesina.

:global() también en .search-bar.

Fix: el remote de git local apuntaba a krakoa-web (que ahora es el
repo del redirect). Se cambió a barriopuro/krakoa con
git remote set-url origin.

Sesión 8 — Catálogo variado, barra de categorías rediseñada, URL nueva
Catálogo con intercalado round-robin por categoría (no todos los de
una categoría juntos).

Barra de categorías rediseñada inspirada en el CodePen "shadow-button-set"
de Adam Argyle. Botón que se "despega" en hover/activo.

Toggle: tocar el botón ya activo lo desactiva.

Barra de categorías sticky en mobile.

Migración de URL: repo renombrado de krakoa-web a krakoa.

Sesión 7 — Fix back-to-top + Loader inicial (D3)
Fix del botón "volver arriba" (le faltaba el listener de scroll).

Loader de carga inicial con fade in del isotipo sobre fondo oscuro.

Fix crítico del loader: estilos inline para evitar FOUC.

Sesión 6 — Ajustes, Hero con imágenes rotando, Footer completo
Ícono + título en la misma línea en los 4 pilares.

Tarjetas del catálogo con border-radius: 15px + object-fit: cover.

Hero con fondo de imágenes rotando + marquesina.

Footer completo con 3 columnas + partículas.

Fix crítico del footer con :global().

Sesión 5 — Header con menú + fix del botón atrás en mobile
Header desktop y mobile rediseñados.

Menú mobile (drawer).

Fix de los links del menú mobile con history.replaceState.

Sesión 4 — Secciones "Cómo Comprar" y "Calidad y Materiales"
Acordeón de 5 preguntas + bloque de consulta con WhatsApp.

4 pilares + guía de cuidado.

Sesión 3 — Carrito + modal nuevo (Bloque A completo)
Carrito con localStorage, drawer, badge.

Modal rediseñado con 2 columnas, miniaturas, selectores.

History lock para modal y carrito.

Nombres de corte: "Oversize" y "Regular Fit".

Sesión 2 — Deploy fix
Cambio de Source de Pages a "GitHub Actions".

Sesión 1 — Limpieza y des-hardcodeo
Borrados archivos basura.

Fix de formatName() para la "ñ" y acentos.

Rutas de talles con base pasado por define:vars.

Protocolo para abrir chat nuevo
Cuándo: cada ~20-30 mensajes, o al cerrar un bloque grande de trabajo,
o cuando las respuestas del asistente empiecen a sentirse más lentas.

Cómo:

Actualizar este archivo (CONTEXTO-KRAKOA.md) con lo nuevo.

Correr el .bat una última vez para dejar todo subido.

Abrir chat nuevo con el asistente.

Pegar el contenido de CONTEXTO-KRAKOA.md como primer mensaje.

Continuar desde donde quedamos.

Recomendación: hacerlo idealmente al cerrar un bloque (no a mitad).

Convenciones para el asistente
Idioma y tono
Español rioplatense, tono informal pero claro. Evitar tecnicismos
innecesarios; explicar lo técnico con analogías cuando haga falta.

El usuario no programa
No asumir conocimientos de terminal, git, npm, etc. Dar pasos concretos
y verificables.

Cuando el usuario dice "no entendí", simplificar. No debatir opciones.

Formato de los cambios de código
Cuando haya que modificar código, dar los cambios en formato
"buscá X / reemplazá por Y" con bloques de código completos y
claros. El usuario copia y pega, no edita a mano. No dar instrucciones
ambiguas tipo "agregá una línea después de la función X".