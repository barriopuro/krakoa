CONTEXTO — Proyecto KRAKOA Web
Este archivo es un resumen del proyecto para pegar al inicio de un chat nuevo
con un asistente de IA. Actualizarlo cuando haya cambios importantes.

Qué es
Sitio web de catálogo de remeras de la marca KRAKOA.
Stack: Astro 7, HTML + CSS + JavaScript vanilla (sin frameworks).
Deploy: GitHub Pages (repo barriopuro/krakoa).
URL actual: https://barriopuro.github.io/krakoa

El deploy se hace con un workflow de GitHub Actions que corre en cada push
a main (.github/workflows/deploy.yml). El Source de Pages está en
"GitHub Actions" (NO en "Deploy from a branch").

Nota: existe un segundo repo barriopuro/krakoa-web que solo contiene
un index.html con un redirect automático a la URL nueva. Es para que
los links viejos que se hayan compartido sigan funcionando. No tiene
código del sitio.

IMPORTANTE: el remote de git local apunta a barriopuro/krakoa (no a
-web). Si alguna vez hay que pushear y GitHub rechaza, chequear con
git remote -v.

Estructura de archivos relevantes
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
│ ├── remera.jpg
│ └── extra-*.jpg (opcionales)
│
├── talles/ ← imágenes de tablas de talles (jpg)
│ ├── oversize.jpg
│ └── regular.jpg
│
├── promo/ ← imágenes de promo + config.json
│ ├── config.json
│ └── (imágenes .jpg)
│
├── public/ ← lo que se sirve en el sitio
│ ├── catalogo/<categoria>/<modelo>/.webp (generado automáticamente)
│ ├── talles/.webp (generado automáticamente)
│ ├── promo/.webp (generado automáticamente)
│ ├── logos/
│ │ ├── krakoalogo-horizontal.webp
│ │ ├── krakoalogo-isotipo.webp
│ │ └── krakoalogo-vertical.webp
│ │ (los PNG fuente NO viven en el repo. Si hay que
│ │ regenerar los .webp: copiar temporalmente el PNG a
│ │ public/logos/, correr el .bat, y volver a borrarlo.)
│ ├── favicon.ico / favicon.svg
│ └── og-image.jpg
│
├── scripts/
│ └── generar-catalogo.mjs ← convierte jpg→webp, optimiza logos PNG→WebP, regenera catalogo.json + promo.json
│
└── src/
├── data/catalogo.json ← generado automáticamente
├── data/promo.json ← generado automáticamente
└── pages/index.astro ← TODA la web (HTML + CSS + JS en un solo archivo)

Importante: todo el sitio vive en src/pages/index.astro. No hay
componentes separados ni layouts en uso.

Flujo de trabajo del usuario (para publicar)
Agregar fotos nuevas en catalogo/<categoria>/<nuevo-modelo>/

modelo.jpg (foto del modelo con la remera)

remera.jpg (foto del producto solo)

Cerrar npm run dev si está abierto (importante, sino el build puede
tirar warnings raros).

Doble click en ACTUALIZAR WEB.bat

Escribir una descripción del cambio cuando la pida

Esperar ~1-2 min. GitHub Actions publica solo.

El .bat hace: generar catálogo → build → git add/commit/push.

Categorías actuales
Definidas en scripts/generar-catalogo.mjs en el objeto categoryConfig.
Cada una tiene name (visible) y color (hex para el punto de color).

anime → "Anime" (#e53935)

comics → "Comics" (#e84393)

cine-series → "Cine y Series" (#f2c94c)

deportes → "Deportes" (#f2994a)

musica → "Música" (#2f80ed)

videojuegos → "Videojuegos" (#27ae60)

otros → "Otros" (#bb86fc)

Para agregar una categoría nueva: crear carpeta en catalogo/ y agregar
entrada al categoryConfig. El catálogo se ordena con un intercalado
round-robin por categoría (no todos los de una categoría juntos).

⚠️ ADVERTENCIA CRÍTICA: :global() en Astro
Este es el problema que más tiempo nos hizo perder en todo el proyecto.
Leer entero antes de escribir CSS nuevo.

El problema
Astro auto-limita (scoped) el CSS dentro de <style> en un .astro,
agregando un atributo random (data-astro-cid-...) a cada selector.
El CSS solo matchea elementos que tienen ese atributo. Los elementos
que crea el JavaScript (createElement, innerHTML, etc.) NO lo
tienen, así que quedan sin estilo (fondo blanco, letra negra, etc. =
estilo por defecto).

Además, Astro a veces se "saca" el atributo de encima en casos que no
son obvios: pseudo-elementos, selectores compuestos con :hover,
elementos fuera de <main>, etc.

La regla nueva (mucho más amplia que antes)
Ante la duda, envolver en :global(). Es más seguro y nos ahorra
una ronda de debugging.

Casos que SIEMPRE llevan :global():

Elementos creados por JS (createElement, innerHTML).

Clases que agrega o quita JS sobre elementos estáticos: .glitching,
.active, .flash-green, .flash-red, .banner-green, .banner-red,
.hero-cursor, .is-zoomable, .visible, .leaving, .open, etc.

Elementos fuera de <main>: footer, header, modales, drawers,
overlays, promo, menú mobile.

Pseudo-elementos (::before, ::after) que combinan HTML estático
con cosas que maneja el JS (ej: el glitch del h1, el ícono de lupa
del zoom).

Selectores compuestos con :hover que combinan dos clases
(ej: :global(.product-button:hover .product-overlay)).

Cualquier selector donde una de las clases la maneja el JS, aunque
el elemento base sea estático.

Casos que NO llevan :global():

Elementos HTML estáticos, dentro de <main>, cuyas clases NO toca el JS.

Ejemplo: .cart-price-summary, .cart-subtotal-line, .cart-shipping-line,
.cart-unit-line (son estáticos, el JS solo cambia textContent pero
no toca classList).

Cómo detectar el problema rápido
Si algo "no toma estilo" y vive cerca de JS o fuera de <main>,
envolver en :global() ANTES de investigar otra cosa. No perder
tiempo leyendo el CSS, ni probando en DevTools. :global() primero,
preguntas después.

Casos especiales del proyecto
<h1> del hero: tiene mezcla de todo (texto estático, spans que
modifica el JS, pseudo-elementos para el glitch, clase .glitching que
agrega el JS). TODO lo que lo toca va con :global().

<footer>: entero con :global(), incluidas sus partículas.

.search-bar: aunque está dentro de <main>, Astro no le asigna
el atributo. Siempre con :global().

Modal, carrito, zoom, menú mobile, promo: todos con :global().

<img class="modal-image-el"> del modal: con :global() porque
las clases dinámicas (active, enter-from-right, etc.) las maneja
el JS.

💰 Sistema de precios (NUEVO en Sesión 16)
Los tiers
Los precios NO dependen del producto, del corte ni del talle. Dependen
únicamente de la cantidad total de prendas del pedido. Están
definidos en PRICE_TIERS dentro del <script> de index.astro:

js
const PRICE_TIERS = [
  { min: 1, max: 1,        price: 25000, label: "1 remera" },
  { min: 2, max: 4,        price: 23000, label: "2 a 4 remeras" },
  { min: 5, max: Infinity, price: 20000, label: "5 o más" },
];
Regla clave: el descuento se aplica al total de prendas del pedido,
no por renglón. Si alguien tiene 3 modelos distintos, las 3 salen a
$23.000 c/u.

Precios SIN envío. El envío se calcula aparte, se coordina por
WhatsApp y lo paga el comprador.

Funciones helper (en index.astro)
formatPrice(value) → 25000 a "$25.000" (formato es-AR con punto de miles).

getUnitPrice(totalQuantity) → precio unitario según la cantidad total.
Devuelve el precio del primer tier si la cantidad es 0.

getNextTier(totalQuantity) → { ...tier, unitsNeeded } del próximo
tier, o null si ya está en el máximo.

Dónde se ve el precio
NO en las tarjetas del catálogo (decisión tomada: sobrecarga visual).

En el modal (bloque de precio):

Ubicación: columna derecha, después del selector de cantidad y antes
del botón "Agregar al Pedido".

Siempre visible, con tabla chica de 3 filas (11.5px) y fila activa
resaltada.

Precio grande (24px) en color de la categoría (--category-color).

Texto chico de contexto: "Llevás X remeras" (carrito vacío) o
"Tu pedido queda en X remeras" (con items).

Badge verde "Agregá X más y todas salen a $Y" cuando faltan ≤3 unidades
para el próximo tier.

"Total del pedido: $X" + "(sin envío)" al pie.

Flash verde cuando el unitario baja (cruzó a un tier mejor).

Flash rojo cuando el unitario sube (bajó de cantidad).

Sin flash al abrir el modal (lastUnitPrice se resetea a null).

El bloque calcula con la cantidad proyectada (carrito actual +
lo que está eligiendo en el modal). El usuario ve el precio que le
quedaría si agrega.

En el carrito (drawer):

Cada ítem muestra solo el total de su línea (cantidad × unitario).
No repite el unitario porque es el mismo para todos.

Footer:

Banner verde/rojo temporal (4s) cuando cambia el tier.

Línea X prendas × $Y c/u (con flash verde/rojo cuando cambia el unitario).

Subtotal prendas: $Z.

Envío: A coordinar (en gris itálica, sin monto).

Sin total cerrado. Es a propósito: el envío no está calculado,
no se muestra un número final que no es real.

Botón "Enviar Pedido por WhatsApp".

En el mensaje de WhatsApp:

Desglose por ítem: nombre, corte, talle, cantidad, precio unitario, subtotal.

Al pie: subtotal de prendas, precio por unidad aplicado, envío a coordinar.

Cierre: "¿Tienen disponibilidad y cómo coordinamos pago y envío? ¡Gracias!".

Contador en "Ver carrito" (modal)
El botón "Ver carrito" del modal muestra el total de prendas:
"Ver carrito" si hay 0, "Ver carrito (N)" si hay N. Se actualiza
desde updateCartBadge(), que es la única función que corre en todos
los cambios del carrito (agregar, quitar, cambiar cantidad, vaciar, y
la carga inicial). Cubre todos los casos de una.

Cobro online: decisión tomada
No cobrar online por ahora. El pago se sigue coordinando por WhatsApp.

Métodos considerados:

Transferencia por alias/CBU a la cuenta de Mercado Pago (recomendado
como método principal): comisión $0, acreditación inmediata. Financia
la producción sin costo extra.

Link de pago de Mercado Pago (opción secundaria para clientes con
tarjeta): comisión ~6.60% + IVA en Buenos Aires con acreditación al
instante. Se absorbe del margen, no se le suma al cliente (está
regulado).

NO integrar Mercado Pago en la web todavía. Es un proyecto aparte
(credenciales, webhooks, manejo de rechazos, etc.) que no se justifica
con ventas bajas. Si en el futuro se decide, el orden sería: link manual
→ Checkout Pro → Checkout API.

Cómo funciona el carrito
Estado y persistencia
Clave en localStorage: krakoa_cart

Estructura de cada item:

js
{ key, name, image, fit, size, quantity, color }
key = ${name}__${fit}__${size} (un item único por modelo+corte+talle).
OJO: si en el futuro se agrega selector de color, el key tiene que
incluir el color, y se rompe la compatibilidad con localStorage viejo.

Si se agrega el mismo modelo+corte+talle, se suma la cantidad.

cartItems se serializa a JSON y se guarda después de cada cambio.

Al cargar la página, se lee de localStorage y se restauran los items.

Funciones principales (en index.astro)
saveCart() — guarda en localStorage.

getTotalCount() — suma de cantidades.

updateCartBadge() — actualiza el badge del header y el contador
de "Ver carrito" del modal.

addToCart(product) — agrega o suma cantidad.

removeFromCart(key) — borra un item. Llama renderCartDrawer(true)
(anima el flash/banner si cambia el tier).

changeQuantity(key, delta) — suma/resta cantidad (si llega a 0, borra).
Llama renderCartDrawer(true).

clearCart() — vacía todo.

renderCartDrawer(animate = false) — regenera el HTML del drawer.
Con animate = true (interacción adentro del drawer), dispara el
flash y el banner si el unitario cambió respecto del render anterior.
Variables de estado: lastCartUnitPrice (para detectar cambio de tier)
y cartTierBannerTimer (para cancelar el timer del banner anterior).

flashCartUnitLine(isCheaper) — flash verde o rojo en la línea
X prendas × $Y c/u.

showCartTierBanner(total, unitPrice, isCheaper) — banner temporal
4s arriba del resumen de precios.

buildWhatsAppOrderMessage() — arma el texto del pedido con el desglose
nuevo (precio unitario + subtotal por ítem).

WhatsApp
Número: 5491132372306 (definido en WHATSAPP_NUMBER).

El mensaje se arma con encodeURIComponent y se abre con
window.open('https://wa.me/...', '_blank').

Cierre del mensaje: "¿Tienen disponibilidad y cómo coordinamos pago
y envío? ¡Gracias!" (genérico, para no cerrar la puerta a ningún
método de pago).

UI
Header: ícono de bolsa + badge (aparece solo cuando hay items).

Drawer: se desliza desde la derecha. Header, body scrolleable y footer.

Item: foto (60x76), nombre, "Corte · Talle X", selector −/+ y botón ×.
A la derecha del selector, el total de la línea.

Botón "Vaciar lista" arriba de todo.

Footer del drawer (de arriba a abajo): banner temporal (si aplica),
X prendas × $Y c/u, Subtotal prendas, Envío: A coordinar, botón
verde "Enviar Pedido por WhatsApp".

z-index (importante para overlays apilados)
Modal: 1000.

Flechas de producto del modal (desktop): 1010.

Carrito: 1100.

Menú mobile: 1200.

Promo: 1250.

Zoom de imagen: 1300 (arriba de todo).

Barra de categorías sticky: 100.

El carrito se puede abrir desde el modal (botón "Ver carrito") y queda
por encima. Al cerrarlo, el modal sigue abierto detrás.

Cómo funciona el modal de producto
Estructura
Layout de 2 columnas en desktop (grid-template-columns: 1.15fr 1fr):

Izquierda: galería (imagen grande + flechas ‹ › + overlay con label
y contador + 4 miniaturas).

Derecha: header (categoría con punto de color + título), body
(selectores + bloque de precio) y footer (botón agregar + acciones).

En mobile (< 800px): una sola columna, el .modal-grid es el único scroller.

Contenido del body (de arriba a abajo)
Corte: Oversize / Regular Fit. Cambiar de corte puede resetear
el talle si el actual no existe en el nuevo corte.

Talle: se muestran los del corte activo. En el label "2." al lado
aparece el alto × ancho en cm (ej: "76 cm alto × 59 cm ancho").

Ver tabla de talles: botón que salta a la tabla del corte actual.

Cantidad: botones − / + (mínimo 1, máximo 20).

Bloque de precio (ver sección "Sistema de precios").

El aviso de tela ("100% Algodón Peinado...") se eliminó del modal
en la Sesión 16. Esa info sigue en la sección "Calidad y Materiales"
y en el footer institucional. Si en el futuro se quiere recuperar como
una línea fina, iría debajo del bloque de precio.

Carrusel de imágenes
Slides: modelo, remera, extras (si hay), y SIEMPRE al final las 2 tablas
de talles (oversize y regular). Hay dos <img> apiladas (#modal-image-a
y #modal-image-b) para animar la transición. modalImageActive indica
cuál está visible.

Transición direccional entre imágenes
renderModalImage(direction) recibe "next", "prev" o "fade".

"next" → la nueva entra desde la derecha, la vieja sale hacia la izquierda.

"prev" → al revés.

"fade" → solo crossfade, sin desplazamiento (lo usa "Ver tabla de talles").

Duración 0.32s, curva cubic-bezier(0.22, 1, 0.36, 1).

Flechas para cambiar de producto (Sesión 16)
Desktop grande (≥ 1281px): flechas cuadradas afuera del modal, a los
costados de la pantalla, centradas verticalmente. 60×60px, border-radius: 12px, borde con --category-color, hover pintado del color de la
categoría. Icono ‹/› y label "Anterior"/"Siguiente" (label a 6px).

≤ 1280px (tablets, laptops chicas, mobile): las flechas externas
desaparecen y aparecen dentro del .modal-info-header, a los lados del
título. Cuadradas 44×44px, border-radius: 8px, también con borde de
color de la categoría. Mismo look que antes pero con el borde tintado.

Por qué el breakpoint está en 1280px: el modal mide 1100px con
margen 24px a cada lado, así que una flecha externa de 60px + 24px
de separación necesita ~1268px de viewport. A 1280px ya empieza a tocar.
Antes estaba en 800px y las flechas se superponían al modal en laptops
de 900-1280px.

Animación de cambio: fade + slide horizontal del .modal-grid
(clases .switching-next/.switching-prev y .switching-in-next/
.switching-in-prev). Diferente a la del carrusel.

Orden de navegación: el orden ACTUAL del DOM (alfabético si hay
categoría activa, aleatorio si es el home). Se consulta
document.querySelectorAll("#products .product-card") en vivo, NO
el NodeList products (que no se actualiza al reordenar con appendChild).

Wrap-around: del último al primero.

Reset de selectores al cambiar: Oversize, L, 1.

Scroll interno del modal vuelve arriba en mobile.

Teclado: Shift + ← / → cambia de producto. ← / → cambia de imagen.

Si el zoom estaba abierto, se cierra antes de cambiar.

Envía evento Clarity view_<producto> al cambiar.

Flag isSwitchingProduct para evitar doble click.

Los colores de la categoría se actualizan en las flechas al cambiar
de producto (el JS setea --category-color en #product-modal, y las
flechas lo heredan aunque estén position: fixed afuera del modal).

Colores de categoría
Al abrir el modal, se lee --category-color del .product-overlay de la
tarjeta (antes era del .product-category, se movió en Sesión 16
para que el degradado de la tarjeta lo pueda usar) y se setea como
variable CSS en .modal-content.

Ese color se aplica a: borde de la miniatura activa, botón de corte activo,
botón de talle activo, número "1." y "2." de los labels, botón
"Agregar al Pedido", botón "Ver carrito", subrayado de "Ver tabla de talles",
borde de las flechas de producto (desktop y mobile), precio grande del
bloque de precio, fila activa de la tabla de tiers, etc.

OJO: hay dos lugares del JS que leen --category-color: openModal
y loadProductIntoModal. Ambos leen del .product-overlay (no del
.product-category). Si se mueve de nuevo, actualizar los dos.

Animación de apertura/cierre
Desktop: el modal entra con translateY(60px) scale(0.97) → 0/1
y opacity 0 → 1. Duración 0.42s, curva cubic-bezier(0.22, 1, 0.36, 1).

Mobile: fade puro (sin transform). El slide se veía trabado en muchos
celus por el costo del re-layout del contenido. Duración 0.3s.

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
"Agregar al Pedido" (abajo del bloque de precio).

"Ver carrito" — abre el drawer del carrito por encima del modal.
Muestra el contador de prendas: "Ver carrito (N)" cuando hay items,
"Ver carrito" cuando está vacío. Se actualiza desde updateCartBadge().

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

ZOOM DE IMAGEN
Qué es
Overlay a pantalla completa con la foto del modal agrandada, para que el
usuario pueda ver el detalle.

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
Solo los slides de fotos (modelo, remera, extras). No las tablas de talles.
Se controla con isZoomableSlide(index, total) → index < total - 2
y la clase .is-zoomable en .modal-image-wrapper (se togglea en
renderModalImage).

Formas de cerrar
Click/tap en cualquier parte del overlay (con lógica de pointerdown +
pointerup para evitar cierres accidentales si el toque empieza sobre
la imagen y termina afuera, o al revés).

Click sobre la imagen en desktop (pointerup con pointerType === "mouse"
sobre la imagen). En mobile NO, para permitir pinch-to-zoom nativo.

Botón × en la esquina superior derecha.

Tecla Escape.

Botón atrás del celular (vía la pila del historial).

Evitar que el click de zoom se dispare al hacer swipe
En mobile, el usuario puede estar haciendo swipe en el carrusel.
Se usa un flag zoomMoved que se activa si el dedo se movió más de 8px
en touchstart → touchmove. Si se movió, el click no abre el zoom.

Navegación con el zoom abierto
Flechas ‹ › visibles a los lados de la imagen (pegadas a la imagen,
no a los bordes de la pantalla, vía .image-zoom-stage en flex).

Swipe izquierda/derecha en mobile.

Teclado ← → en desktop.

El zoom tiene su propio índice (zoomImageIndex) y su propia lista
de índices zoomeables (zoomableIndices, derivada de isZoomableSlide).
Es independiente del carrusel del modal: cambiar de foto en el
zoom NO mueve el slide del modal que está detrás.

Bug fix importante (flechas del zoom)
Las flechas del zoom se disparan con pointerdown (no con click) y
hacen stopPropagation. El overlay del zoom tiene un listener de
pointerdown/pointerup para cerrar con click afuera; sin el
stopPropagation, el pointerup agarraba el click en la flecha y
cerraba el zoom.

Funciones
openImageZoom(startIndex) — abre el overlay y hace pushHistory("image-zoom").

closeImageZoom() — cierra vía popHistory() si está en el tope
de la pila, o directo si no.

closeImageZoomDirect() — cierre real (la llama el popstate).

showZoomPrev() / showZoomNext() — navegación entre fotos zoomeables.

History stack (botón atrás) — REFACTOR IMPORTANTE
Qué es
Sistema que hace que el botón "atrás" del celular cierre el overlay que
está arriba de todo (modal, carrito, zoom, menú, promo) en vez de salir
de la web.

Cómo funciona
historyStack es un array de strings (no una variable única).

Cada overlay que se abre hace pushHistory("modal" | "cart" | "image-zoom" | "mobile-menu" | "promo"), que hace history.pushState(...) y
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

Derecha: buscador (input 200px), botón Instagram (ícono rosa + @krakoa.sw),
botón carrito.

Tablet (≤ 1000px)
Buscador de 150px.

Instagram sin label (solo ícono).

Mobile (≤ 700px)
Izquierda: logo horizontal (115px).

Centro: (vacío, no hay nav).

Derecha: botón lupa, botón Instagram (solo ícono), botón carrito,
botón hamburguesa.

Al tocar la lupa, el header se transforma en "input + ×" (clase
.search-open en .site-header). El logo, nav, Instagram, carrito,
menú y lupa se ocultan; el input ocupa todo el ancho con foco automático.
El botón × (.search-close) cierra el buscador, limpia el input y
restaura el catálogo (filterProducts()). Escape también cierra.

Al tocar la hamburguesa se abre el menú mobile (drawer desde la derecha)
con links: Catálogo, Cómo Comprar, Materiales, Instagram (con flechita ↗).

Hero con imágenes rotando + glitch + typewriter (Sesión 16)
Fondo con imágenes rotando
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

Título: glitch + typewriter + cursor (Sesión 16)
El <h1> del hero tiene tres efectos combinados:

HTML:

html
<h1 data-text="CATALOGO."><span id="hero-text">CATALOGO</span><span id="hero-cursor" class="hero-cursor">.</span></h1>
Cursor titilante: el span .hero-cursor (el punto final) titila
con animation: cursorBlink 1s step-end infinite. Todo el CSS del
cursor va con :global() porque está dentro del h1 y combina con JS.

Glitch (aleatorio cada 5-9s): cuando el JS agrega la clase
.glitching al h1, los pseudo-elementos ::before y ::after copian
data-text con content: attr(data-text) y hacen una animación de
280ms con clip-path + transform (efecto chromatic aberration +
slices). Colores: #ff0055 (magenta) y #00fff0 (cian). Duración 280ms,
5 fotogramas con steps(5, end).

TODO el CSS del glitch va con :global(): :global(h1::before),
:global(h1::after), :global(h1.glitching)::before, etc.

Typewriter (aleatorio cada 8-14s): el título se "borra" letra por
letra, se escribe "KRAKOA", se mantiene 700ms, se borra, y se vuelve
a escribir "CATALOGO". Duración por letra: 80ms al escribir, 45ms al
borrar. Función setText(content) actualiza #hero-text y
h1.dataset.text (para que el glitch pinte el texto actual). Si el
glitch está activo, fuerza reflow para que attr() re-evalúe.

Los tres efectos respetan prefers-reduced-motion: reduce.

Si el glitch cae durante el tipeo, pinta el texto parcial (ej: "KRA").
Es copado y es intencional. Si se quiere desactivar, agregar un chequeo
de isAnimating en el glitch.

Valores para calibrar el hero
Opacidad de fotos: opacity: 0.32 en .hero-bg img.active.

Cantidad de fotos: .slice(0, 6) en el JS del hero.

Velocidad de rotación: el 5500 en el setInterval.

Velocidad de la marquesina: el 45s en animation: marqueeScroll.

Intensidad del zoom: scale(1.1) en las transiciones del hero.

Paneo lateral: translateX(±1.5%).

Glitch: GLITCH_DURATION = 280, MIN_DELAY = 5000, MAX_DELAY = 9000.

Typewriter: TYPE_DELAY = 80, ERASE_DELAY = 45, HOLD_ALT = 700,
MIN_CYCLE = 8000, MAX_CYCLE = 14000.

Cursor: cursorBlink 1s en CSS.

Marquesina
Debajo del hero hay una marquesina con keywords que se desplaza
infinitamente. El array de textos está en marqueeText en el frontmatter.

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

hideTint() — desactiva el tinte (cuando el usuario deselecciona
la categoría).

commitTintSwap() — fuerza el fin de un swap en curso.

Buscador
El buscador está en el header (dentro de .header-actions), a la
izquierda del botón de Instagram. Tiene un #search (input) y un
.search-toggle (botón lupa, solo mobile).

Clase .search-bar envuelta en :global() (Astro no le asignaba el
data-astro-cid). Aunque ahora vive en el header, la regla de
:global() se mantiene por seguridad.

Filtra por nombre (product.dataset.name) y por tags (product.dataset.tags).
Soporta multi-palabra con AND (cada término se busca por separado).

Tiene debounce de 150ms.

En mobile, el botón × cierra, limpia el input y restaura el catálogo.

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

Sticky en desktop y mobile: position: sticky; top: 0; z-index: 100,
fondo rgba(11, 11, 11, 0.72) con backdrop-filter: blur(10px) para
dejar ver el tinte detrás. En desktop también (se sacó del @media max-width: 700px en la Sesión 14).

Ancho completo de la pantalla con margin-inline: -5vw.

Tarjetas del catálogo (Sesión 16)
Dos imágenes apiladas (hover en desktop)
Cada tarjeta tiene DOS <img> apiladas:

.product-image-base → modelo.webp (visible por defecto).

.product-image-hover → remera.webp (oculta con opacity: 0).

En hover (desktop, ≥ 901px):

La base se desvanece con scale(1.015).

La hover aparece con scale(1.015) → scale(1).

Duración 0.6s, curva cubic-bezier(0.4, 0, 0.2, 1).

Calibración importante: la curva cubic-bezier(0.4, 0, 0.2, 1) y el
zoom suave (1.015 en lugar de 1.04) hacen que la transición se
sienta como un crossfade en lugar de un "zoom cruzado" brusco. Si se
toca, mantener estos valores. La curva anterior (cubic-bezier(0.22, 1, 0.36, 1)) arrancaba demasiado rápido y se sentía como un salto.

La imagen hover se renderiza siempre en el HTML con loading="lazy",
pero en mobile se oculta con display: none (no se descarga ni se
muestra).

Overlay con degradado tintado + animación de salida
El .product-overlay (categoría + título) tiene:

Degradado tintado con color-mix: mezcla el --category-color
con negro semitransparente. El --category-color está en el
.product-overlay (no en .product-category, se movió en Sesión 16).
Stops: 50% color al 0%, 18% color al 45%, 0% al 100%.

Animación de salida en hover (desktop ≥ 901px): el overlay se
desliza hacia abajo (transform: translateY(100%)) y se desvanece
(opacity: 0), con transición de 0.55s + 0.45s con curva
cubic-bezier(0.4, 0, 0.2, 1). Al sacar el mouse, sube desde abajo.

pointer-events: none para que el hover y el click sigan
funcionando en la imagen.

El selector de hover va con :global():
:global(.product-button:hover .product-overlay).

Grilla full-width
.products usa position: relative + left: 50% +
transform: translateX(-50%) + width: 100vw para escapar del main
(que tiene max-width 1400px) y ocupar todo el ancho de la ventana.

Columnas: repeat(auto-fill, minmax(260px, 1fr)) → adaptativas.

Gap: 14px (igual horizontal y vertical).

Padding interno: 14px (12px en mobile).

En mobile: 2 columnas fijas, tipografía más chica.

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

<header class="site-header">.

#mobile-menu (drawer, oculto por defecto).

<main>:

<section class="hero"> — fondo de imágenes rotando + título con
glitch/typewriter/cursor.

<div class="marquee"> — cinta con keywords.

<section id="catalogo" class="catalog"> — barra de categorías
centrada, grilla, tinte por categoría.

<section id="como-comprar" class="faq-section"> — acordeón con 5
preguntas + bloque "¿Tenés una consulta especial?" con botón WhatsApp.

<section id="calidad" class="quality-section"> — 4 pilares + guía
de cuidado.

#product-modal — modal de producto.

#image-zoom — overlay de zoom de imagen.

#cart-drawer — drawer del carrito.

#promo-modal (si promo.activa y hay imágenes).

<footer class="site-footer"> — footer completo con 3 columnas + partículas.

#back-to-top — botón flotante "↑".

El buscador ya no está entre la marquesina y el catálogo. Ahora vive
en el header (Sesión 15).

Promo (popup)
Carpeta promo/ con config.json + imágenes.

config.json: activa (bool), noMostrarDuracionHoras (24),
autoRotateSegundos (5), mostrarBotonNoMostrar (bool), link (""),
texto ("").

El script genera src/data/promo.json con { activa, imagenes, hash, config }.

Hash = nombre + tamaño en bytes de cada imagen. Si cambia, la promo se
muestra a todos aunque hayan tocado "No mostrar".

Sin imágenes O activa:false → no hay popup (doble validación).

Se abre a los 2s. Auto-rotate cada 5s (se detiene al interactuar con
flechas/miniaturas/swipe, no se reanuda).

Cerrar con × → solo por esta sesión (sessionStorage krakoa_promo_session_closed).

"No mostrar de nuevo" → localStorage krakoa_promo_dont_show con
{ hash, timestamp }, dura 24 hs (configurable).

Usa historyStack con kind "promo".

Los campos link y texto están en el JSON pero todavía no tienen UI
(preparados para el futuro).

Secciones pendientes (plan original)
C1: Botón "Modelo / Remera" en cada tarjeta del catálogo (cambia la
foto sin abrir el modal). Inspirado en la versión de Google AI Studio.
El usuario pidió PAUSARLO, lo va a pensar mejor. (En Sesión 16 se
resolvió parcialmente con el hover de segunda imagen, pero el botón
explícito sigue pendiente.)

Ideas futuras / deuda técnica
Envíos (charlado, no implementado)
Actualmente no hay cálculo de envío. El carrito muestra "A coordinar".
El usuario despacha desde Isidro Casanova (La Matanza, Buenos Aires).

Opciones evaluadas:

Tabla de zonas con precios fijos: simple, predecible, requiere
mantenimiento cuando cambian tarifas. Recomendado para arrancar.

API de Correo Argentino (MiCorreo) por CP: precio real pero requiere
cuenta de desarrollador, credenciales, definir peso/medidas. No ahora.

Cálculo por distancia para moto (Google Maps + tarifa por km):
nunca va a ser exacto (tarifas de Uber/Didi cambian por demanda, hora,
clima). No vale la pena.

Decisión actual: todo "a coordinar" por WhatsApp. Cuando haya volumen,
evaluar tabla de zonas.

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
Y además el precio podría depender del color (si cambia el costo
de tela), lo que complica el sistema de tiers.

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
Se implementó en su lugar un overlay a pantalla completa.

Decisiones técnicas ya tomadas
No migrar el .bat a npm scripts. Funciona bien, el usuario no
domina terminal, y "si algo anda no se toca".

No usar Content Collections de Astro. El catálogo se genera desde
carpetas de imágenes con un script propio.

No usar componentes separados. Todo vive en index.astro para
simplicidad. Si en el futuro crece mucho, se puede refactorizar.

define:vars para pasar base al script. Es la forma oficial de Astro.

:global() para todo lo que cree el JS y para elementos con clases
que maneja el JS. Ver sección "ADVERTENCIA CRÍTICA: :global()".

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
variable única.

El precio NO se muestra en las tarjetas del catálogo. Solo en el
modal y el carrito.

El precio se calcula sobre el total de prendas del pedido, no por
renglón. Todos los ítems salen al mismo unitario.

Sin total cerrado en el carrito. Solo subtotal de prendas +
"Envío: A coordinar". Es a propósito.

El pago se coordina por WhatsApp, no hay cobro online en la web
(ni link de pago integrado, ni Mercado Pago Checkout).

El aviso de tela se sacó del modal. La info sigue en "Calidad y
Materiales" y el footer.

Historial de cambios (más reciente arriba)
Sesión 16 — Precios, carrito con totales, hero con glitch + typewriter, ajustes estéticos
Sistema de precios (feature nueva, grande):

Tiers definidos: 1 remera → $25.000, 2-4 → $23.000 c/u, 5+ → $20.000 c/u.
Mismo precio para cualquier corte y talle. Precios sin envío.

El descuento se aplica al total de prendas del pedido, no por ítem.

Constantes PRICE_TIERS, funciones formatPrice, getUnitPrice,
getNextTier (en index.astro).

Bloque de precio en el modal: tabla chica de tiers siempre visible,
precio grande en color de categoría, badge "agregá X más" (≤3 unidades),
total del pedido, flashes verde/rojo al cambiar de tier.

Carrito: cada ítem muestra su total de línea. Footer con "N prendas
× $Y c/u" (con flash), subtotal, "Envío: A coordinar". Banner verde/rojo
temporal (4s) cuando cambia el tier. Sin total cerrado.

Mensaje de WhatsApp: desglose por ítem con precio unitario y subtotal,
más subtotal de prendas, precio unitario aplicado y envío a coordinar.

Contador en "Ver carrito" del modal: "Ver carrito (N)", actualizado
desde updateCartBadge().

Decisión de cobro: transferencia por alias (recomendado) o link de
pago de Mercado Pago (opción secundaria). NO integrar MP en la web.

Hero con tres efectos nuevos:

Glitch del título: chromatic aberration + slices, 280ms, cada 5-9s
aleatorio. Usa data-text y pseudo-elementos con :global().

Typewriter: cada 8-14s, CATALOGO se borra letra por letra, aparece
KRAKOA (700ms), se borra, vuelve CATALOGO. Función setText() actualiza
también data-text para que el glitch pinte el texto actual.

Cursor titilante: el punto final del h1 titila con cursorBlink.
Todo con :global().

Ajustes estéticos:

Flechas de producto del modal: cuadradas con border-radius: 12px
y borde de color de categoría (desktop) / 8px (mobile). El breakpoint
de externas-a-internas pasó de 800px a 1280px para evitar superposición
en laptops.

Aviso de tela eliminado del modal. Info sigue en "Calidad y Materiales".

Degradado de la tarjeta tintado con color-mix (usa --category-color
del .product-overlay). El --category-color se movió del
.product-category al .product-overlay.

Overlay de la tarjeta se anima en hover (desktop): se desliza hacia
abajo y se desvanece, para apreciar la remera sola.

Transiciones de hover de la tarjeta suavizadas: zoom 1.04 → 1.015,
duración 0.5s → 0.6s, curva cubic-bezier(0.22, 1, 0.36, 1) → cubic-bezier(0.4, 0, 0.2, 1). Aplica a la imagen y al overlay.

Fix crítico:

Comentario con <script> literal en el <script> rompía el scanner de
Vite cuando cambiaba la config. Se sacaron los <> del comentario.

Sesión 15 — Buscador en el header + hover con segunda imagen + click cierra zoom
Buscador movido al header:

Se eliminó el .search-bar del cuerpo de la página. Ahora el buscador
vive en el header, dentro de .header-actions, a la izquierda del
botón de Instagram.

Desktop: input #search visible siempre, ancho fijo de 200px.

Tablet (≤1000px): input de 150px, Instagram sin label.

Mobile (≤700px): botón de lupa (.search-toggle) visible. Al tocarlo,
el header se transforma en "input + ×" (clase .search-open en
.site-header).

Escape también cierra el buscador en mobile.

Hover con segunda imagen en las tarjetas (desktop):

Cada tarjeta tiene DOS <img> apiladas (.product-image-base y
.product-image-hover).

En hover, la base se desvanece con zoom, la hover aparece.

En mobile se oculta la hover con display: none.

openModal y loadProductIntoModal ahora buscan .product-image-base
(no querySelector("img")).

El hero lee .product-card .product-image-base.

Click sobre la imagen del zoom cierra el zoom (solo desktop):

En el pointerup del overlay, si fue sobre la imagen y
pointerType === "mouse", cierra. En mobile (touch) NO, para
permitir pinch-to-zoom.

Sesión 14 — Tags, fotos extra, Clarity, promo, flechas de producto, grilla full-width
Búsqueda por tags (convención _(tag1, tag2) en el nombre de carpeta).

Fotos extra (extra-*.jpg) que se agregan al carrusel.

Microsoft Clarity (sin cookies). Evento view_<producto>.

Popup de promo (promo/config.json).

Scroll al filtrar por categoría (offset 130px).

Menú de categorías sticky también en desktop.

Flechas para cambiar de producto (desktop: costados; mobile: al lado
del título). Shift + ←/→.

Título y categoría dentro de la imagen (overlay con degradado).

Grilla full-width (100vw + translateX(-50%)).

Sesión 13 — Aleatorización del catálogo + zoom navegable
Aleatorización con round-robin por categoría (client-side).

Orden alfabético cuando hay categoría activa.

Zoom navegable (flechas, swipe, teclado) sin cerrar el zoom.

Sesión 12 — Zoom de imagen + refactor del history lock a pila
Zoom de imagen (overlay a pantalla completa).

Refactor del historyLock a historyStack (pila).

Sesión 11 — Optimización + "Ver tabla de talles"
fetchPriority en el hero.

og:image:width/height (fix de la miniatura en WhatsApp).

Debounce en filterProducts.

Renombrado "Ver gráfico" → "Ver tabla de talles", con estilo de botón.

Sesión 10 — Tinte por categoría, buscador afuera, animaciones del modal
Tinte por categoría con clip-path y dos capas.

Buscador movido afuera de la sección catálogo.

Animación de apertura/cierre del modal (slide + scale en desktop, fade
en mobile).

Link "Compartir" con #hash.

Sesión 9 — Fondo dinámico por categoría + fix de remote
Fondo tintado con slide de derecha a izquierda.

Fix del remote de git (apuntaba a krakoa-web).

Sesión 8 — Catálogo variado, barra de categorías rediseñada, URL nueva
Catálogo con intercalado round-robin.

Barra de categorías estilo "shadow-button-set".

Migración de URL.

Sesión 7 — Fix back-to-top + Loader inicial
Fix del botón "volver arriba".

Loader con fade in del isotipo.

Sesión 6 — Ajustes, Hero con imágenes rotando, Footer completo
Hero con fondo de imágenes rotando + marquesina.

Footer completo con 3 columnas + partículas.

Sesión 5 — Header con menú + fix del botón atrás en mobile
Header desktop y mobile.

Menú mobile (drawer).

Fix de los links del menú mobile.

Sesión 4 — Secciones "Cómo Comprar" y "Calidad y Materiales"
Sesión 3 — Carrito + modal nuevo (Bloque A completo)
Sesión 2 — Deploy fix
Sesión 1 — Limpieza y des-hardcodeo
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

⚠️ Convenciones para el asistente (LEER ANTES DE RESPONDER)
Idioma y tono
Español rioplatense, tono informal pero claro. Evitar tecnicismos
innecesarios; explicar lo técnico con analogías cuando haga falta.

El usuario no programa
No asumir conocimientos de terminal, git, npm, etc. Dar pasos concretos
y verificables.

Cuando el usuario dice "no entendí", simplificar. No debatir opciones.

🔴 MECÁNICA DE TRABAJO ESTRICTA (NO NEGOCIABLE)
El usuario copia y pega, no edita a mano. TODOS los cambios de código
se dan con este formato exacto:

"Buscá esto:" + bloque de código exacto (lo que está actualmente
en el archivo, copiado textualmente).

"Reemplazá por:" + bloque de código nuevo completo.

Si es un agregado nuevo (no reemplazo), decir "Buscá el final de X"
y "Agregá debajo:" o similar, pero el bloque de "buscá" tiene que
ser concreto y verificable (copiable textualmente).

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

Si el usuario tiene que agregar código en algún lugar, el "buscá"
tiene que ser un bloque concreto que el usuario pueda copiar y pegar
de su archivo. NUNCA referencias posicionales vagas.

🔴 :global() — REGLA DE ORO
Antes de proponer CSS nuevo, revisar si el selector involucra JS o
elementos fuera de <main>. Si sí, proponerlo directamente con
:global(). No esperar a que el usuario reporte "no se ve el estilo".

Casos que SIEMPRE llevan :global() (repetido de la sección crítica):

Elementos creados por JS.

Clases que agrega o quita JS sobre elementos estáticos.

Elementos fuera de <main>.

Pseudo-elementos que combinan HTML estático con JS.

Selectores compuestos con :hover que combinan dos clases.

Cualquier selector donde una de las clases la maneja el JS.

Ante la duda, :global(). Es más seguro.

🔴 Otras reglas
No actualizar Astro ni dependencias sin que el usuario lo pida
explícitamente. El aviso de "nueva versión disponible" es informativo,
no hay que accionarlo.

No agregar features nuevas que no se pidieron, aunque parezcan
buena idea. Si surgen, mencionarlas al final como sugerencia, no
implementarlas en el mismo cambio.

No cambiar decisiones ya tomadas (ver "Decisiones técnicas ya
tomadas") sin discutirlo primero.

Si algo no funciona, primero pedir al usuario que corra un test
en la consola del navegador (F12) para diagnosticar, en lugar de
proponer fixes a ciegas.

Mantener el tono de las tandas: cambios chicos, numerados,
verificables. No mezclar muchos cambios grandes en un mismo mensaje.

Al final de cada tanda, incluir una sección "Cómo probarlo" con
pasos concretos que el usuario pueda seguir.