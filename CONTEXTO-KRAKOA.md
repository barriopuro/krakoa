CONTEXTO — Proyecto KRAKOA Web
Archivo de contexto para abrir chat nuevo con IA.
Versión: Compresión S24 (2026).

Cómo actualizarlo: ver §0. Cada sesión nueva se agrega como un bloque al final del §11. No hace falta tocar el resto.

§0 — Cómo actualizar este archivo
Cada sesión nueva: al cerrar el chat, la IA te da un bloque que pegás al final del archivo (§11). Ese bloque tiene dos partes:

Parte A (siempre): entrada de historial de la sesión.

Parte B (opcional): cambios al cuerpo del archivo, en formato "Buscá esto / Reemplazá por". Solo si la sesión cambió algo estructural (nueva deuda, deuda cerrada, decisión tomada, cambio de stack, etc.).

Cada 10-15 sesiones: reescritura completa del archivo (compresión del historial viejo + reorganización). La IA te guía.

Regla de oro: si dudás, no toques §1–§10. Agregá todo al historial del §11 y listo. El cuerpo se mantiene estable.

§1 — El proyecto
Qué es: sitio web de catálogo de remeras de la marca KRAKOA.

Stack: Astro ^7.3.5 + HTML + CSS + JavaScript vanilla. Sin frameworks. Todo el sitio vive en src/pages/index.astro. Node >=22.12.0. Dependencias: astro y sharp.

Deploy: GitHub Pages, repo barriopuro/krakoa. Workflow en .github/workflows/deploy.yml en cada push a main. Source configurado en "GitHub Actions".

URLs:

Producción: https://barriopuro.github.io/krakoa

Corta: https://krakoa.netlify.app (redirect vía index.html con meta OG + meta refresh + window.location.replace)

⚠️ La bio de Instagram usa la URL de GitHub Pages, NO la corta. Instagram agrega prefijos que rompen el redirect de Netlify.

Repo secundario: barriopuro/krakoa-web — solo un index.html con redirect a la URL nueva (links viejos).

Remote de git local: apunta a barriopuro/krakoa. Si GitHub rechaza un push, verificar con git remote -v.

Frecuencia de cambios: el sitio está "prácticamente perfecto". Próximas sesiones: detalle fino, features puntuales, mantenimiento de catálogo.

§2 — Estructura de archivos
text
/
├── ACTUALIZAR WEB.bat          ← script de publicación
├── astro.config.mjs
├── package.json
├── CONTEXTO-KRAKOA.md
├── .github/workflows/deploy.yml
│
├── catalogo/<cat>/<modelo>/    ← JPG originales
│   ├── modelo.jpg
│   ├── remera.jpg
│   └── extra-*.jpg (opcional)
│
├── talles/{oversize,regular}.jpg
├── promo/{config.json,*.jpg}
│
├── public/
│   ├── catalogo/<cat>/<modelo>/*.webp   (generado)
│   ├── talles/*.webp                    (generado)
│   ├── promo/*.webp                     (generado)
│   ├── fonts/krakoafont.ttf
│   ├── logos/*.webp
│   ├── favicon.ico / favicon.svg
│   ├── og-image.jpg
│   └── sitemap.xml                      (generado)
│
├── scripts/generar-catalogo.mjs
│
└── src/
    ├── data/catalogo.json               (generado)
    ├── data/promo.json                  (generado)
    └── pages/index.astro                ← TODA la web
Sin componentes separados ni layouts. Todo vive en index.astro.

Script de publicación (ACTUALIZAR WEB.bat):

node scripts\generar-catalogo.mjs → catálogo + sitemap

npm run build

git add . && git commit -m "<descripción>" (default: "Actualizacion de KRAKOA")

git push

Si algo falla: muestra error y pause. No se migra a npm scripts ("si algo anda no se toca").

Convención de nombres:

Producto: nombre-del-modelo (guiones, sin caracteres raros).

Tags: nombre _(tag1, tag2) al final del nombre de carpeta.

Fotos extra: extra-N-descripcion.jpg o extra-descripcion.jpg.

Categorías (en categoryConfig del script):

id	name	color
anime	Anime	#e53935
comics	Comics	#e84393
cine-series	Cine y TV	#f2c94c
deportes	Deportes	#f2994a
musica	Música	#2f80ed
videojuegos	VideoGames	#27ae60
otros	Otros	#bb86fc

Nota (S28): los nombres visibles cambiaron en S28 para ahorrar ancho en la barra compacta mobile ("Cine y Series" → "Cine y TV", "Videojuegos" → "VideoGames"). Los ids internos (cine-series, videojuegos) NO cambiaron: las URLs ?cat=cine-series y data-category siguen funcionando.
Para agregar categoría: crear carpeta en catalogo/ + entrada en categoryConfig. El catálogo se ordena con intercalado round-robin por categoría.

§3 — Mapa del sitio
Orden en index.astro:

Header
Desktop (≥701px): logo horizontal (175px), nav (Catálogo, Cómo Comprar, Materiales), buscador (200px), botón IG (rosa, "@krakoa.sw"), botón carrito.

Tablet (≤1000px): buscador 150px, IG sin label.

Mobile (≤700px): logo (115px), lupa, IG, carrito, hamburguesa.

Buscador mobile se despliega al tocar lupa: header se transforma en "input + ×" (.search-open). Logo, nav, IG, carrito, menú y lupa se ocultan. × cierra y restaura. Escape también.

Header con glitch ocasional (borde + placeholder + × + lupa) al abrir/cerrar en mobile y al focus en desktop.

Hero
Fondo con imágenes del catálogo, rotación ~5.5s. Primera estática con fetchpriority="high" (LCP); las otras 5 por JS. Opacidad 0.32. Zoom + paneo lento.

Full-width vía left: 50%; width: 100vw; transform: translateX(-50%). Sin border-radius.

::after con scanlines + vignette + degradado vertical.

<h1> con glitch + typewriter + cursor.

Reveal por letra tras el loader. Al terminar restaura el HTML normal.

Marquesina
Cinta con keywords (marqueeText) que se desplaza infinitamente. Hover pausa y pinta amarillo KRA (#ffd655).

Catálogo (#catalogo)
Barra de categorías sticky (top: 0, z-index: 100, backdrop blur). Cada botón:

Elevación en hover (desktop ≥901px) y .active.

Badge con conteo de productos (pop-in).

Glitch de texto + borde.

Toggle: click en activo lo desactiva.

Grilla full-width (100vw + translateX(-50%)).

Tinte de fondo por categoría: dos capas (#catalogTintA/B) con clip-path. Slide derecha→izquierda al cambiar categoría (0.55s).

Tarjetas:

Dos <img>: base (modelo) y hover (remera).

Hover (desktop ≥901px) y auto-slide (mobile + desktop): misma animación. La remera entra desde la derecha (translateX(100%) → 0), se sostiene, y sale hacia la derecha (0 → translateX(100%)). Sin scale. 0.32s ease. Modelo es el estado base. La animación vive 100% en JS (no en CSS). Ver §4 "Auto-slide + hover slide".

Overlay con degradado tintado. En hover se desliza abajo y desvanece.

object-fit: cover, object-position: 50% 50%.

Skeleton loader (shimmer).

Nota: La barra combinada en mobile se estabilizó en S24 (contain + flex-wrap + category-break). En S28 se reescribió el compacto mobile: ahora es un grid 3×2 (logo | botones | carrito arriba / lupa abajo). Si se retoca, ver §11 S24/S28.

Cómo Comprar (#como-comprar)
Acordeón de 5 preguntas, header centrado, bloque "¿Consulta especial?" con WhatsApp. Solo uno abierto a la vez.

Calidad y Materiales (#calidad)
4 pilares + guía de cuidado. Header centrado. Tarjetas con texto interno a la izquierda.

Footer
Tres columnas centradas (logo vertical + texto + links).

Partículas blancas subiendo (22, por JS).

Copyright ("© 2026 KRAKOA powered by BARRIOPURO").

Overlays (z-index)
z-index	Overlay
100	Barra de categorías sticky
900	Volver arriba (anillo SVG)
1000	Modal de producto
1010	Flechas de producto del modal (desktop, afuera)
1100	Carrito (drawer)
1200	Menú mobile (drawer)
1250	Promo (popup)
1300	Zoom de imagen
9500	Barra de progreso de scroll
Botón atrás deshace la última acción (ver §4 "History stack").

Loader inicial (#krakoa-loader)
Fade in del isotipo + glitch. Se oculta en DOMContentLoaded (o 1.5s por seguridad). Dispara krakoa:loaded para el reveal por letra del hero.

§4 — Sistemas transversales
Sistema de precios
Los precios dependen solo de la cantidad total de prendas del pedido, no del producto, corte ni talle. Definidos en PRICE_TIERS dentro del <script>:

Cantidad	Precio unitario
1 remera	$25.000
2 a 4 remeras	$23.000 c/u
5 o más	$20.000 c/u
Regla clave: el descuento aplica al total, no por renglón. 3 modelos distintos = las 3 a $23.000 c/u.

SIN envío. Se coordina aparte por WhatsApp, lo paga el comprador.

Helpers: formatPrice(), getUnitPrice(totalQty), getNextTier(totalQty).

Dónde se ve:

NO en tarjetas (sobrecarga visual).

Modal: tabla de tiers, fila activa resaltada, precio grande en color de categoría, badge verde "Agregá X más y todas salen a $Y" cuando faltan ≤3 para el próximo tier, total del pedido, "(sin envío)". Flash verde/rojo al cambiar unitario. Sin flash al abrir modal (lastUnitPrice = null).

Carrito: total por línea. Footer con "N prendas × $Y c/u", subtotal, "Envío: A coordinar" (gris itálica), banner verde/rojo 4s al cambiar tier.

WhatsApp: desglose por ítem + subtotal + unitario aplicado + envío a coordinar.

Contador en "Ver carrito" del modal: "Ver carrito (N)", actualizado por updateCartBadge().

Cobro: transferencia (alias/CBU) o link de MP (secundario). NO integrar MP en la web.

Carrito
Persistencia: localStorage, clave krakoa_cart.

Estructura: { key, name, image, fit, size, quantity, color }. key = ${name}__${fit}__${size}. Si se agrega color, incluir en key (rompe compatibilidad, aceptable).

Funciones: saveCart, getTotalCount, updateCartBadge, addToCart, removeFromCart, changeQuantity, clearCart, renderCartDrawer(animate), buildWhatsAppOrderMessage.

WhatsApp: 5491132372306 con window.open + encodeURIComponent.

Drawer: desliza desde derecha, transición bidireccional.

History stack (botón atrás)
Deshace la última acción (modal, carrito, zoom, menú, promo, categoría) en vez de salir de la web.

historyStack: array de { kind, state }. Kinds: "modal" | "cart" | "image-zoom" | "mobile-menu" | "promo" | "category".

pushHistory(kind, state) → pushState + push al array.

popHistory() → history.back() (dispara popstate).

closeTopOverlay() → usada por popstate.

Cada overlay tiene 2 cierres: closeX() (si está en tope → popHistory()) y closeXDirect() (cierre real, para popstate).

Caso links del menú mobile: al tocar link interno, NO popHistory(). Se usa history.replaceState, se saca "mobile-menu" del stack, se cierra directo, se scrollea suave.

Producto compartido por hash: openProductFromHash hace un pushState extra.

Caso conocido: entrar por link con hash y tocar atrás saca al usuario del sitio (comportamiento esperado).

Modal de producto
Desktop: 2 columnas (1.15fr / 1fr). Izq: galería. Der: header (categoría + título), body (selectores + precio), footer (botones).

Mobile (<800px): una columna. .modal-grid es el único scroller.

Body de arriba a abajo: corte → talle (+alto × ancho cm) → cantidad → precio.

Galería: dos <img> apiladas (#modal-image-a / #modal-image-b) para transición direccional. Slides: modelo, remera, extras, y siempre las 2 tablas de talles. Al abrir el modal (openModal y loadProductIntoModal) se precargan TODAS las imágenes del producto con new Image() en paralelo, para que las flechas rápidas y el cambio de producto se sientan fluidos.

Transición: renderModalImage(direction, cleanupDelay = 340). "next" / "prev" únicamente (el modo "fade" se eliminó en S27). La imagen entra desde el costado con translateX(±100%) y la vieja sale hacia el opuesto, sin scale. 0.32s + cubic-bezier(0.22, 1, 0.36, 1). renderToken cancela cleanups huérfanos si el usuario clickea rápido. Thumbnails y "Ver tabla de talles" saltan DIRECTO con renderModalImage (sin recorrido por slides intermedios; el fast-forward se probó en S27 y se descartó).

Flechas de producto:

≥1281px: afuera del modal, 60×60px, radius 12px.

≤1280px: dentro del header, 44×44px.

Breakpoint 1280px: modal 1100px + 24px margen + 60px flecha ≈ 1268px.

Animación cambio de producto: RGB split + ruido teal + viñeta W2A, solo sobre .modal-image-area. Contenido se reemplaza a los 110ms. Clases se limpian a los 260ms.

Navegación: orden ACTUAL del DOM. Consulta con document.querySelectorAll("#products .product-card") en vivo (NO el NodeList products). Wrap-around.

Reset al cambiar: Oversize, L, 1. Scroll al inicio en mobile.

Teclado: Shift + ← / → producto. ← / → imagen.

Apertura/cierre (CRT): Power On/Off. Apertura scaleY(0.005) scaleX(0.5) → 1 con overshoot (0.55s), flicker + scanlines. Cierre inverso (0.35s). .is-closing se agrega al cerrar y se limpia a 380ms con modalCloseTimer.

Scroll lock: lockScroll() compensa ancho de barra con padding-right.

Link compartido: #slug vía openProductFromHash + truco de historial.

Zoom de imagen
Overlay full-screen, fondo negro 93%.

Se abre con click/tap sobre imagen grande del modal (NO miniaturas, NO tablas).

Slides zoomeables: solo fotos (isZoomableSlide(index, total) → index < total - 2).

Mobile: pinch-to-zoom nativo. Ícono de lupa semitransparente abajo-derecha.

Desktop: cursor zoom-in. Click en imagen cierra el zoom solo si está en 1x; si está ampliada, resetea a 1x.

Zoom con rueda (desktop): de 1x a 4x, anclado al cursor. Pan: arrastrar cuando zoom > 1x, con límites.

Cerrar: click fuera (pointerdown + pointerup), ×, Escape, back.

Navegación: flechas a los lados, swipe mobile, teclado ← → desktop. Índice propio (zoomImageIndex).

Bug fix crítico: flechas del zoom usan pointerdown + stopPropagation (sin esto, pointerup del overlay cerraba el zoom).

Colores de categoría
Al abrir modal, se lee --category-color del .product-overlay de la tarjeta (NO de .product-category) y se setea en .modal-content. Se aplica a:

Borde de miniatura activa.

Botón corte/talle activo.

Números "1." / "2." de labels.

Botón "Agregar al Pedido", "Ver carrito".

Subrayado de "Ver tabla de talles".

Borde de flechas de producto.

Precio grande del bloque de precio.

Fila activa de la tabla de tiers.

Ojo: hay 2 lugares que leen --category-color: openModal y loadProductIntoModal. Ambos leen de .product-overlay.

Buscador
En header. #search + .search-toggle (lupa, mobile). Filtra por product.dataset.name y product.dataset.tags. Multi-palabra AND. Debounce 150ms.

.search-bar envuelta en :global() (Astro no asignaba el data-astro-cid).

En mobile, × cierra, limpia input, restaura catálogo.

Promo (popup)
Carpeta promo/ con config.json + imágenes.

config.json: activa, noMostrarDuracionHoras (24), autoRotateSegundos (5), mostrarBotonNoMostrar, link, texto.

Script genera src/data/promo.json con { activa, imagenes, hash, config }.

Hash = nombre + tamaño en bytes de cada imagen. Si cambia, la promo se muestra a todos.

Sin imágenes O activa:false → no hay popup.

Se abre a los 2s. Auto-rotate cada 5s (se detiene al interactuar, no se reanuda).

× → solo por sesión (sessionStorage). "No mostrar de nuevo" → localStorage con { hash, timestamp }, dura 24h.

historyStack con kind "promo".

Apertura/cierre (CRT): igual al modal (Power On/Off + scanlines). .is-closing con timer.

Los campos link y texto en JSON pero sin UI.

Efectos visuales: flicker de encendido + pulso de neón + scanlines.

Flechas se ocultan si hay una sola imagen.

Glitches (sistema unificado)
Todos usan la misma técnica:

Spans reales con textContent scrambled (NO content: attr()).

10 keyframes de clip-path con tiras y bloques.

Flips (scaleX/scaleY) en frames clave.

RGB split dinámico en text-shadow (magenta #ff0055 + cian #00fff0).

Flicker en paralelo.

steps(9, end) para saltos digitales.

Duración estándar: 420ms.

Aplica a:

Hero: título. Cada 5-9s, 420ms. Symbols scrambled ratio 0.4.

Loader: isotipo. Primer glitch a 600ms + cada 2.5s mientras visible.

Categorías: texto + borde. Dos timers desfasados (800ms / 2600ms), un botón al azar (no activo) cada 3-7s, 400ms. Símbolos angostos (!|/\+~^_-=).

Buscador: borde + placeholder + × + ícono SVG. Triggers: openSearch/closeSearch (mobile), focus (desktop ≥701px).

Modal: título. Al abrir (200ms delay, 400ms) y cada 15-20s (300ms).

Logo del header: cada 15-30s, 420ms.

Todos respetan prefers-reduced-motion: reduce.

Typewriter del hero
Cada 8-14s, el título se borra letra por letra, escribe "KRAKOA", mantiene 700ms, borra, escribe "CATALOGO". Función setText(content).

formatHeroText(text): si es prefijo de "KRAKOA", envuelve las primeras 3 letras en <span class="hero-kra"> (amarillo #ffd655).

Cuando es prefijo de KRAKOA, <h1> recibe .is-krakoa y aplica KrakoaFont.

height: calc(clamp(...) * 0.88) fijo en <h1> para evitar layout shift.

Cursor titilante: _ con cursorBlink 1s step-end infinite. Forzado a font-family: Arial.

KrakoaFont (Payback)
Tipografía del logo. En public/fonts/krakoafont.ttf. 8kb.

Cargada con <style is:inline set:html={...}> (necesario para interpolar ${base}).

Dónde se usa:

Hero: cuando el typewriter escribe "KRAKOA".

"Cómo Comprar en KRAKOA": con <span class="brand-inline">.

NO en footer ni copyright (a 12-14px no se leen los cortes).

Reglas de uso:

Tratamiento completo (Payback + KRA amarilla): solo contextos grandes.

Solo KRA amarilla: en párrafos medianos.

Sin tratamiento: texto chico (copyright, alt, metadata).

.hero-kra (amarillo) y .brand-inline (Payback) son independientes. Juntas = logo completo.

Tinte de categoría
Ver §3 "Catálogo".

Skeleton loader
::before en .product-image. Sin .loaded: opaco + shimmer. Con .loaded (agregado por JS al cargar imagen base): desvanece.

Fade-in al scrollear
Secciones "Cómo Comprar", "Calidad" y footer arrancan con .section-observe (opacity 0, translateY 30px). IntersectionObserver agrega .is-visible al entrar. Si reduce-motion, ni se agrega la clase.

Timers pausados fuera de viewport
IntersectionObserver pausa: rotación del hero, glitch del título, typewriter, partículas del footer.

URL y título dinámicos
?cat=<id> refleja filtro activo (vía replaceState).

#<producto-id> refleja producto abierto.

<title>: producto → "KRAKOA | Nombre", filtro → "KRAKOA | Categoría", default → "KRAKOA | REMERAS".

Auto-slide + hover slide (tarjetas)
Una única animación para auto-slide y hover: la remera entra desde la derecha, se sostiene 3-5s (random), y sale hacia la derecha. Modelo es el estado base (siempre al final del ciclo).

Sistema:
- Global, no por tarjeta. Un solo timer ADAPTATIVO elige 1-2 tarjetas visibles al azar y las anima. Si countActiveSlides() === 0 (ninguna en fase "in" o "holding"), delay 300-800ms para que nunca se sienta "muerto". Si ya hay alguna activa, delay 1.5-5s para que se superpongan sin amontonarse.
- Visible = 75% del contenedor en el viewport (IntersectionObserver, threshold 0.75).
- Cooldown DINÁMICO: effectiveCooldown = min(6, max(2, visibleCards.size * 2)). Con pocas tarjetas visibles rota más seguido. Si todas las candidatas quedan en cooldown, se resetean los lastTurn.
- Cuando rotan 2, no pueden ser adyacentes (ni misma fila ni misma columna). Se verifica con getBoundingClientRect().
- Precarga condicional: en mobile la remera se descarga al rotar (new Image() + onload + src = data-src). En desktop se descarga al 10% visible (equivale a lazy).
- Pausas: document.hidden, filtro en curso (.is-revealing), cualquier overlay abierto (.modal.open, .cart-drawer.open, .mobile-menu.open, .image-zoom.open, .promo-modal.open).

Hover (desktop ≥901px):
- Misma animación que el auto-slide.
- Hover durante "holding": se cancela el holdTimer, la remera queda visible hasta mouseleave.
- Hover durante "out": rebota y vuelve a entrar.
- Hover durante "in": no interrumpe.

Estado por tarjeta (_state.phase): "idle" | "in" | "holding" | "out". Es lo que permite que hover y auto-slide compartan la animación sin pisarse.

Template: .product-image-hover usa data-src (no src). El JS decide cuándo setear src.
CSS: se eliminó el display: none de mobile y el :has(). Toda la animación vive en JS.

Diferencia con el modal: el modal es un carrusel real (bidireccional: next = derecha→izquierda, prev = izquierda→derecha). Las tarjetas son unidireccionales (siempre entran desde derecha y salen hacia derecha). Pendiente S27: unificar el slide del modal al estilo de las tarjetas.

Barra compacta (Desktop + Mobile)
La barra de categorías (.categories) entra en modo compacto (.compact) cuando el header sale de vista por arriba (IntersectionObserver sobre .site-header).

Desktop (≥701px): flex row. Logo horizontal (120px) a la izquierda, lupa (42px, fondo blanco, ícono oscuro), botones en el centro, carrito (42px) a la derecha. Altura fija: 95px.

Mobile (≤700px): grid 3 columnas × 2 filas:
  - Col 1: isotipo (28px), centrado verticalmente en ambas filas.
  - Col 2: botones de categoría (4 arriba, 3 abajo) o panel de búsqueda. Ocupa ambas filas.
  - Col 3: carrito (28px, arriba), lupa (28px, abajo).
Altura mínima: 105px.

Toggle lupa ↔ X (S28):
  - El toggle (.categories-compact-search-toggle) tiene 2 SVGs (lupa y X). CSS alterna cuál se ve según .search-open.
  - Mobile: al tocar la lupa se abre el panel de búsqueda (.categories-compact-search-panel) en la celda de los botones, y la lupa se transforma en X EN EL MISMO LUGAR. Al tocar la X, se cierra el panel y se limpia el input.
  - Desktop: mismo comportamiento. El toggle (lupa/X) se queda visible en search-open, y el × interno del panel se oculta.
  - Escape también cierra + limpia (handleCloseCompactSearch).

Logo compacto clickeable (S28): el .categories-compact-brand es un `<button>` que scrollea al top al clickear. Al subir, el header vuelve a la vista y la barra sale del modo compacto sola.

Alturas (S28.3):
  - Desktop: .categories.compact { height: 95px } + .categories-compact-search-panel { height: 51px }. Ambos fijos. Los botones miden ~51-53px, así que en search-open el panel ocupa lo mismo y la barra no cambia de alto.
  - Mobile: .categories.compact { min-height: 105px }. El grid mantiene la altura aunque el panel (36px) sea más bajo que los botones.
  - Lección: usar height fija (no min-height) cuando el contenido puede variar y el layout depende del hijo más alto. Con min-height, el input (height: 100%) colapsa al alto de su contenido y el panel queda chico.

§5 — Reglas técnicas críticas
:global() en Astro
Ante la duda, :global(). Astro auto-limita CSS en .astro con data-astro-cid-.... Elementos creados por JS no lo tienen y quedan sin estilo.

Casos que SIEMPRE llevan :global():

Elementos creados por JS.

Clases que agrega/quita JS sobre estáticos (.glitching, .active, .is-added, .search-open, etc.).

Elementos fuera de <main>: footer, header, modales, drawers, overlays, promo, menú.

Pseudo-elementos combinando HTML estático + JS.

Selectores compuestos con :hover de dos clases.

Cualquier selector donde una clase la maneja JS.

Regla: cuando un selector combina un elemento estático con uno creado por JS (o una clase que maneja el JS), cada parte va en su propio :global(), separadas por espacio:

css
:global(.category-button.glitching) :global(.cat-glitch-a) { ... }
NO llevan :global(): elementos estáticos dentro de <main> cuyas clases NO toca el JS (ej: .cart-price-summary, .cart-subtotal-line, .cart-shipping-line).

${base} en <style>
${base} NO se interpola dentro de <style> (ni con is:inline). Para URLs en CSS: usar <style is:inline set:html={...}> con template literal, o rutas relativas (sin / inicial).

Dev server cacheando
Si un cambio CSS no se ve, cerrar dev server (Ctrl+C) y volver a npm run dev. Aplica especialmente a <style> y a assets nuevos en public/.

Sticky hover en mobile
Solución: envolver :hover persistentes en @media (hover: hover) and (pointer: fine). En mobile, el estado touch se maneja con .active.

Faux bold en fuentes custom
Si una @font-face declara font-weight: normal y el CSS pide 900, el browser sintetiza bold. Para evitarlo: cuando .is-krakoa / .brand-inline están activas, forzar font-weight: normal.

Fuentes con métricas distintas
Cambian la altura del line-box. Solución: height: calc(...) fijo en el contenedor.

attr() en content no es confiable
Para scrambles y animaciones con valores runtime: usar spans reales + textContent.

Drawers con transición de cierre
cart-drawer y mobile-menu usan transition + visibility diferido, no animation. Patrón:

Cerrado: opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.28s ease, visibility 0s linear 0.28s;

Abierto (.open): opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 0.28s ease, visibility 0s linear 0s;

Nunca display: none (impide animar el cierre).

Precios NO en las tarjetas
Solo en modal y carrito.

Intercalado round-robin
El script ordena por intercalado. Cliente re-mezcla con Fisher-Yates al cargar, guardando orden en window.__krakoaRandomOrder para restaurarlo al sacar filtro.

overflow-x: clip en el body
No hidden (rompería el sticky).

Ruido para efectos (lección S22)
feTurbulence genera píxeles blancos puros que sobre fondo oscuro se leen como "flash" sin importar el slope. Solución: feColorMatrix para teñir de un color oscuro (verde, teal, etc.) en vez de gris/blanco.

`<script>` literal en comentarios CSS rompe rolldown (lección S28)
El scanner de dependencias de Vite 7 (rolldown) busca la subcadena `<script` en cualquier parte del archivo, incluso dentro de comentarios CSS/JS. Si encuentra `<script>` en un comentario, intenta parsear lo que sigue como JavaScript y falla con `PARSE_ERROR`. Solución: nunca poner `<script>` literal en comentarios. Referirse como "el bloque JS" o "el script del final". Aplica a este proyecto.

`height` fija vs `min-height` en layouts de altura dependiente (lección S28)
Si el layout depende del hijo más alto (ej: barra con botones ~51px vs panel ~41px), `min-height` no alcanza: el navegador usa la altura del contenido real, que cambia según el estado. Usar `height` fija + `align-items: center` en el padre. Y si un hijo tiene `height: 100%` (ej: input dentro de panel), el padre necesita `height` fija (no min-height) para que el 100% resuelva.

§6 — Convenciones de trabajo con la IA
Idioma y tono
Español rioplatense, informal pero claro. Analogías cuando haga falta. Evitar tecnicismos innecesarios.

El usuario no programa
No asumir conocimientos de terminal, git, npm. Pasos concretos y verificables. Cuando dice "no entendí", simplificar. No debatir opciones.

🔴 Mecánica de trabajo estricta (NO NEGOCIABLE)
El usuario copia y pega, no edita a mano. Formato exacto:

"Buscá esto:" + bloque de código exacto (copiado textualmente del archivo actual).

"Reemplazá por:" + bloque de código nuevo completo.

Si es agregado: decir "Buscá el final de X" y "Agregá debajo:", pero el bloque de "buscá" debe ser concreto y copiable textualmente.

Múltiples cambios en el mismo archivo: numerar "Cambio 1 de 4", "Cambio 2 de 4", etc.

Cada cambio autocontenido y verificable.

PROHIBIDO usar: "Después de X", "Antes de Y", "Al final del bloque Z", "Justo después de la línea N", "Agregá una línea", "Cambiá el valor de X", "Modificá la función X". Cualquier instrucción que requiera interpretación o edición manual.

🔴 :global() primero
Antes de proponer CSS nuevo, revisar si el selector involucra JS o elementos fuera de <main>. Si sí, proponerlo directamente con :global(). No esperar a que el usuario reporte "no se ve el estilo".

Otras reglas
No actualizar Astro ni dependencias sin pedido explícito. El aviso de "nueva versión" es informativo.

No agregar features nuevas no pedidas. Si surgen, mencionarlas al final como sugerencia.

No cambiar decisiones ya tomadas (§5, §7) sin discutirlo primero.

Si algo no funciona: primero pedir test en consola del navegador (F12).

Mantener tandas: cambios chicos, numerados, verificables. No mezclar muchos cambios grandes en un mensaje.

Al final de cada tanda, incluir sección "Cómo probarlo" con pasos concretos.

Protocolo de fin de sesión
Al cerrar un bloque importante, la IA entrega un solo bloque para pegar al final del archivo. Ver §0.

§7 — Decisiones descartadas (no re-proponer)
Decisión	Motivo

| "Sin resultados" con chips de categorías (Opción 2) | Suma complejidad visual para un caso de borde. Se implementó mensaje + botón "Ver todo" (Opción 1). |
| "Sin resultados" con sinónimos (Opción 3) | Requiere mantener tabla de sinónimos a mano. Mismo motivo que el override de nombres. |

Integrar Mercado Pago en la web	Proyecto aparte (credenciales, webhooks, rechazos). Se coordina por WhatsApp.
Migrar el .bat a npm scripts	"Si algo anda no se toca". El usuario no domina terminal.
Content Collections de Astro	Catálogo se genera con script propio.
Componentes separados / layouts	Todo en index.astro. Si crece mucho, reevaluar.
Override de nombres con caracteres especiales	Costo de mantener tabla no se justifica.
Búsqueda por categoría en el buscador	Barra sticky ya está visible. Redundante.
Lupa con seguimiento del mouse (Zara/Nike)	Requiere imágenes en alta resolución. Se implementó overlay full-screen en su lugar.
Botón "Modelo / Remera" en tarjeta	Resuelto con hover de segunda imagen.
Vista rápida (mini-modal) en tarjeta	Descartado.
Contador global de modelos ("7 categorías · 99 diseños")	Se desistió. Hay badge por categoría.
Selector de color de tela	Idea futura (§8).
Cálculo de envío en la web	Idea futura (§8). Por ahora "a coordinar".
Productos relacionados en el modal	Casi descartado. Retomable si surge.
Lazy loading del catálogo (cargar de a 20-30 tarjetas)	La web ya carga bien tras S19. Cargar en tandas rompe el buscador (filtra sobre todo el DOM).
Feedback táctil (vibración + micro-glitch)	Se decidió no sumar vibración. El :active da feedback suficiente.
Bottom Sheet para el modal en mobile	Descartado definitivamente en S24.

§8 — Ideas futuras (vivas, sin implementar)
Selector de color de tela
Algunos modelos con 2-3 colores (blanco, negro, otros). Plan:

Subcarpetas por color dentro de la carpeta del modelo.

Script detecta → colors: { negro: {...}, blanco: {...} }.

Selector arriba del corte (solo si hay >1). Cambiar color reemplaza URLs.

Tarjeta usa color default.

key del carrito incluye color (rompe localStorage viejo, aceptable).

Mapeo COLOR_NAMES para nombres lindos.

Sistema de envíos
Tabla de zonas con precios fijos: simple, predecible, requiere mantenimiento. Recomendado para arrancar.

API Correo Argentino (MiCorreo) por CP: precio real, requiere cuenta dev, peso/medidas. No ahora.

Cálculo por distancia para moto: nunca exacto. No vale la pena.

Decisión actual: "a coordinar" por WhatsApp.

KrakoaFont en más lugares
Sección "Sobre KRAKOA" / "Nuestra historia".

Pantalla 404 custom.

Página "Gracias por tu pedido".

Bloque "sin resultados" — RESUELTO en S25
Implementado como Opción 1: mensaje + botón "Ver todo el catálogo" que resetea búsqueda y categoría. Vive en #no-results (hermano de #products). Se togglea con hidden desde filterProducts.

Descartadas (no re-proponer):

Opción 2 (mensaje + chips de categorías clickeables): suma complejidad visual para un caso de borde, y el usuario prefiere una salida única y clara.

Opción 3 (búsqueda con sinónimos / "¿quisiste decir X?"): requiere mantener tabla de sinónimos a mano, mismo motivo por el que se descartó el override de nombres (§7).

Cotizador offline (cotizador.html)
Archivo externo (no vive en el repo). Calcula costos DTF (Guillotine Best-Area-Fit) + precios de venta. Independiente del deploy.

§9 — Pendientes

Fast-forward del carrusel del modal (recorrido por slides intermedios al tocar un thumbnail o "Ver tabla de talles"): probado en S27, descartado por denso + inestable en mobile. Thumbnails y tabla de talles saltan directo. No re-proponer.

La barra compacta ya no está pendiente (resuelta en S25). El auto-slide en tarjetas ya no está pendiente (resuelto en S26). Los pendientes que quedan son: roadmap Fase 3-6.

Nada urgente. Web estable.

Auto-slide + hover slide en tarjetas — RESUELTO en S26
Implementado como sistema global con cooldown, no-adyacencia y precarga condicional. Ver §4 "Auto-slide + hover slide".

Auto-slide adaptativo y slide del carrusel del modal — RESUELTOS en S27. El fast-forward (recorrido por intermedios) se implementó y se descartó por denso + inestable en mobile. No re-proponer.


Lupa compacta — RESUELTA en S28. La lupa volvió a mobile en S28, apilada debajo del carrito (grid 3×2). En desktop sigue funcionando. Ambas con el mismo aspecto (fondo blanco, ícono oscuro). Ver §4 "Barra compacta".

Performance de backdrop-filter en mobile de gama muy baja
Hoy blur(6px). No se reprodujo problema hasta ahora.

_redirects (Netlify)
Reemplazado por index.html con meta OG + refresh en S23. Ya no aplica.

§10 — Protocolo para abrir chat nuevo
Cuándo: cada ~20-30 mensajes, al cerrar un bloque grande, o cuando las respuestas del asistente empiecen a sentirse lentas.

Cómo:

Si hay cambios sin commitear, correr el .bat una última vez.

Abrir chat nuevo.

Pegar CONTEXTO-KRAKOA.md como primer mensaje.

Subir src/pages/index.astro, scripts/generar-catalogo.mjs, package.json y promo/config.json.

Continuar desde donde quedamos.

Recomendación: hacerlo al cerrar un bloque (no a mitad).

§11 — Historial de sesiones
Las sesiones se agregan al final. Cada una es un bloque. Las viejas están comprimidas.

S1–S15 (comprimidas)
S1: Base del proyecto. Limpieza y des-hardcodeo.

S2: Fix del workflow de deploy a GitHub Pages.

S3: Carrito con localStorage + modal nuevo.

S4: Secciones "Cómo Comprar" y "Calidad y Materiales".

S5: Header desktop/mobile + menú drawer + primer fix del botón atrás.

S6: Hero con imágenes rotando + marquesina + footer completo.

S7: Loader inicial + fix del back-to-top.

S8: Catálogo variado (round-robin) + barra de categorías + migración de URL.

S9: Tinte dinámico por categoría + fix del remote (-web).

S10: Tinte con clip-path y dos capas + link "Compartir" con #hash + animación de modal.

S11: Optimización (fetchPriority, og:image dimensions, debounce filter).

S12: Zoom de imagen + refactor del historyLock a historyStack (pila).

S13: Aleatorización del catálogo client-side + zoom navegable.

S14: Tags de búsqueda + fotos extra + Microsoft Clarity + promo + flechas de producto + título/categoría en imagen + grilla full-width + menú sticky desktop.

S15: Buscador al header + hover con segunda imagen (desktop) + click en zoom cierra.

S16 — Precios, carrito con totales, hero con glitch + typewriter
Sistema de precios con tiers. Bloque de precio en modal. Carrito con totales y banner de cambio de tier. Mensaje de WhatsApp con desglose. Hero con glitch + typewriter + cursor. Flechas de producto cuadradas con borde de color. Overlay de tarjeta animado en hover.

S17 — Glitch extendido, KrakoaFont, badges, navegación deshacible
Glitch del menú de categorías. Hero con glitch mejorado (10 keyframes, flips, RGB split dinámico). Hero con KrakoaFont (Payback) + KRA amarilla. Badge con conteo de modelos. Buscador con glitch. historyStack refactorizado a objetos { kind, state } con "category" deshacible. Drawers con transición de cierre. Secciones centradas (FAQ, Calidad, footer). Flecha de Instagram en footer.

S19 — Performance, unificación de glitches, loader
(Nota: S18 se salteó por error, no hay hueco funcional.)

WebP a 75, resize máx 1000px (mitad de peso). Loader con DOMContentLoaded + timeout 1500ms. MIN_TIME 300ms. Hero LCP: primera imagen estática con fetchpriority="high". JSON-LD consolidado en 1 <script> con @graph (antes 117). Timers pausados vía IntersectionObserver. Scroll con requestAnimationFrame + { passive: true }. will-change quitado de imágenes del catálogo. Glitches unificados con técnica del hero. URL/título dinámicos. Botón "Volver arriba" con anillo SVG. Filtro con fade-in escalonado.

Métricas finales (Fast 4G, Lighthouse Mobile): Performance 79 (antes 60-70), LCP 3.8s (antes 12.3s), Peso total 22.5 MB (antes 41 MB), DOMContentLoaded 2.07s (antes 3.2s).

S20 — Fix CSS, efectos en Promo, URL corta
Hover de tarjetas: eliminados will-change y scale() (causaban shift). Crossfade puro. Scanner de Vite: sacados SCHEMA_PRICES/SCHEMA_ORG del frontmatter (rolldown fallaba). JSON-LD inline en <head> con @graph. Popup Promo: flicker de encendido + pulso neón + scanlines. URL corta krakoa.netlify.app con _redirects (bio IG usa URL de GitHub).

S21 — Cotizador offline y definición de Roadmap
Cotizador de costos/venta en cotizador.html (externo al repo): pliegos DTF con Guillotine Best-Area-Fit, márgenes de borde y entre estampas, gráfico SVG, precios sugeridos. Charla extensa sobre mejoras a futuro. Roadmap priorizado (Fase 0 a Fase 6). Ver §8.

S22 — Modal CRT + switch glitch + limpieza del carrusel
Animación de apertura/cierre del modal reemplazada por CRT Power On/Off con scanlines (desktop y mobile). .is-closing con modalCloseTimer (380ms). Cambio de producto ahora RGB split suave + ruido teal + viñeta solo sobre .modal-image-area:

RGB split en .modal-grid (drop-shadows magenta/cian, steps(7), 0.24s).

Ruido teal en .modal-image-area::before (SVG feTurbulence + feColorMatrix con R=0.03, G=0.12, B=0.10; grano baseFrequency=0.25, tile 500x500). z-index 1.

Viñeta W2A en .modal-image-area::after (radial gradient). z-index 2.

Flechas y overlay en z-index 3/4.

Columna de info limpia (sin ruido ni viñeta).

Eliminado overlay "Modelo" / "1/4" del carrusel.

Bug fix: había un bloque CSS remanente de un demo viejo (switchStaticNoise, ruido fino) que se sumaba encima del teal y causaba flash blanco. Eliminado.

Lección: feTurbulence genera píxeles blancos puros que se leen como "flash". Solución: feColorMatrix para teñir.

S23 — Netlify, Promo CRT, Zoom con rueda, Barra Combinada
Descartado Lazy Loading (Fase 0) y Feedback táctil (F2-b). Netlify: index.html con meta OG + meta refresh + window.location.replace. Promo con animación CRT igual al modal. Zoom con rueda (1x-4x, anclado al cursor) + pan cuando >1x + click cierra solo en 1x. Barra combinada (Header + Categorías): desktop absorbe logo/lupa/carrito con position: absolute a los costados (left/right: 5vw), botones con padding: 0 70px. Mobile: grid de 4 columnas falló (sombras largas, temblor por reflow). Header con glitch real (logoGlitch) en vez de slide+fade. Lupa mobile no se anima al volver.

S24 — Barra mobile estabilizada, Lupa compacta, Auto-slide definido
Temblor mobile resuelto: iconos del modo compacto aislados con contain: layout style paint + transform: translateZ(0).

Espaciado mobile: grid → flex-wrap. category-break invisible después del 4to botón (4 arriba, 3 abajo). margin-bottom: 6px en primeros 4, pisando gap general.

Lupa compacta (Desktop): altura resuelta quitando :global(), forzando top: 0; bottom: 0; margin: auto + width/height: 42px; padding: 0; flex center dentro de @media (min-width: 701px). Quedan detalles finos de alineación del SVG (pendiente).

Bottom Sheet: descartado definitivamente.

Auto-slide en tarjetas mobile: reglas definidas (ver §9). Implementación próxima sesión.

Roadmap (referencia)
Fases acordadas en S21. Fase 0 (lazy) y F2-b (feedback táctil) descartadas en S23. Bottom Sheet descartado en S24.

Fase 1: (parcial, ver S24) Rediseño modal mobile → descartado. Quitar "1/4" → hecho en S22. Swipe cambiar producto → pendiente.

Fase 2: Auto-rotación de imágenes → próxima (reglas en §9).

Fase 3: Parallax hero + fade+glitch en tarjetas (parallax/glitch full solo desktop; mobile solo fade limpio).

Fase 4: Sugerencia de tiers en carrito, buscador "sin resultados" con sinónimos, 404 custom.

Fase 5: Productos relacionados (casi descartado).

Fase 6: Selector de color (subcarpetas), Wishlist.


Parte A (Historial)
S25 — Barra compacta definitiva, búsqueda sin scroll, "sin resultados"
Recompresión del contexto: se reescribió el archivo entero. Pasó de ~500 líneas a ~330. Historial viejo (S1–S15) comprimido a una línea cada uno. Se unificaron las "Partes B" de S21–S24 en el cuerpo. Roadmap de S21 al final como referencia.

Barra compacta — solución definitiva: los 3 problemas de alineación (logo/lupa/carrito desalineados de los botones, panel de búsqueda descolgado, carrito hundiéndose durante el glitch) se debían a que se estaba mezclando position: absolute + transform: translateY(-50%) para centrar, y luego se intentaba compensar con top/bottom + translateY(5px). El glitch pisaba el translateY, y el contain de S24 pisaba todo con transform: translateZ(0). Se resolvió eliminando el position: absolute de los 3 iconos y dejando que el align-items: center del padre .categories haga el centrado. Se limpió el transform: translateZ(0) del bloque contain. El centrado ya no depende de ningún translateY, así que el glitch no puede hundir nada.

Búsqueda desde la barra compacta: al escribir, filterProducts() reordena el DOM y el scroll-anchoring nativo dejaba al usuario pegado a la última sección (Preguntas Frecuentes). Se agregó scroll explícito al inicio de la grilla dentro del listener de input del buscador compacto (con behavior: "auto" porque el debounce reinicia la animación).

Bloque "sin resultados": nuevo bloque #no-results (hermano de #products, no adentro) que aparece cuando el filtro deja la grilla vacía. Título + subtítulo ("Revisá la ortografía o navegá por nuestro catálogo.") + botón "Ver todo el catálogo" que limpia búsqueda y categoría, sube al inicio con smooth. filterProducts() togglea hidden según toShowSet.size > 0. El bloque usa el mismo truco full-width que #products (left: 50%; width: 100vw; transform: translateX(-50%)) para que el centro coincida con el centro de las tarjetas.

Lección técnica: centrar con position: absolute + translateY(-50%) es frágil — cualquier transform que aplique otra regla o animación lo rompe. Para barras con hijos de distinto alto, usar flexbox (align-items: center) y dejar que el layout haga el centrado.

Parte A — Historial de sesión
S26 — Auto-slide + hover slide unificado en tarjetas
Qué se hizo: rotación automática aleatoria de las tarjetas del catálogo entre las dos imágenes existentes (modelo ↔ remera), en mobile y desktop, con precarga condicional. Además se unificó el hover de desktop con la misma animación.

Sistema del auto-slide:

Global, no por tarjeta. Un solo timer cada 2-10s (random) elige 1-2 tarjetas visibles al azar y las anima.

Solo tarjetas al 75% visibles (threshold 0.75 del IntersectionObserver). Si el modal tapa todo, ninguna rota; si deja algunas visibles al 75%, siguen.

Cooldown de 6 turnos por tarjeta: una que ya rotó no vuelve a ser candidata hasta que pasen 6 disparos globales (~30-60s según el ritmo). Si todas las visibles están en cooldown, se resetean los lastTurn para que vuelvan a ser candidatas.

No contiguas: cuando se eligen 2, no pueden ser adyacentes ni en la misma fila (a distancia de un gap) ni en la misma columna. Se verifica con getBoundingClientRect().

Hold 3-5s (random): la remera entra, se sostiene, y sale. Modelo es el estado base al que siempre vuelve.

Dirección única: la remera entra desde la derecha (translateX(100%) → 0) y sale hacia la derecha (0 → translateX(100%)). Sin scale. 0.32s con ease. La base (modelo) nunca se mueve.

Precarga condicional: en mobile la remera se descarga solo cuando le toca rotar (new Image() + onload + recién ahí src = data-src). En desktop se descarga al 10% visible (equivale a lazy).

Pausas: document.hidden, filtro/búsqueda en curso (.is-revealing), y cualquier overlay abierto (.modal.open, .cart-drawer.open, .mobile-menu.open, .image-zoom.open, .promo-modal.open).

Hover unificado (desktop ≥901px):

Misma animación que el auto-slide: la remera entra desde la derecha, se sostiene, y sale hacia la derecha.

Hover durante "holding": se cancela el holdTimer, la remera queda visible hasta que el mouse salga.

Hover durante "out" (la remera se está yendo): rebota y vuelve a entrar.

Hover durante "in": no interrumpe, deja terminar la entrada.

Se eliminó el :has() y la transición base del CSS de las imágenes. La animación vive 100% en JS. Esto resuelve el caso "hover antes de que la remera esté cargada" sin CSS.

Cambios al template:

.product-image-hover: src → data-src (con data-src={...} en el render de Astro). El JS decide cuándo setear src.

Se eliminó el @media (max-width: 900px) { .product-image-hover { display: none; } }. En mobile la remera ya no está oculta por CSS: la maneja el JS.

Lecciones técnicas:

El display: none en mobile ahorraba ~10 MB de descargas. Con el auto-slide, la remera se baja igual, pero la precarga condicional evita bajarla si nunca rota.

El :has() en CSS era necesario para que el hover no mostrara una imagen vacía antes de que cargara. Se resolvió moviendo todo al JS: la animación no arranca hasta que la imagen está cargada.

La máquina de estados por tarjeta (_state.phase: idle / in / holding / out) es lo que permite que hover y auto-slide compartan la misma animación sin pisarse.

Cómo se probó: verificado en mobile (DevTools + real) y desktop. Rotaciones de a 1-2, no contiguas, cooldown funcionando, hover con rebote al entrar durante "out", hover cierra el holdTimer si estaba en "holding", pausas por overlay/hidden/filtro funcionando. Regresión ok: click abre modal, modal muestra la remera en galería, swipe mobile sigue funcionando.

⏭️ Próxima sesión: S27 — Slide del carrusel del modal
Objetivo: unificar el slide del carrusel del modal de producto con el estilo del auto-slide de las tarjetas.

Decisiones ya tomadas (respuestas del usuario):

Dirección: mantener la bidireccionalidad del carrusel (next: la nueva entra por derecha y la vieja sale por izquierda; prev: al revés). Es un carrusel real, no la tarjeta.

Scale: sacar el scale(0.98) actual. Solo translateX + opacity.

Timing: mantener el cubic-bezier(0.22, 1, 0.36, 1) del modal (más "premium" para imagen grande). El auto-slide de la tarjeta usa ease porque la tarjeta es chica, pero en el modal se siente mejor el bezier.

"Ver tabla de talles" y thumbnails: en lugar de saltar directo con fade, hacer un "fast-forward": recorrer todos los slides intermedios con animación direccional corta, en lugar de un fade.

Preguntas pendientes para S27 (a resolver con el usuario antes de escribir):

Sobre el slide del carrusel (cambios 1-3):

Confirmar que los valores actuales de animación del modal (translateX(±30px) + scale(0.98) + 0.32s + bezier) pasan a translateX(±100%) + sin scale + 0.32s + bezier.

Confirmar que el will-change de las dos capas del modal (modal-image-a / modal-image-b) se mantiene o se ajusta.

Sobre el fast-forward (cambio 4):

Duración por paso intermedio: ¿cuánto dura cada transición intermedia? Recomiendo 120-150ms (más rápido que el paso normal, para que se sienta "rápido" y no un recorrido manual).

Duración total: ¿fija (ej. 300ms totales sin importar cuántos pasos) o variable (120ms × cantidad de pasos)? Recomiendo variable: es más simple y se siente natural.

Cancelación: ¿el fast-forward se puede interrumpir tocando una flecha o un thumbnail mientras corre? Recomiendo sí: cancelar el recorrido y saltar directo al destino tocado.

Tabla destino: cuando "Ver tabla de talles" llega al slide final, ¿la tabla entra con el mismo slide direccional que las fotos, o con un fade suave (porque es una tabla, no una foto)? Recomiendo fade suave para diferenciar.

Tabla de talles destino: "Ver tabla de talles" salta a la tabla del corte actual (Oversize: length - 2; Regular: length - 1). En el fast-forward, ¿pasa también por la otra tabla si está en el camino? Ejemplo: si estoy en modelo (índice 0) y pido Oversize (índice 3), paso por 1, 2, 3. No paso por 4 (Regular), que está después. Pero si pido Regular (índice 4) estando en 0, paso por 1, 2, 3, 4. ¿Está bien? Recomiendo sí, es coherente con "pila real".

Detalles técnicos para S27:

El renderModalImage(direction) actual solo maneja un paso. Para el fast-forward, se necesita una función nueva (o extender la actual) que reciba un array de índices intermedios y los anime en cadena. O bien, un loop for que llame a renderModalImage("next") con un await sleep(stepDuration) entre cada uno.

Hay un timer de cleanup de 340ms después de cada transición (setTimeout(cleanup, 340) dentro de renderModalImage). Con fast-forward, hay que asegurarse de que no se solapen ni se cancelen entre pasos. Posible solución: guardar un ID de la operación actual y chequear antes de cada cleanup.

El listener de swipe (modalImageWrapper touchstart/touchend) y el de click (para zoom) deben seguir funcionando igual durante y después del fast-forward.

Otros pendientes que siguen abiertos (no bloquean S27):

Roadmap Fase 3-6 (parallax hero, fade+glitch tarjetas, sugerencia de tiers en carrito, buscador con sinónimos, 404 custom, productos relacionados, selector de color, wishlist). Nada urgente.

Performance de backdrop-filter en mobile de gama muy baja: hoy blur(6px). No se reprodujo problema hasta ahora.


S27 — Slide del modal sin scale, fast-forward descartado, auto-slide adaptativo
Tres temas, uno de ellos con ida y vuelta.

Slide del carrusel del modal (pendiente de S26). Se unificó al estilo de las tarjetas: la imagen entra desde el costado con translateX(±100%) y la vieja sale hacia el opuesto, sin scale, sin fade. Mantiene 0.32s + cubic-bezier(0.22, 1, 0.36, 1) (el bezier "premium" que ya tenía). Se eliminó el modo "fade" (enter-fade / leave-fade) del CSS y del JS: ya no se usa. renderModalImage ahora recibe (direction, cleanupDelay = 340) y usa renderToken para descartar cleanups huérfanos cuando el usuario clickea rápido. El will-change de las dos capas se mantiene.

Fast-forward (recorrido por slides intermedios). Se implementó primero para "Ver tabla de talles" (que tenía el bug de saltar por todos los slides con fade, sin importar la distancia) y después para thumbnails. Funcionó técnicamente pero el usuario lo descartó tras probarlo:
- El recorrido por intermedios resulta más denso que útil: "quiero ver la última foto, no pasear por las del medio".
- En mobile se veía mal (imágenes sin cargar + duración muy corta se leían como bug).
- La curva ease-in-out (amp 0.6) ayudó pero no rescató la idea.
Decisión final: thumbnails y "Ver tabla de talles" saltan DIRECTO con renderModalImage (un solo slide direccional), sin recorrido. La función fastForwardToSlide se eliminó por completo, junto con ffToken, la clase .is-fastforwarding y la variable CSS --ff-step-duration. No re-proponer.

Queda como mejora independiente: precarga de imágenes al abrir el modal (openModal y loadProductIntoModal recorren currentImages con new Image() en paralelo). Útil para flechas rápidas y para el cambio de producto.

Auto-slide del catálogo (S26 dejó un hueco). El timer global disparaba cada 2-10s, pero con hold de 3-5s por tarjeta eso dejaba ventanas de hasta 10s sin ninguna animación en pantalla. Dos ajustes:
- Delay adaptativo en scheduleNextSlide: si countActiveSlides() === 0 (ninguna tarjeta en fase "in" o "holding"), delay 300-800ms para que arranque rápido. Si ya hay alguna activa, delay 1.5-5s para que se superpongan sin amontonarse.
- Cooldown dinámico en triggerRandomSlides: effectiveCooldown = min(6, max(2, visibleCards.size * 2)). Con pocas tarjetas visibles (viewport angosto), el cooldown baja a 2 para que roten más seguido. Con muchas, se mantiene en 6.
Nueva función countActiveSlides() recorre visibleCards y cuenta las que están en "in" o "holding".

Lección técnica: un timer "cada X segundos" no garantiza actividad continua si cada acción dura menos que X. Hace falta que el scheduler mire el estado actual (¿hay algo animándose?) y ajuste el próximo delay en función de eso. Es el patrón "scheduler reactivo" en vez de "scheduler fijo".

Cómo se probó: verificado en desktop y mobile. Rotaciones frecuentes sin rachas muertas de 8-10s, no más de 2-3 tarjetas activas al mismo tiempo, hover pausa la tarjeta apuntada sin frenar las otras, overlays abiertos pausan todo, cambio de categoría no dispara durante .is-revealing. Carrusel del modal: slide direccional sin scale, thumbnails y "Ver tabla de talles" saltan directo, sin recorrido.

⏭️ Próxima sesión: S28 — correcciones sobre otros temas de la página (a definir con el usuario: ajustes de CSS/HTML de secciones existentes, detalles finos, mantenimiento).


S28 — Barra compacta mobile: grid 3×2 + lupa, logo clickeable, fix badge, categorías renombradas
Recompresión: no (se mantiene la compresión de S25).

Barra compacta mobile: las categorías volvían a 3 filas al entrar en modo compacto (el logo y el carrito robaban ancho). Se resolvió con:
- Renombrar categorías: "Cine y Series" → "Cine y TV", "Videojuegos" → "VideoGames" (libera ~30px). Los ids NO cambiaron.
- Gap horizontal de .categories-buttons unificado a 4px (antes 8px en fija, 4px en compacta) — el cambio de gap al scrollear se notaba.
- Padding lateral de .categories-buttons en compacto: 10px → 4px.
- Gap del .categories.compact: 6px → 4px → 2px.
Total liberado: ~55-60px. Los 4 botones de la primera fila entran en 320px.

Fix del badge del carrito recortado: el `contain: paint` del .categories-compact-cart recortaba el badge (top: -6px; right: -6px). Se sacó `paint` solo del carrito (queda `contain: layout style`). Logo y lupa mantienen `paint`.

Logo compacto clickeable: el .categories-compact-brand pasó de `<div aria-hidden="true">` a `<button>` con listener de click que scrollea al top (mismo comportamiento que el botón "volver arriba"). Al subir, el header vuelve a la vista y la barra sale del modo compacto sola.

Lupa de vuelta en mobile: se reintentó la lupa en el compacto mobile (descartada en S23/S24 por falta de ancho). Esta vez la lupa se apila DEBAJO del carrito, en una tercera columna del grid:
- Mobile: .categories.compact pasa a grid 3 columnas × 2 filas (areas: "brand buttons cart" / "brand buttons search"). Col 1: isotipo (centrado vertical). Col 2: botones (4+3) o panel de búsqueda. Col 3: carrito (arriba) + lupa (abajo).
- Desktop: sin cambios estructurales (sigue flex row), pero la lupa ahora comparte aspecto con mobile (fondo blanco, ícono oscuro).

Toggle lupa ↔ X: el .categories-compact-search-toggle tiene 2 SVGs (lupa + X). CSS alterna según .search-open. En mobile, al abrir el panel la lupa se transforma en X en el mismo lugar (reemplaza, no se oculta). El × interno del panel (#search-compact-close) se oculta en search-open. Cierre limpia input y restaura catálogo (handleCloseCompactSearch, usada por toggle-X, × de desktop y Escape).

Bug crítico de rolldown: al correr `npm run dev`, el scanner de Vite 7 fallaba con `PARSE_ERROR: Unexpected token` en `virtual-module:.../index.astro`. Causa: había un `<script>` literal dentro de un comentario CSS (el bloque "Auto-slide + hover slide" decía "(ver bloque AUTO-SLIDE + HOVER en el <script>)"). El scanner busca la subcadena `<script` en cualquier parte del archivo, incluso en comentarios, y trata de parsear lo que sigue como JS. Solución: cambiar `<script>` por "el bloque JS del final del archivo" en el comentario. Va a §5 como lección.

Alturas del compacto: la barra cambiaba de alto al abrir/cerrar la búsqueda. Primer intento (min-height 89px desktop / 102px mobile) no alcanzó. Segundo intento (min-height 95px / 105px) tampoco: el input tiene `height: 100%` y con min-height el padre no le da altura, así que colapsaba. Solución definitiva: `height` fija (no min-height) en el panel (51px desktop) y en la barra (95px desktop). Mobile queda con `min-height: 105px` que ya funcionaba (el grid mantiene la altura aunque el panel sea más bajo).

Lecciones técnicas:
1. `<script>` literal en comentarios CSS rompe rolldown. Nunca ponerlo; referirse como "el bloque JS".
2. `min-height` no sirve si el layout depende del hijo más alto y el estado cambia. Usar `height` fija + align-items: center. Y si un hijo tiene `height: 100%`, el padre necesita height fija.
3. El scanner de rolldown puede fallar "silenciosamente" en sesiones anteriores (cacheado) y explotar al invalidar el cache. Si aparece un PARSE_ERROR raro, buscar `<script` en comentarios.

Cómo se probó: verificado en mobile (DevTools 375px, 320px) y desktop. 2 filas (4+3) en compacto, gap de 2px entre logo/bloque y bloque/carrito, badge sin recorte, logo clickeable (scroll al top), lupa apilada debajo del carrito, toggle lupa↔X, panel de búsqueda estable en altura, Escape cierra + limpia, error de rolldown resuelto.

⏭️ Próxima sesión: S29 — a definir.

<!-- Próxima sesión: pegar acá abajo el bloque nuevo. -->