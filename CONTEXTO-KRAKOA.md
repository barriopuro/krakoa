# CONTEXTO — Proyecto KRAKOA Web

Este archivo es un resumen del proyecto para pegar al inicio de un chat nuevo
con un asistente de IA. Actualizarlo cuando haya cambios importantes.

## Qué es

Sitio web de catálogo de remeras de la marca KRAKOA.
Stack: Astro 7, HTML + CSS + JavaScript vanilla (sin frameworks).
Deploy: GitHub Pages (repo `barriopuro/krakoa-web`).
URL actual: https://barriopuro.github.io/krakoa-web

El deploy se hace con un workflow de GitHub Actions que corre en cada push
a `main` (`.github/workflows/deploy.yml`). El Source de Pages está en
"GitHub Actions" (NO en "Deploy from a branch").

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
entrada al `categoryConfig`.

## ADVERTENCIA CRÍTICA: `:global()` en Astro

Astro **auto-limita (scoped)** el CSS dentro de `<style>` en un `.astro`,
agregando un atributo random a cada selector. Los elementos HTML estáticos
matchean las reglas; **los elementos que crea el JavaScript NO**, así que
quedan sin estilo (fondo blanco, letra negra, etc. = estilo por defecto).

**Regla de oro:** cualquier elemento que cree el JS (`createElement`,
`innerHTML = ...`, etc.) debe tener sus reglas CSS envueltas en
`:global(selector)`.

**Ampliación importante (Sesión 6):** además del JS, algunos elementos
ESTÁTICOS del HTML también pueden necesitar `:global()`. Caso concreto:
el `<footer class="site-footer">` quedó fuera de `<main>`, y Astro no le
asignó el atributo `data-astro-cid-...`. Resultado: el CSS no le llegaba
(el logo aparecía gigante y el texto sin estilo). Solución: envolver los
selectores del footer en `:global(...)`. Regla general: si un bloque
estático del HTML se ve "sin estilo" y no está dentro de `<main>`,
probarlo con `:global()`.

Ejemplos ya resueltos así en el proyecto:
- `.modal-thumb`, `.modal-thumb:hover`, `.modal-thumb.active`, `.modal-thumb img`
- `.modal-fit`, `.modal-fit strong`, `.modal-fit span`, `.modal-fit:hover`, `.modal-fit.active`, `.modal-fit.active strong`
- `.modal-size`, `.modal-size:hover`, `.modal-size.active`
- Todas las reglas de `.cart-item*`, `.cart-items*`, `.cart-empty*`, `.cart-clear`
- Todas las reglas del `.site-footer` y sus hijos (footer)
- `.hero-bg img` y `.hero-bg img.active` (imágenes del hero que crea el JS)
- `.footer-particle` (partículas que crea el JS)

Si en el futuro algo dinámico o fuera de `<main>` se ve "sin estilo", es esto.

## Cómo funciona el carrito

### Estado y persistencia
- Clave en `localStorage`: `krakoa_cart`
- Estructura de cada item:
  ```js
  { key, name, image, fit, size, quantity, color }
key = ${name}__${fit}__${size} (un item único por modelo+corte+talle).

Si se agrega el mismo modelo+corte+talle, se suma la cantidad al item existente.

cartItems se serializa a JSON y se guarda después de cada cambio.

Al cargar la página, se lee de localStorage y se restauran los items.

Funciones principales (en index.astro)
saveCart() — guarda en localStorage.

getTotalCount() — suma de cantidades.

updateCartBadge() — actualiza el badge del ícono del carrito en el header.

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

Drawer: se desliza desde la derecha. Tiene header, body scrolleable y footer.

Item: foto chica (60x76), nombre, "Corte · Talle X", selector −/+ y botón ×.

Botón "Vaciar lista" arriba de todo.

Footer del drawer: "Total de prendas: N" + botón verde "Enviar Pedido por WhatsApp".

Cómo funciona el modal de producto
Estructura
Layout de 2 columnas en desktop (grid-template-columns: 1.15fr 1fr):

Izquierda: galería (imagen grande + flechas ‹ › + overlay con label y contador + 4 miniaturas).

Derecha: header (categoría con punto de color + título), body (selectores) y footer (botón agregar + acciones).

En mobile (< 800px): una sola columna, el .modal-grid es el único scroller.

Carrusel de imágenes
Son 4 slides siempre:

Modelo (foto de la persona) — ${base}/catalogo/.../modelo.webp

Remera (producto solo) — ${base}/catalogo/.../remera.webp

Talles Oversize — ${base}/talles/oversize.webp

Talles Regular — ${base}/talles/regular.webp

Las rutas de talles se construyen con base (de import.meta.env.BASE_URL)
que se pasa al <script> con define:vars={{ base }}.
NO hardcodear /krakoa-web/... en el script.

Selectores
Corte: Oversize / Regular Fit. Cambiar de corte puede resetear el talle
si el talle actual no existe en el nuevo corte.

Talle: se muestran los del corte activo. En el label "2." al lado
aparece el alto × ancho en cm (ej: "76 cm alto × 59 cm ancho").

Cantidad: botones − / + (mínimo 1, máximo 20).

Tabla de talles (SIZE_CHART en el script)
Regular Fit (alto × ancho en cm):

S: 65 × 45 | M: 67 × 49 | L: 69 × 53 | XL: 71 × 56 | 2XL: 74 × 58

3XL: 76 × 58 | 4XL: 78 × 60 | 5XL: 81 × 62

Oversize (alto × ancho en cm):

S: 72 × 55 | M: 74 × 57 | L: 76 × 59 | XL: 78 × 61 | 2XL: 80 × 63

Nota: el usuario pide mostrar primero el ALTO y después el ANCHO, porque
así está en las imágenes de las tablas.

Colores de categoría
Al abrir el modal, se lee --category-color del .product-category de la
tarjeta y se setea como variable CSS en .modal-content.

Ese color se aplica a: borde de la miniatura activa, botón de corte activo,
botón de talle activo, número "1." y "2." de los labels, botón "Agregar al
Pedido", subrayado del link "Ver gráfico", etc.

Cómo funciona el history lock (botón atrás)
Cuando se abre el modal, el carrito o el menú mobile, se empuja
una entrada falsa al historial (history.pushState). Así el botón "atrás"
del celular cierra el overlay en vez de navegar hacia atrás.

Variables:

historyLock puede valer null, "modal", "cart" o "mobile-menu".

lockHistory(kind) — hace pushState si no había lock, o actualiza el tipo.

releaseHistory() — hace history.back() (dispara el popstate).

window.addEventListener("popstate", ...) — cierra el overlay correspondiente.

Cada overlay tiene 2 funciones de cierre:

closeX() — llama a releaseHistory() si tiene el lock (para que el
atrás no quede colgado cuando el usuario cierra con la X).

closeXDirect() — cierra sin tocar el historial (la usa el popstate).

Caso especial: links del menú mobile
Al tocar un link del menú mobile (#catalogo, #calidad, etc.), NO hacemos
releaseHistory(). En cambio:

history.replaceState(null, "", href) — reemplaza la entrada del menú
por la del hash.

historyLock = null — liberamos sin hacer back.

closeMobileMenuDirect() — cerramos el menú.

window.scrollTo({top, behavior: "smooth"}) — scroll suave con offset
de 20px.

Esto es para que el "atrás" del Android después del scroll vuelva al header
(y no saque al usuario del navegador).

Header y navegación
Desktop (≥ 701px)
Izquierda: logo horizontal (175px).

Centro: nav con links "Catálogo", "Cómo Comprar", "Materiales"
(con href="#catalogo" etc., scroll suave con scroll-behavior: smooth).

Derecha: botón Instagram (ícono rosa + @krakoa.sw) + botón carrito
(fondo blanco, ícono de bolsa + badge).

Mobile (≤ 700px)
Izquierda: logo horizontal (135px).

Centro: (vacío, no hay nav).

Derecha: botón Instagram (solo ícono) + botón carrito + botón hamburguesa.

Al tocar la hamburguesa se abre el menú mobile (drawer desde la derecha)
con links: Catálogo, Cómo Comprar, Materiales, Instagram (con flechita ↗).

Hero con imágenes rotando (D1)
El .hero tiene fondo con imágenes del catálogo que rotan cada ~5.5s.

Las imágenes se eligen al azar en cada visita desde los .webp del catálogo
(hasta 6, barajadas con shuffleArray).

Cada imagen hace un zoom lento + paneo hacia un costado. Las pares (nth-child(even))
panean hacia el otro lado para dar variedad.

Se usa transition sobre transform, NO animation. Con animation,
al sacar la clase .active el navegador borraba la animación y la imagen
"saltaba" al centro antes del fade. Con transition sale suave.

Opacidad de las fotos: 0.32 (configurable).

Debajo del hero hay una marquesina con keywords que se desplaza
infinitamente. El array de textos está en marqueeText en el frontmatter.

Valores para calibrar rápido
Opacidad: opacity: 0.32 en .hero-bg img.active.

Cantidad de fotos: .slice(0, 6) en el JS del hero.

Velocidad de rotación: el 5500 en el setInterval.

Velocidad de la marquesina: el 45s en animation: marqueeScroll.

Intensidad del zoom: scale(1.1) en las transiciones del hero.

Paneo lateral: translateX(±1.5%) en las transiciones del hero.

Footer completo (D2)
Tres columnas:

Logo vertical (krakoalogo-vertical.webp) a 70px (desktop) / 58px (mobile).

Texto institucional (SEO) justificado.

Menú vertical con links: Catálogo, Cómo Comprar, Materiales, Instagram.

Abajo: línea fina con "© KRAKOA" y "@krakoa.sw".

Fondo: partículas blancas tenues que suben lentamente (creadas por JS, con
:global(.footer-particle)). Cantidad: 22 partículas. Velocidad y delays
randomizados. El @keyframes floatUp hace que suban ~420px y se desvanezcan.

IMPORTANTE: todas las reglas CSS del footer van con :global() porque
el <footer> está fuera de <main> y Astro no le asigna el data-astro-cid.

Secciones de la página
Orden de arriba a abajo:

#krakoa-loader — overlay de carga inicial (fade in del isotipo).
                  Va en el <body> antes del header. Estilos inline
                  críticos para evitar FOUC. Ver Sesión 7.


<header class="site-header">

#mobile-menu (drawer, oculto por defecto)

<main>

<section class="hero"> — con fondo de imágenes rotando + título CATALOGO.

<div class="marquee"> — cinta con keywords

<section id="catalogo" class="catalog"> — buscador, categorías, grilla.

<section id="como-comprar" class="faq-section"> — acordeón con 5 preguntas

bloque "¿Tenés una consulta especial?" con botón WhatsApp.

<section id="calidad" class="quality-section"> — 4 pilares (algodón,
estampado, moldería, pre-encogido) + guía de cuidado (4 items, sin números).

#product-modal — modal de producto.

#cart-drawer — drawer del carrito.

<footer class="site-footer"> — footer completo con 3 columnas + partículas.

#back-to-top — botón flotante "↑".

## Secciones pendientes (plan original)

C1: Botón "Modelo / Remera" en cada tarjeta del catálogo (cambia la
foto sin abrir el modal). Inspirado en la versión de Google AI Studio.
El usuario pidió PAUSARLO por ahora, lo va a pensar mejor.

D3: ~~Loader con el logo apareciendo~~ ✅ **HECHO en Sesión 7**

Ideas futuras / deuda técnica

Referencia: hay una versión alternativa hecha con Google AI Studio
(React + Vite + Tailwind, componentes separados) en
https://sensational-faloodeh-68f992.netlify.app — el usuario tiene los
archivos fuente por si hacen falta. NO copiar código de ahí (es otro stack),
solo inspirarse en ideas.

Decisiones técnicas ya tomadas
No migrar el .bat a npm scripts. Funciona bien, el usuario no domina
terminal, y "si algo anda no se toca".

No usar Content Collections de Astro. El catálogo se genera desde
carpetas de imágenes con un script propio. Funciona bien así.

No usar componentes separados. Todo vive en index.astro para
simplicidad. Si en el futuro crece mucho, se puede refactorizar.

define:vars para pasar base al script. Es la forma oficial de Astro.

:global() para todo lo que cree el JS, y también para elementos estáticos
fuera de <main> (ver footer). (Ver advertencia más arriba.)

El carrito se guarda en localStorage. Decisión del usuario: que
persista entre visitas es lo más cómodo.

Talles Regular Fit hasta 5XL. Oversize hasta 2XL.
Regular tiene 8 talles (S, M, L, XL, 2XL, 3XL, 4XL, 5XL).
Oversize tiene 5 talles (S, M, L, XL, 2XL).

Los logos se optimizan a WebP automáticamente desde el script (400px de
ancho máximo, quality 88, effort 6). Los PNG originales NO están en el
repo: el usuario los guarda en una carpeta aparte, fuera de la web. Si
hay que regenerar algún .webp, copiar temporalmente el PNG a
public/logos/, correr el .bat, y borrarlo de nuevo.

Las tarjetas del catálogo usan object-fit: cover (con contain, la
foto no llenaba el contenedor y las esquinas redondeadas no se veían).

Historial de cambios (más reciente arriba)
Sesión 7 — Fix back-to-top + Loader inicial (D3)
Fix del botón "volver arriba" (#back-to-top): el botón ya existía
en el HTML y tenía su CSS con :global(), pero el <script> declaraba
la variable backToTop y nunca le agregaba la clase .visible. Se
agregó el listener de scroll (aparece al pasar los 600px de scrollY)
y el handler del click (scrollTo top con behavior smooth).

D3 implementado: loader de carga inicial con fade in del isotipo
krakoalogo-isotipo.webp sobre fondo oscuro (#0a0a0a). Se ve en
cada carga de página (no se guarda en localStorage). Duración
mínima 700ms (MIN_TIME). Al terminar, se desvanece (0.45s) y se
borra del DOM.

Fix crítico del loader: la primera versión mostraba un flash del
logo en la esquina superior derecha por menos de un frame (FOUC,
flash of unstyled content). El navegador dibujaba el HTML antes de
aplicar el CSS que lo posicionaba. Solución: estilos críticos
inline en el style="" del div y del img (posición, fondo, opacity:0).
El JS no usa clases para mostrar/ocultar, setea style.opacity
directo. Regla para el futuro: los loaders (y cualquier cosa que
deba estar oculta desde el primer frame) NO deben depender del
CSS externo para esconderse; usar estilos inline.


Sesión 6 — Ajustes de estilo, Hero con imágenes rotando, Footer completo
Ícono + título en la misma línea en los 4 pilares de "Materiales"
(wrapper .quality-pillar-head con flex).

Se borraron los números 01, 02, 03, 04 de la "Guía de Cuidado".

Tarjetas del catálogo con border-radius: 15px + object-fit: cover.

D1: Hero con fondo de imágenes del catálogo que rotan cada ~5.5s con
zoom + paneo alternado (izq/der). Las imágenes se eligen al azar en cada
visita desde los .webp del catálogo (hasta 6). Se agregó marquesina
debajo del hero con keywords.

Limpieza: se borraron los PNG fuente de logos de public/logos/
(krakoalogo-horizontal.png, -isotipo.png, -vertical.png). El usuario
los guarda en una carpeta aparte, fuera del repo. Los .webp generados
siguen en public/logos/ y el sitio funciona igual. Si en el futuro hay
que regenerar algún .webp, hay que copiar temporalmente el PNG a
public/logos/, correr el script, y volver a borrarlo.


Fix del salto del hero: se reemplazó animation por transition sobre
transform, así la imagen saliente no se "centra" antes del fade.

D2: Footer completo (3 columnas: logo vertical | texto institucional
justificado | menú vertical) + partículas blancas tenues animadas
subiendo lentamente (creadas por JS con :global).

Fix crítico del footer: los selectores CSS necesitaban :global() porque
el <footer> está fuera de <main> y Astro no le asignaba el
data-astro-cid. Ver "ADVERTENCIA CRÍTICA" más arriba.

Logo del footer cambiado a krakoalogo-vertical.png (luego .webp).

Script: se agregó optimización de logos PNG → WebP. Los .webp se generan
a 400px de ancho (sin agrandar) y quality 88, effort 6. Los PNG originales
se quedan en public/logos/ como fuente, no se borran.

Rutas del HTML actualizadas a .webp para todos los logos.

Sesión 5 — Header con menú + fix del botón atrás en mobile
Header desktop: logo a 175px, nav central con 3 links, Instagram
con ícono, botón carrito.

Header mobile: logo a 135px, Instagram solo ícono, carrito, hamburguesa.

Menú mobile: drawer desde la derecha con links a secciones + Instagram.

Bug fix: links del menú mobile ahora usan history.replaceState +
scrollTo manual (antes rompían el history lock y el "atrás" sacaba
al usuario del navegador).

Limpieza: se borró un bloque duplicado de CSS de la sesión 2
(.header-actions, .cart-button, .cart-count) que estaba pisando
las versiones nuevas y descolocaba el header.

Sesión 4 — Secciones "Cómo Comprar" y "Calidad y Materiales"
B1: Sección "Cómo Comprar" (#como-comprar) con acordeón de 5
preguntas (se sacó la de diseños personalizados porque el usuario no
ofrece ese servicio). Bloque "¿Tenés una consulta especial?" con botón
WhatsApp. Solo una pregunta abierta a la vez.

B2: Sección "Calidad y Materiales" (#calidad) con 4 pilares
(algodón 24/1, estampado DTF, moldería propia, pre-encogido) + guía de
cuidado con 4 items numerados.

Ajuste de espaciados en negritas dentro de párrafos (se pegaban a
palabras adyacentes).

Sesión 3 — Carrito + modal nuevo (Bloque A completo)
A1: Header con ícono de carrito + badge, drawer lateral "Mi Pedido",
persistencia en localStorage. Fix del badge "0" que se mostraba
cuando no correspondía.

A2: Modal rediseñado con layout de 2 columnas, miniaturas, selectores
de corte/talle/cantidad, cm en vivo, colores de categoría aplicados.
Fix de responsive mobile (el .modal-grid es el único scroller).

A3: Conectar modal con carrito real. Agregar, sumar cantidad, eliminar,
vaciar lista, enviar pedido por WhatsApp con formato. Fix del scoping de
Astro (todo lo dinámico va con :global()).

History lock para modal y carrito (botón atrás del celular los cierra).

Nombres de corte: "Oversize Boxy" → "Oversize", "Regular Classic" →
"Regular Fit" (así están en las imágenes de las tablas).

Sesión 2 — Deploy fix
Se descubrió que el Source de Pages estaba en "Deploy from a branch"
y mostraba el README de Astro. Se cambió a "GitHub Actions".

Se aprendió que el workflow solo se dispara con push a main (no tiene
workflow_dispatch), así que hay que hacer un cambio real y correr el
.bat.

Sesión 1 — Limpieza y des-hardcodeo
A1: Borrados archivos basura: src/components/Welcome.astro,
src/layouts/Layout.astro, src/assets/astro.svg,
src/assets/background.svg.

A2: Arreglado formatName() en generar-catalogo.mjs para que maneje
correctamente la "ñ" y letras acentuadas (antes "El Señor" salía "El SeñOr").

A3: Estandarizado color de "comics" a minúscula (#e84393).

A4: Borrada variable modalCounter no usada en index.astro.

B: Rutas de talles ya no están hardcodeadas. Ahora usan base pasado
al script con define:vars. Si cambia el dominio, todo se adapta solo.

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
Idioma: español rioplatense, tono informal pero claro. Evitar tecnicismos
innecesarios; explicar lo técnico con analogías cuando haga falta.

El usuario no programa. No asumir conocimientos de terminal, git, npm,
etc. Dar pasos concretos y verificables.

Al dar instrucciones de edición: indicar claramente el archivo,
qué línea buscar (o el texto distintivo más corto posible) y qué
reemplazar o agregar. EVITAR espacios al inicio de los bloques al
decir "buscá esto", porque el buscador de VS Code es literal y no
encuentra nada. Mejor dar una línea corta y distintiva.

Cambios chicos y verificables. Preferir varias iteraciones cortas antes
que una grande. Después de cada cambio, indicar cómo probarlo.

No romper el flujo del .bat. Es la parte más sensible del proyecto.

Respetar la estructura de un solo archivo (index.astro). No proponer
refactorizaciones grandes sin acordarlo antes.

El usuario usa Edge en Windows. Los atajos son F12 (o Ctrl+Shift+I)
para DevTools y Ctrl+Shift+M para modo dispositivo (mobile).

El usuario tiene buen ojo. Detecta detalles finos (colores, espaciados,
comportamientos raros). Vale la pena escucharlo.

Si algo se ve "sin estilo" de golpe, la primera sospecha es el scoping
de Astro: probar :global(). (Ver ADVERTENCIA CRÍTICA.)