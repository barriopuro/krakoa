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
│ ├── logos/
│ ├── favicon.ico / favicon.svg
│ └── og-image.jpg
│
├── scripts/
│ └── generar-catalogo.mjs ← convierte jpg→webp y regenera catalogo.json
│
└── src/
├── data/catalogo.json ← generado automáticamente
└── pages/index.astro ← TODA la web (HTML + CSS + JS en un solo archivo)

text

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

Ejemplos ya resueltos así en el proyecto:
- `.modal-thumb`, `.modal-thumb:hover`, `.modal-thumb.active`, `.modal-thumb img`
- `.modal-fit`, `.modal-fit strong`, `.modal-fit span`, `.modal-fit:hover`, `.modal-fit.active`, `.modal-fit.active strong`
- `.modal-size`, `.modal-size:hover`, `.modal-size.active`
- Todas las reglas de `.cart-item*`, `.cart-items*`, `.cart-empty*`, `.cart-clear`

Si en el futuro algo dinámico se ve "sin estilo", es esto.

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

Secciones de la página
Orden de arriba a abajo:

<header class="site-header">

#mobile-menu (drawer, oculto por defecto)

<main>

<section class="hero"> — solo tiene <h1>CATALOGO.</h1>

<section id="catalogo" class="catalog"> — buscador, categorías, grilla.

<section id="como-comprar" class="faq-section"> — acordeón con 5 preguntas

bloque "¿Tenés una consulta especial?" con botón WhatsApp.

<section id="calidad" class="quality-section"> — 4 pilares (algodón,
estampado, moldería, pre-encogido) + guía de cuidado (4 items numerados).

#product-modal — modal de producto.

#cart-drawer — drawer del carrito.

<footer> — barra simple con "KRAKOA" + @krakoa.sw.

#back-to-top — botón flotante "↑".

Secciones pendientes (plan original)
C1: Botón "Modelo / Remera" en cada tarjeta del catálogo (cambia la
foto sin abrir el modal). Inspirado en la versión de Google AI Studio.

D1: Hero con imágenes rotando (fondo con zoom suave) + marquesina
debajo del hero con keywords ("Envíos a todo el país / 100% algodón /
Cortes Oversize y Regular / ...").

D2: Footer completo con columnas (brand, categorías, info) + puntitos
animados de fondo.

D3: Loader con el logo que va apareciendo a medida que carga la página
(idea del usuario, no está en la versión de Google AI).

Referencias: hay una versión alternativa hecha con Google AI Studio
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

:global() para todo lo que cree el JS. (Ver advertencia más arriba.)

El carrito se guarda en localStorage. Decisión del usuario: que
persista entre visitas es lo más cómodo.

Talles Regular Fit hasta 5XL. Oversize hasta 2XL.
Regular tiene 8 talles (S, M, L, XL, 2XL, 3XL, 4XL, 5XL).
Oversize tiene 5 talles (S, M, L, XL, 2XL).

Historial de cambios (más reciente arriba)
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
src/layouts/Layout.astro, src/assets/astro.svg, src/assets/background.svg.

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

Cambios chicos y verificables. Preferir varias iteraciones cortas antes
que una grande. Después de cada cambio, indicar cómo probarlo.

No romper el flujo del .bat. Es la parte más sensible del proyecto.

Respetar la estructura de un solo archivo (index.astro). No proponer
refactorizaciones grandes sin acordarlo antes.

El usuario usa Edge en Windows. Los atajos son F12 (o Ctrl+Shift+I)
para DevTools y Ctrl+Shift+M para modo dispositivo (mobile).

El usuario tiene buen ojo. Detecta detalles finos (colores, espaciados,
comportamientos raros). Vale la pena escucharlo.