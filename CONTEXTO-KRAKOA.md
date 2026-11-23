CONTEXTO — Proyecto KRAKOA Web
Archivo de contexto para abrir chat nuevo con IA.
Versión: Compresión S36 (2026).

Índice: §0 actualizar · §1 proyecto · §2 estructura · §3 mapa del sitio · §4 sistemas transversales · §5 reglas técnicas · §6 convenciones IA · §7 decisiones descartadas · §8 ideas futuras · §9 pendientes · §10 protocolo chat nuevo · §11 historial · §12 flujo de modelo nuevo.

Cómo actualizarlo: ver §0. Cada sesión nueva se agrega como un bloque al final del §11. No hace falta tocar el resto.

§0 — Cómo actualizar este archivo
Cada sesión nueva: al cerrar el chat, la IA te da un bloque que pegás al final del archivo (§11). Ese bloque tiene dos partes:

Parte A (siempre): entrada de historial de la sesión.

Parte B (opcional): cambios al cuerpo del archivo, en formato "Buscá esto / Reemplazá por". Solo si la sesión cambió algo estructural (nueva deuda, deuda cerrada, decisión tomada, cambio de stack, etc.).

Cada 10-15 sesiones: reescritura completa del archivo (compresión del historial viejo + reorganización). La IA te guía. Última recompresión: S36 (esta). Anterior: S25.

Regla de oro: si dudás, no toques §1–§10 ni §12. Agregá todo al historial del §11 y listo. El cuerpo se mantiene estable.

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
├── catalogo/<cat>/<modelo>/    ← JPG originales (producto legacy, 1 color)
│   ├── modelo.jpg
│   ├── remera.jpg
│   └── extra-*.jpg (opcional)
│
├── catalogo/<cat>/<modelo>/    ← JPG originales (producto con colores, S34)
│   ├── meta.json               ← opcional: { "defaultColor": "negro" }
│   ├── negro/
│   │   ├── modelo.jpg
│   │   ├── remera.jpg
│   │   └── extra-*.jpg (opcional)
│   └── blanco/
│       ├── modelo.jpg
│       └── remera.jpg
│
├── talles/{oversize,regular}.jpg
├── promo/{config.json,*.jpg}
│
├── public/
│   ├── catalogo/<cat>/<modelo>/*.webp   (generado incremental, S32)
│   │   (3 variantes por modelo y remera: 1000w, -600.webp, -400.webp.
│   │    Los extra-*.webp son solo 1000w. Los OG son .jpg aparte.)
│   ├── catalogo/<cat>/<modelo>/*-og.jpg (generado, S32 — 1200×630 JPG)
│   │   (misma estructura con subcarpetas de color si el producto tiene colores)
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
    └── pages/
        ├── index.astro                  ← TODA la web
        ├── 404.astro                    ← página 404 custom (S31)
        └── producto/[slug].astro        ← página puente OG (S32)
Sin componentes separados ni layouts. Todo vive en index.astro.

Script de publicación (ACTUALIZAR WEB.bat):

node scripts\generar-catalogo.mjs → catálogo + sitemap + imágenes
  (S32: incremental + paralelizado. Solo regenera imágenes cuyo
  source cambió. ~5-10s si no tocaste nada, ~10-15s por producto
  nuevo. Caveat: si cambiás calidad/dimensiones en optimizeImage
  o generateOgImage, hay que borrar public/catalogo/ a mano una
  vez y volver a correr.)

  (S34: si hay productos con 2+ colores sin meta.json, el script
  pregunta el color default al principio, agrupado. Si hay productos
  con 1 solo color, crea el meta.json automáticamente. Si process.stdin
  no es TTY, no pregunta y cae al fallback alfabético.)

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

Full-width vía left: 50%; width: calc(100vw - var(--sbw, 0px)); transform: translateX(-50%). Sin border-radius.

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

Efecto "ventana" (S29): el texto de los botones es Arial 900, 21px desktop / 15.5px mobile, line-height 1, letter-spacing -0.135em. Las palabras se salen del recuadro y se recortan por overflow: hidden del botón. El ancho del recuadro lo fija un ::before invisible con `font: inherit` del botón original. Cero cambios de layout. Aplica igual en barra fija y compacta.

Glitch al hover/click (S29): al hover (solo `hover: hover and pointer: fine`, y solo si NO está activo) y al click/tap cuando queda .active. El glitch aleatorio cada 3-7s sigue funcionando. El chequeo de .glitching evita solapamientos.

Grilla full-width (100vw + translateX(-50%)).

Tinte de fondo por categoría: dos capas (#catalogTintA/B) con clip-path. Slide derecha→izquierda al cambiar categoría (0.55s).

Marquesina diagonal del tinte (S31): el nombre de la categoría repetido ("ANIME ANIME ANIME...") en diagonal a -45°, varios renglones con tamaños alternados (60-110px), direcciones alternadas (pares a la izquierda, impares a la derecha), velocidad 80s por loop. Vive dentro del tinte, se hereda el barrido entre categorías del `clip-path` del padre (se va con la capa vieja, entra con la nueva). Opacidad del texto 0.05 (muy sutil, no compite con las tarjetas). Se genera desde JS con `renderTintMarquee(layer, categoryName)`. Tamaños en `sizes = [95, 75, 110, 60, 85, 105, 70, 90]`. Delay aleatorio negativo por renglón para que no se muevan sincronizados. Pausa al scrollear, off-viewport, y con overlays abiertos (body classes).

Bloque "sin resultados" (#no-results, S25): hermano de #products (no adentro), aparece cuando el filtro deja la grilla vacía. Título + subtítulo ("Revisá la ortografía o navegá por nuestro catálogo.") + botón "Ver todo el catálogo" que limpia búsqueda y categoría, sube al inicio con smooth. filterProducts() togglea hidden según toShowSet.size > 0. Usa el mismo truco full-width que #products para centrar.

Tarjetas:

Dos <img>: base (modelo) y hover (remera).

Base usa srcset (S31): 400w/600w/1000w + sizes="(max-width: 900px) 50vw, (max-width: 1400px) 33vw, 25vw". src="modelo.webp" (1000w) como fallback. El JS del modal, hero, zoom, auto-slide NO se toca: siguen usando 1000w.

Badge de colores (S35, badge fuera del botón en S36): si el producto tiene 2+ colores, aparece un `<span class="product-colors-badge">` arriba a la derecha de la tarjeta (fuera del `<button class="product-button">`, hermano del botón, hijo directo del `<article>`). Fondo con `color-mix` del color de la categoría. Dots de 16px desktop / 18px mobile, hasta 4, con `+N` si hay más. Dots clickeables (cambian las imágenes de la tarjeta sin abrir el modal) y con `title`. El fondo del badge NO abre el modal.

Hover (desktop ≥901px) y auto-slide (mobile + desktop): misma animación. La remera entra desde la derecha (translateX(100%) → 0), se sostiene, y sale hacia la derecha (0 → translateX(100%)). Sin scale. 0.32s ease. Modelo es el estado base. La animación vive 100% en JS (no en CSS). Ver §4 "Auto-slide + hover slide".

Overlay con degradado tintado. En hover se desliza abajo y desvanece.

object-fit: cover, object-position: 50% 50%.

Skeleton loader (shimmer).

Nota: La barra combinada en mobile se estabilizó en S24 (contain + flex-wrap + category-break). En S28 se reescribió el compacto mobile: ahora es un grid 3×2 (logo | botones | carrito arriba / lupa abajo). Si se retoca, ver §11 S24/S28.

Cómo Comprar (#como-comprar)
Acordeón de 5 preguntas, header centrado, bloque "¿Consulta especial?" con WhatsApp. Solo uno abierto a la vez.
S30: el h2 hace glitch de entrada al viewport (una sola vez, ~450ms). Cada pregunta hace glitch al abrir/cerrar (~320ms, solo el span del texto; el chevron rota normal). El CTA "Hablar por WhatsApp" tiene glow pulsante (reusa whatsappGlowPulse del carrito; se pausa al hover).

Calidad y Materiales (#calidad)
4 pilares + guía de cuidado. Header centrado. Tarjetas con texto interno a la izquierda.
S30: el h2 hace glitch de entrada al viewport (una sola vez, ~450ms). Un título de pilar al azar hace glitch cada 20-30s (solo si la sección está en viewport). Al hover del pilar, el ícono hace flicker (~0.35s) + drop-shadow con su color propio (currentColor).

Footer
Tres columnas centradas (logo vertical + texto + links).

Partículas blancas subiendo (22 desktop / 10 mobile, por JS desde S31).

Copyright ("© 2026 KRAKOA powered by BARRIOPURO").

S30: scanlines horizontales ultra sutiles de fondo (2% blanco, mismo patrón que el hero pero más tenue), por debajo de las partículas y del contenido. El logo vertical del footer hace glitch ocasional (25-40s, solo si el footer está en viewport). El copyright NO tiene glitch (a 11px los cortes no se leen).

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

404 custom (`src/pages/404.astro`, S31)
Página independiente. "404" en Arial 900 (Payback no tiene numerales) con glitch ocasional cada 4-8s. "KRAKOA" en KrakoaFont (KRA amarillo + KOA blanco) abajo del 404. Botones "Volver al catálogo" (amarillo KRA) e "@krakoa.sw". `<meta name="robots" content="noindex, follow" />`. Astro la publica como `dist/404.html` automáticamente; no requiere cambios en el `.bat` ni en `astro.config.mjs`.

Página puente OG (`src/pages/producto/[slug].astro`, S32)
Genera ~99 HTML (uno por producto) vía `getStaticPaths`. Cada uno tiene los meta tags OG/Twitter correctos (`og:image` = `remera-og.jpg`, `og:title` = "KRAKOA | Nombre", `og:type=product`) y redirige a `/#slug` con `window.location.replace()` (fallback `<meta http-equiv="refresh">` + `<noscript>`). `robots: noindex, follow` para evitar contenido duplicado. El botón "Compartir" del modal arma esta URL; el navegador sigue mostrando `/#slug` mientras se navega. Los scrapers de redes leen los metas del HTML puente; el usuario cae en el modal abierto.

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

Estructura: { key, name, image, fit, size, quantity, color }. key = ${name}__${fit}__${size}__${colorKey} (S34). Productos sin colores usan "unico". Items viejos (sin color) se manejan con item.color ?? "unico".

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

Body de arriba a abajo (con colores): color → corte → talle (+alto × ancho cm) → cantidad → precio.
Body sin colores: corte → talle → cantidad → precio (la numeración de pasos se ajusta dinámicamente: con colores, Corte=2 y Talle=3; sin colores, Corte=1 y Talle=2).

Selector de color (S34): círculos de 32px (28px mobile), con `title` (tooltip nativo) y `aria-label`. Sin nombre visible al lado. El nombre del color seleccionado se muestra en el label del paso ("1. Color: Negro"). Borde con el color de la categoría cuando `.active`. Borde interno sutil para que negro/blanco se lean.

Galería: dos <img> apiladas (#modal-image-a / #modal-image-b) para transición direccional. Slides: modelo, remera, extras, y siempre las 2 tablas de talles. Al abrir el modal (openModal y loadProductIntoModal) se precargan TODAS las imágenes del producto con new Image() en paralelo, para que las flechas rápidas y el cambio de producto se sientan fluidos.

Thumbs a 400w (S33): `openModal` y `loadProductIntoModal` agregan `thumbSrc: modelo400` / `thumbSrc: remera400` a los dos primeros items de `currentImages`. Extras y tablas de talles no tienen `thumbSrc` (fallback al `src`). `renderThumbs()` usa `image.thumbSrc || image.src`.

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

Scroll lock: lockBodyScroll() compensa ancho de barra con padding-right. Ver §5 "scrollbar-gutter".

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

Sistema de colores de tela (S34-S36)
Productos con 2+ colores. Los de 1 solo color se tratan como legacy.

Estructura: `catalogo/<cat>/<modelo>/<color>/{modelo.jpg,remera.jpg}`. `meta.json` opcional con `{ "defaultColor": "negro" }`. Si no existe, `generar-catalogo.mjs` lo crea automáticamente (con el único color si hay 1, o preguntando al principio del build si hay 2+).

JSON por producto:
  - `colors: { negro: { name, hex, modelo, modelo400, modelo600, remera, ..., ogImage, extras }, blanco: {...} } | null`.
  - `defaultColor: "negro" | null`.
  - Campos top-level (`modelo`, `remera`, `ogImage`, `extras`) = espejo del default. Todo el código legacy sigue funcionando sin tocarse.

Script 3 (`3 Finalizar_Mockups_KRAKOA.jsx`):
  - Pregunta el color (ventana con botones + "Otro..."). Normaliza a slug.
  - Subcarpeta por color en local (`carpetaOriginal/<color>/`) y en `catalogo/<cat>/<modelo>/<color>/`.
  - "Ya existe" se verifica sobre la carpeta del color (no la del modelo).

Web:
  - `hasColors = !!colorsData && Object.keys(colorsData).length > 1` (¡> 1, no > 0!).
  - `currentColor` se resuelve con `resolveColorForProduct`: memoria por producto (Map en memoria, no persiste al recargar) → defaultColor → alfabético.
  - `buildImagesForColor(colorData)`: arma `currentImages` desde los paths del color.
  - `selectColor(slug)`: cambia color, mantiene slide actual (por label), cierra zoom, actualiza tarjeta (imágenes + dot activo), recuerda color por producto.
  - Carrito: `key = ${name}__${fit}__${size}__${colorKey}`. Productos sin colores usan `"unico"`. Items viejos (sin `color`) se manejan con `item.color ?? "unico"`.
  - WhatsApp: línea `- Color: *${colorName}*` solo si hay color != "unico".
  - Tarjeta: badge con dots clickeables, fondo con color de categoría, `pointer-events` capturado. El badge vive FUERA del `<button>` (S36, para evitar el rebote del `:active`).

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

Búsqueda desde la barra compacta (S25): al escribir, filterProducts() reordena el DOM y el scroll-anchoring nativo dejaba al usuario pegado a la última sección. Solución: scroll explícito al inicio de la grilla dentro del listener de input del buscador compacto (con behavior: "auto" porque el debounce reinicia la animación).

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

Glitch del logo del header: cada 15-30s, 420ms.

Glitch de la lupa del header (S29): al volver del modo compacto, la lupa del header (mobile) hace glitch junto con logo y carrito. El cuadro de búsqueda del header (desktop) también hace glitch, usando `searchFieldGlitch` + `searchShake` + `searchPlaceholderGlitch` (NO `logoGlitch`, porque este último tiene `scale: -1 1` que refleja el texto del input).

Glitch al hover/click de categorías (S29): cada categoría hace glitch cuando se eleva.
  - Hover (solo `hover: hover and pointer: fine`): glitch al `mouseenter`, solo si NO está activo.
  - Click/tap: después de aplicar el filtro, si el botón quedó `.active` (elevado), glitch. Listener en botón y en wrap.
  - El glitch aleatorio (cada 3-7s en un botón al azar) sigue funcionando. Los dos no se pisan gracias al chequeo de `.glitching`.

S30 — Glitches en secciones pre-glitch:

- Cómo Comprar: h2 glitch al entrar al viewport (una vez, 450ms, delay 250ms tras el fade+slide). Cada pregunta glitch al abrir/cerrar (320ms, solo el span del texto; el chevron rota normal).
- Calidad: h2 glitch al entrar al viewport (una vez, 450ms). Un título de pilar al azar cada 20-30s (400ms, solo si la sección está en viewport).
- Footer: logo vertical glitch cada 25-40s (420ms, solo si el footer está en viewport). El copyright NO.
- Reusan modalTitleGlitch (h2, preguntas, pilares) o logoGlitch (logo del footer). Sin keyframes nuevos (excepto iconFlicker de los íconos de pilar).

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

Sección Calidad (subtítulo): con <span class="brand-inline"> (S29).

Footer, párrafo descriptivo: con <span class="brand-inline"> (S29).

Footer, copyright: con <span class="brand-inline"> (S29). A 11px los cortes no se leen perfecto, pero el usuario lo aprobó.

Reglas de uso (S29):

La marca visible siempre va como <span class="brand-inline"><span class="hero-kra">KRA</span>KOA</span>. "KRA" amarillo, "KOA" blanco. "KOA" es blanco SIEMPRE, sin importar el color del bloque contenedor, porque .brand-inline tiene color: #fff. El amarillo de "KRA" gana porque .hero-kra (hijo) tiene su propio color.

NO se aplica en: logos (son imágenes), title/meta/JSON-LD/alt/aria (no son texto visible), handle de Instagram @krakoa.sw (es un handle, no la marca).

Histórico: hasta S28, la regla era "NO en footer ni copyright". Se cambió en S29 porque el usuario lo aprobó tras verlo.

Reglas de uso:

Tratamiento completo (Payback + KRA amarilla): solo contextos grandes.

Solo KRA amarilla: en párrafos medianos.

Sin tratamiento: texto chico (copyright, alt, metadata).

.hero-kra (amarillo) y .brand-inline (Payback) son independientes. Juntas = logo completo.

Tinte de categoría
Ver §3 "Catálogo".

Skeleton loader
::before en .product-image. Sin .loaded: opaco + shimmer. Con .loaded (agregado por JS al cargar imagen base): desvanece.

Sugerencia de tiers en carrito (S31)
Función `updateCartTierBanner()` llamada al final de `renderCartDrawer()`. Si el pedido está a ≤3 unidades del próximo tier, muestra "Agregá N más y todas salen a $X c/u" en el `#cart-tier-banner` existente con estilo `banner-hint` (amarillo KRA #ffd655). **Regla de turnos**: si hay un banner temporal de cambio de tier en curso (`cartTierBannerTimer` activo), la sugerencia no hace nada; al vencer los 4s del banner temporal, `updateCartTierBanner()` recupera el turno. Reusa `getNextTier()`. Si ya está en el tier máximo (`next === null`) o falta demasiado (>3 unidades), el banner queda oculto.

Pausa global de efectos con overlays abiertos (S31)
Helper `isAnyOverlayOpen()` devuelve true si hay modal, cart, mobile-menu, image-zoom o promo abiertos (incluye estados `.is-closing`). Los schedulers de efectos (glitch hero, typewriter, rotación hero, glitch logo header, glitch categorías, glitch pilares Calidad, glitch logo footer, marquee top) consultan este helper antes de disparar. Los marquees (top y del tinte) se pausan por CSS con las clases `body.modal-open/cart-open/menu-open/zoom-open/promo-open` + `body.tint-paused` (scroll + off-viewport). Clases `body.zoom-open` y `body.promo-open` agregadas en S31 (openImageZoom/closeImageZoomDirect y openPromoModal/closePromoModalDirect).

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

Hover con srcset (S31): `.product-image-hover` tiene `data-src` (1000w), `data-src-400` y `data-src-600`. `pickHoverSrc(hover)` elige la variante según `isDesktop` y `devicePixelRatio`: desktop → 1000w; mobile DPR ≥3 → 600w; mobile DPR <3 → 400w. `triggerSlide()` usa `pickHoverSrc()` en la precarga. Ahorra ~550KB por sesión mobile.

Estado por tarjeta (_state.phase): "idle" | "in" | "holding" | "out". Es lo que permite que hover y auto-slide compartan la animación sin pisarse.

Template: .product-image-hover usa data-src (no src). El JS decide cuándo setear src.
CSS: se eliminó el display: none de mobile y el :has(). Toda la animación vive en JS.

Diferencia con el modal: el modal es un carrusel real (bidireccional: next = derecha→izquierda, prev = izquierda→derecha). Las tarjetas son unidireccionales (siempre entran desde derecha y salen hacia derecha). Pendiente S27: unificar el slide del modal al estilo de las tarjetas.

Preload de las primeras 3 tarjetas (S33)
Bloque `<link rel="preload" as="image" imagesrcset={...} imagesizes={...}>` para `catalogo.products.slice(1, 4)` (el 0 ya está precargado como hero). Usa `imagesrcset` con las 3 variantes + `imagesizes` que matchea el `sizes` del `<img>`. Mejora el LCP del catálogo, no reduce peso.

Barra compacta (Desktop + Mobile)
La barra de categorías (.categories) entra en modo compacto (.compact) cuando el header sale de vista por arriba (IntersectionObserver sobre .site-header).

Desktop (≥701px): flex row. Logo horizontal (120px) a la izquierda, lupa (42px, fondo blanco, ícono oscuro), botones en el centro, carrito (42px) a la derecha. Altura fija: 89px.

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

Alturas (S29):
  - Desktop: .categories.compact { height: 89px } + .categories-compact-search-panel { height: 51px }. Los 89px coinciden con la altura del modo normal (padding 26+12 + contenido 51 = 89), así los botones quedan en la MISMA posición vertical al pasar de compacto a estático (sin saltito de 3px). Antes era 95px.
  - Mobile: .categories.compact { min-height: 105px }. El grid mantiene la altura aunque el panel (36px) sea más bajo que los botones.
  - Lección: usar height fija (no min-height) cuando el contenido puede variar y el layout depende del hijo más alto. Y la altura del compacto DEBE coincidir con la del normal para no generar saltito vertical.

Padding horizontal del compacto desktop (S29):
  - .categories.compact .categories-buttons { padding-left: 56px; padding-right: 84px }. Antes era 0 70px (simétrico).
  - El padding asimétrico compensa que el brand (120px) sea más ancho que toggle+cart (42+8+42 = 92px), lo que corre los botones 14px a la derecha respecto al centro del viewport. Al volver al estático, el padding simétrico 0 70px los recentra, generando un saltito de 14px.
  - Fórmula: padding-left = 70 - (brand - toggle - gap - cart)/2; padding-right = 70 + (...). Si cambian los anchos, recalcular.

Tuning mobile (S31)
- Partículas del footer: 10 en mobile, 22 en desktop (`matchMedia` en el JS). Se eliminó `will-change` de `.footer-particle` (22 capas GPU permanentes era overkill).
- Clarity diferido: el snippet ya no corre en el `<head>` al arranque. Se carga con `["scroll", "click", "touchstart", "keydown", "pointerdown"]` con `{ once: true }` o a los 5s como fallback. El usuario que rebota en <1s no se trackea (pérdida aceptable).
- Blur del carrito y menú mobile: `blur(4px)` → `blur(2px)` + opacidad 0.75 → 0.88 en `@media (max-width: 700px)`.
- `.scroll-progress`: pasa de animar `width` (layout + paint) a `transform: scaleX()` (compositor-only). Esto afecta a TODO el scroll del sitio, no solo al catálogo.
- Blur de la barra sticky de categorías en mobile: `blur(6px)` → `blur(3px)` + opacidad 0.82 → 0.88.
- Grano del body (`feTurbulence` tileado) off en mobile (`@media (max-width: 700px)` con `display: none`). A 0.045 de opacidad era imperceptible en mobile y costaba una capa full-viewport.

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

`contain: paint` recorta `filter: drop-shadow` (lección S29)
Si un elemento tiene `contain: paint` y el glitch usa `filter: drop-shadow` para el RGB split, el `paint` recorta el halo al box del elemento y el glitch casi no se ve. Mismo caso que el badge del carrito en S28. Solución: `contain: layout style` (sin `paint`). Aplica al toggle del compacto (.categories-compact-search-toggle) y al cart (.categories-compact-cart). El brand mantiene `paint` porque es una imagen con alpha y no tiene drop-shadow que recortar.

Clases creadas con `innerHTML` también necesitan `:global()` (lección S31)
No solo las clases que agrega `classList.add` sobre estáticos. Cuando el JS crea nodos con `innerHTML` (por ejemplo `renderTintMarquee()` con `.tint-marquee`, `.tint-marquee-row`, `<span>`), esos nodos NO tienen `data-astro-cid-xxx`. Sin `:global()` en TODOS sus selectores (incluyendo hijos y `:nth-child`), ninguna regla matchea: el elemento queda como `div` block sin estilos, hereda Arial blanco del body, y el efecto no se ve. **Regla**: cualquier clase que agregue el JS con `innerHTML` (no solo `classList.add` sobre estáticos) lleva `:global()` en todos sus selectores CSS.

`<` dentro de `{...}` en Astro puede romper el parser (lección S31)
En expresiones de atributo (`attr={cond < N ? "a" : "b"}`), el `<` a veces se interpreta como inicio de etiqueta y rompe el build con `Expected '>' but found '<'`. Solución: invertir la lógica (`attr={N <= cond ? "b" : "a"}` o `attr={cond >= N ? "b" : "a"}`) y usar solo `>` / `>=` / `>` en lugar de `<` / `<=`. Aplica a cualquier expresión con `<` en el template.

Verificar que no queden restos al reemplazar bloques multilínea grandes (lección S31)
Un copy-paste mal encadenado puede dejar dos aperturas de la misma etiqueta superpuestas y un bloque huérfano de atributos al final (pasó con `<img class="product-image-hover">` en la Tanda C.1). El error de Astro (`Expected '>' but found '<'`) apunta a la línea donde está la **segunda** apertura, no donde está el resto huérfano — y a veces la columna coincide pero la línea no parece tener nada raro. **Chequeo rápido**: buscar etiquetas duplicadas con Ctrl+F en el editor (ej: buscar `<img` dos veces seguidas en un bloque) antes de correr el `.bat`.

`og:image` / `twitter:image` deben ser URLs absolutas (lección S31)
Los scrapers de redes (WhatsApp, Facebook, Twitter, LinkedIn) **NO resuelven rutas relativas** en `og:image` / `twitter:image`. Si ven `content="/krakoa/og-image.jpg"`, la ignoran y no muestran preview. Solución: usar `SITE_ORIGIN + BASE_PATH + "/ruta.jpg"` (constantes del frontmatter), que resuelven a `https://barriopuro.github.io/krakoa/ruta.jpg`. Aplica también a `og:url` (que debe ser absoluta) y a `twitter:image`. Nunca `content={"/ruta.jpg"}`.

`:active` del navegador NO se puede prevenir (lección S36)
`preventDefault()` en `mousedown` no evita que el `:active` del `<button>` padre se dispare al tocar un hijo. El `:active` se activa a nivel navegador y burbujea a los ancestros. La única forma confiable de que un elemento clickeable NO dispare el `:active` del botón contenedor es **sacarlo del botón** (moverlo a un hermano con `position: absolute` respecto a un ancestro `position: relative`). Pasó con el badge de colores en S36.

`> 1` vs `> 0` para "tiene colores" (lección S36)
Un producto con 1 solo color (subcarpeta `negro/` sola) NO debe mostrar selector ni badge: se comporta como legacy. `hasColors = Object.keys(colorsData).length > 1` (no `> 0`). `askDefaults` tampoco pregunta por productos de 1 color (crea el `meta.json` automáticamente). Aplica a `openModal`, `loadProductIntoModal`, `askDefaults` y al template de Astro del badge.

`scrollbar-gutter: stable` NO es la solución al scroll-shift de overlays (lección S29)
Va en `<html>`, no en `<body>`. Y aunque funcione, no cubre elementos con `width: 100vw` (100vw es viewport completo, no afecta el padding del body). Para layouts full-width que no deben cambiar de ancho al abrir overlays, la solución es:
  1. CSS variable `--sbw` (scrollbar width) seteada por JS al cargar y al resize.
  2. Bloques full-width con `width: calc(100vw - var(--sbw, 0px))` en vez de `100vw`.
  3. `lockBodyScroll` ANTES de aplicar `overflow: hidden` (para que `getScrollbarWidth()` devuelva > 0).
  4. Counter en `scrollLockCount` para overlays apilados (carrito sobre modal, etc.).
El counter previene que el padding-right se sume dos veces o se quite cuando otra capa todavía lo necesita.

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
Selector de color de tela	Implementado en S34-S36 (ya no aplica como idea futura).
Cálculo de envío en la web	Idea futura (§8). Por ahora "a coordinar".
Productos relacionados en el modal	Casi descartado. Retomable si surge.
Lazy loading del catálogo (cargar de a 20-30 tarjetas)	La web ya carga bien tras S19. Cargar en tandas rompe el buscador (filtra sobre todo el DOM).
Feedback táctil (vibración + micro-glitch)	Se decidió no sumar vibración. El :active da feedback suficiente.
| Bottom Sheet para el modal en mobile | Descartado definitivamente en S24. |
| Parallax del hero (Fase 3) | Descartado en S30. El hero ya tiene zoom + paneo lento en las imágenes rotativas; sumar parallax scrolleado se sentía cargado y "de más". |
| Fast-forward del carrusel del modal (S27) | Se probó. El recorrido por intermedios es más denso que útil ("quiero ver la última foto, no pasear por las del medio"). En mobile se veía mal (imágenes sin cargar + duración corta se leía como bug). Los thumbs y "Ver tabla de talles" saltan DIRECTO. |
| Hero a 400w/600w (S33) | Riesgo visual: en desktop ancho, el hero se estira y la variante chica se nota. |
| Extraer JS/CSS a archivos externos (S33) | Postergado: complejo, toca `define:vars`. |
| AVIF en hero/modal (S33) | Postergado: complejidad vs beneficio bajo. |
| Quick wins S32: botón "Preguntar por modelo", presets de cantidad, OG del home (S33) | Los 3 descartados por el usuario. |

§8 — Ideas futuras (vivas, sin implementar)

🔴 Próximos (S37+, prioridad alta):
- **Wishlist / favoritos.** Corazón en cada tarjeta + ícono con contador en el header + drawer (patrón del carrito). Guarda en `localStorage` (`krakoa_wishlist`). Integración con el modal (corazón junto a "Compartir"). Detalle de features a definir en sesión aparte (antes de codear).
- **Badges "NUEVO" / "DESTACADO".** Campo opcional en la carpeta del producto (convención `_(nuevo)` / `_(destacado)`, o un `meta.json`). El script lo lee y pone badge en la tarjeta. Los "destacados" pueden ir primero en el orden aleatorio.
- **WhatsApp Business + catálogo.** Prerequisito: número nuevo para KRAKOA (§9). Cargar 10-20 productos a mano alcanza para arrancar. El precio puede no mostrarse en Argentina (verificar).

🟢 Selector de color de tela — RESUELTO en S34-S36
Implementado: script 3 con selector de color, `generar-catalogo.mjs` con detección de subcarpetas, `meta.json` automático, selector en el modal (círculos con tooltip), memoria de color por producto, badge con dots clickeables en la tarjeta, carrito con color en la key y en el mensaje de WhatsApp.

🟡 Features web (sin fecha):
- **Página "Gracias por tu pedido".** `/gracias/` con mensaje + código de descuento + link a IG.
- **"Vistos recientemente".** Sección con los últimos 4-6 productos abiertos. A estudiar: dónde va (¿final del catálogo? ¿en el modal? ¿en el footer?) y cómo se renderiza.
- **Swipe para cambiar de producto en el modal mobile.**
- **Sistema de envíos.** Tabla de zonas con precios fijos. Hoy es "a coordinar".
- **KrakoaFont en más lugares.** "Sobre KRAKOA", 404 custom (ya está), página "Gracias".
- **Cotizador offline (`cotizador.html`).** Externo al repo. Ya existe.

🟢 Canales de venta (a explorar):
- **Instagram Shopping.** Requiere feed XML (mismo que Google Shopping) + página de FB con actividad + revisión de Meta.
- **Mercado Libre.** Comisiones altas (~13%) pero tráfico enorme. Carga manual o API (más trabajo).

📣 Difusión (a sostener):
- **UGC.** Repostear stories/posts de clientes. Ya en curso.
- **Contenido educativo en IG.** "Oversize vs Regular", "Cómo cuidar DTF", "Cómo medirte". Requiere constancia.
- **TikTok / Reels.** 2-3 videos/semana, 15-30s. Mejor ROI orgánico hoy.
- **Micro-influencers.** Canje (remera por post). Anime, cine, gaming, música (5k-30k seguidores).

🏷️ Físico:
- **QR en la etiqueta de las remeras.** Apunta a `krakoa.netlify.app`. Costo: imprimir etiquetas.

Otros (heredados):
- **Google Shopping feed.** Requiere política de envíos concreta (hoy es "a coordinar"). Postergado.
- **`content-visibility: auto` en las tarjetas.** Implementado en S32 (era un pendiente).
- **Mover generación de imágenes + build a GitHub Actions.** Descartado en S32.

Descartados (no re-proponer): ver §7.

§9 — Pendientes

🔴 Prerequisito (bloquea WhatsApp):
- **Conseguir número para KRAKOA** (eSIM prepaga Movistar, sin chip físico). Camino definido: app Mi Movistar → línea nueva prepaga con eSIM → recarga inicial. Bloquea WhatsApp Business + catálogo.

🔴 Próximos (S37+):
- **Wishlist / favoritos** (feature web chica, 1 sesión).
- **Badges "NUEVO" / "DESTACADO"** (feature web chica, media sesión).
- **WhatsApp Business + catálogo** (después del número).

🟡 Sin fecha:
- Página "Gracias por tu pedido"
- "Vistos recientemente" (definir "dónde" antes de codear)
- Swipe para cambiar de producto en el modal mobile
- Canales de venta: Instagram Shopping, Mercado Libre
- Difusión: contenido educativo IG, TikTok, micro-influencers
- QR en etiquetas

🟡 Descartados (no re-proponer):
- Fast-forward del carrusel del modal (probado en S27, descartado).
- Parallax del hero (descartado en S30).
- **Quick wins S32** (botón "Preguntar por modelo", presets de cantidad, OG del home): los 3 descartados por el usuario en S33.
- Hero a 400w/600w, extraer JS/CSS, AVIF (S33).
- Selector de color: implementado en S34-S36, ya no aplica.

🟢 Resueltos (no volver a proponer):
- Página OG por producto (S32).
- Generación de imágenes incremental (S32).
- Thumbs del modal a 400w (S33).
- Preload de las primeras 3 tarjetas (S33).
- srcset WebP 400/600/1000 en tarjetas (S31).
- Hover del auto-slide con srcset (S31).
- og:image / twitter:image a URLs absolutas (S31).
- Selector de color de tela (S34-S36).
- Badge de colores en la tarjeta (S35-S36).
- Memoria de color por producto (S35).
- Preservación de slide al cambiar color (S35).
- Manejo de productos de 1 solo color como legacy (S36).
- Barra compacta (S25).
- Auto-slide en tarjetas (S26).
- Auto-slide adaptativo + slide del carrusel del modal (S27).
- Lupa compacta (S28).
- Alineación del SVG de la lupa del compacto mobile (S29/S30).
- _redirects (Netlify) → index.html con meta OG + refresh (S23).
- 404 custom (S31).
- Sugerencia de tiers en carrito (S31).
- Fix de scroll-shift (--sbw + scrollLockCount, S29).
- KrakoaFont en footer/copyright/Calidad (S29).
- Marquesina diagonal del tinte (S31).
- Pausa global con overlays abiertos (S31).
- Tuning mobile (S31): partículas 10/22, Clarity diferido, blur reducido, scroll-progress scaleX, grano off.
- `content-visibility: auto` en tarjetas (S32).
- Efectos en Cómo Comprar / Calidad / Footer (S30).

🟣 Otros:
- Performance de backdrop-filter en mobile de gama muy baja: ya reducido a blur(3px) en S31. No se reprodujo problema.
- **Generación incremental del catálogo (S32) — caveat:** si se cambia la lógica de `optimizeImage` o `generateOgImage` (calidad, dimensiones, formato), el incremental NO lo detecta. Hay que borrar `public/catalogo/` a mano una vez y volver a correr el script (~40-50s por la paralelización).

Nada urgente. Web estable.

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

S16–S24 (comprimidas)
S16: Precios por tiers, carrito con totales, hero con glitch + typewriter + cursor. Flechas de producto cuadradas con borde de color.
S17: Glitch extendido (10 keyframes, flips, RGB split). KrakoaFont en el hero. Badge con conteo. historyStack con objetos { kind, state }. Drawers con transición de cierre.
S19: Performance (WebP 75, resize 1000px, LCP 12.3s → 3.8s, peso 41MB → 22.5MB). Loader con DOMContentLoaded. Hero LCP estático. JSON-LD consolidado en @graph. Glitches unificados. URL/título dinámicos. Botón "Volver arriba". (Nota: S18 se salteó por error.)
S20: Fix hover de tarjetas (sin scale). Promo CRT. URL corta Netlify (krakoa.netlify.app). JSON-LD inline con @graph.
S21: Cotizador offline (cotizador.html, externo al repo). Roadmap priorizado.
S22: Modal CRT Power On/Off con scanlines. Cambio de producto: RGB split + ruido teal + viñeta (solo .modal-image-area). Columna de info limpia.
S23: Netlify con meta OG + refresh. Promo CRT. Zoom con rueda (1x-4x, pan, click cierra en 1x). Barra combinada. Header con glitch real.
S24: Barra mobile estabilizada (contain + translateZ). Espaciado flex-wrap con category-break. Lupa compacta desktop (resuelta en S25). Auto-slide reglas definidas. Bottom Sheet descartado.

S25 — Barra compacta definitiva, búsqueda sin scroll, "sin resultados"
Recompresión del contexto (primera reescritura completa: de ~500 a ~330 líneas). Barra compacta resuelta eliminando `position: absolute + translateY(-50%)` de los 3 iconos; el centrado lo hace `align-items: center` del padre. Búsqueda desde la compacta: scroll explícito al inicio de la grilla (el scroll-anchoring nativo dejaba pegado a Preguntas Frecuentes). Bloque `#no-results` (hermano de #products) con botón "Ver todo el catálogo". Lección: centrar con absolute + translateY es frágil; usar flexbox.

S26 — Auto-slide + hover slide unificado en tarjetas
Rotación automática aleatoria de tarjetas entre modelo ↔ remera, en mobile y desktop, con precarga condicional. Un solo timer global elige 1-2 tarjetas visibles al azar. Cooldown por tarjeta, no contiguas, hold 3-5s, dirección única (entra y sale por la derecha). Hover de desktop unificado con la misma animación. Se eliminó el `:has()` y el `display: none` de mobile: la animación vive 100% en JS. Máquina de estados por tarjeta: idle / in / holding / out.

S27 — Slide del modal sin scale, fast-forward descartado, auto-slide adaptativo
Carrusel del modal: translateX(±100%) sin scale, sin fade. Fast-forward (recorrido por intermedios) probado y DESCARTADO (se veía como bug en mobile). Thumbs y "Ver tabla de talles" saltan directo. Auto-slide con delay adaptativo (countActiveSlides()) y cooldown dinámico (min(6, max(2, visibleCards.size * 2))). Precarga de imágenes al abrir modal.

S28 — Barra compacta mobile grid 3×2 + lupa, logo clickeable, categorías renombradas
Renombrar "Cine y Series" → "Cine y TV", "Videojuegos" → "VideoGames" (libera ancho; ids internos NO cambian). Gap de .categories-buttons unificado a 4px. Fix del badge del carrito recortado (contain: paint → layout style). Logo compacto clickeable (`<button>` con scroll top). Lupa en compacto mobile: grid 3 columnas × 2 filas (carrito arriba, lupa abajo). Bug crítico de rolldown: `<script>` literal en comentarios rompe el parser (Vite 7). Alturas: `height` fija (no `min-height`) cuando el layout depende del hijo más alto.

S29 — Glitch de lupa, efecto "ventana" en categorías, fix del scroll-shift
Lupa del header hace glitch al volver del compacto en mobile (se sacó el media query mal puesto). Input de búsqueda del header hace glitch al volver con `searchFieldGlitch` + `searchShake` + `searchPlaceholderGlitch` (NO `logoGlitch`, tiene scale: -1 1 que refleja el texto). Toggle del compacto sin `contain: paint` (recortaba el drop-shadow). Saltito de la barra al pasar de compacta a estática: vertical 3px (height 89px en compacto) y horizontal 14px (padding asimétrico 56/84px). Efecto "ventana" en botones de categoría (Arial 900, letter-spacing negativo, overflow hidden; `::before` invisible fija el ancho). Glitch al hover/click de categorías. Fix del scroll-shift: `--sbw` + `calc(100vw - var(--sbw))` + `lockBodyScroll` ANTES de `overflow: hidden` + `scrollLockCount`. `scrollbar-gutter: stable` descartado. KrakoaFont en Calidad, footer párrafo y footer copyright (`.brand-inline { color: #fff }`).

S30 — Efectos en secciones pre-glitch
Glitch de entrada del h2 en Cómo Comprar y Calidad (una vez al viewport). Glitch al abrir/cerrar cada pregunta del FAQ. Glow pulsante del CTA WhatsApp. Glitch aleatorio de pilares (20-30s). Hover de pilar: flicker + drop-shadow del color. Footer: scanlines ultra sutiles + glitch del logo vertical (25-40s). Copyright sin glitch (a 11px no se lee). Aclaraciones: parallax descartado definitivamente, alineación lupa S24 resuelta, selector de color pasa a urgente.

S31 — 404 custom, sugerencia de tiers, marquesina diagonal, tuning mobile, srcset, og:image absolutas
404 custom (`src/pages/404.astro`, Arial 900 + KrakoaFont, glitch ocasional). Sugerencia de tiers en carrito (`updateCartTierBanner`, reusa `#cart-tier-banner`, banner-hint amarillo, regla de turnos). Marquesina diagonal del tinte (nombre repetido a -45°, tamaños alternados, direcciones alternadas, 80s loop). Pausa global de efectos con overlays abiertos (`isAnyOverlayOpen()`, clases `body.zoom-open`/`body.promo-open` nuevas). Tuning mobile (partículas 10/22, Clarity diferido, blur reducido, scroll-progress scaleX, grano off). srcset WebP 400/600/1000 en tarjetas (`optimizeImage` acepta maxWidth). Hover del auto-slide con srcset (pickHoverSrc por DPR). Fix de og:image a URLs absolutas (SITE_ORIGIN + BASE_PATH). Bugs del parser: `<` en atributos Astro rompe el build; verificar restos de copy-paste al reemplazar bloques multilínea.

S32 — OG por producto (página puente) + generación incremental
Página puente `/producto/slug/` con meta OG correctos + redirect a `/#slug` (Opción 1, las otras 2 descartadas). `generateOgImage` (1200×630 JPG, remera centrada). Campo `ogImage` en el JSON. Botón "Compartir" del modal usa esta URL. `.bat`: incremental (comparar mtime source/output) + cleanup de huérfanos + paralelización (6 concurrentes). Antes ~120s → ahora ~5-10s sin tocar, ~10-15s por producto. Caveat: cambiar optimizeImage/generateOgImage requiere borrar `public/catalogo/` a mano una vez.

S33 — Thumbs 400w + preload de las primeras 3 tarjetas + quick wins descartados
Thumbs del modal a 400w (`thumbSrc` en `currentImages`). Preload de las primeras 3 tarjetas del catálogo (`imagesrcset` + `imagesizes`). Quick wins S32 (botón "Preguntar por modelo", presets de cantidad, OG del home) descartados por el usuario. Hero a 400/600, extraer JS/CSS y AVIF postergados.

S34 — Selector de color de tela (base)
Feature más pedida. Estructura: `catalogo/<cat>/<modelo>/<color>/` con `meta.json` opcional (`{ "defaultColor": "negro" }`, se crea automático si hay 1 color o pregunta agrupado si hay 2+). Script 3 con selector de color (ventana + "Otro..."). `generar-catalogo.mjs`: `getColorName`, `getColorHex`, `normalizarColorSlug`, `readMetaJson`, `askDefaults`. JSON por producto: `colors: { negro: {...}, blanco: {...} }`, `defaultColor`, campos top-level espejo del default. Web: `colorsData`, `hasColors`, `currentColor`, `buildImagesForColor`, `selectColor`. Carrito con color en la key. WhatsApp con línea `- Color: *Negro*`. También se documenta §12 (flujo de trabajo de modelo nuevo).

S35 — Memoria de color por producto + preservar slide + badge "X colores"
Memoria por producto (`lastColorByProduct = new Map()`, no persiste al recargar). Al cambiar color, preserva slide actual por label. Badge con dots de colores en la tarjeta (2+ colores, hasta 4 + `+N`), clickeables (cambian las imágenes de la tarjeta sin abrir el modal). Fondo con `color-mix` del color de la categoría. `window.__krakoaSetCardColor` / `window.__krakoaUpdateCardColor`.

S36 — Badge fuera del `<button>` + fix del rebote + productos de 1 solo color legacy
Badge de colores movido FUERA del `<button>` (hermano del botón, hijo directo del `<article>`) para evitar el `:active` del padre (no prevenible con preventDefault). Dots más grandes (16px desktop / 18px mobile), padding del badge reducido, sin scale en hover. Productos con 1 solo color se tratan como legacy: `hasColors = Object.keys(colorsData).length > 1` (no `> 0`). `askDefaults` crea el `meta.json` automáticamente para 1 color. Lección: el `:active` del navegador no se puede prevenir, hay que sacar el hijo del botón.

S37 — Recompresión del contexto (S36)
Reescritura completa del archivo (segunda compresión). Pasó de ~1200 líneas a ~500. Historial S16-S24 comprimido a un párrafo cada uno. S25-S36 comprimidos a 3-6 líneas cada uno. Índice agregado al encabezado (§0-§12). §12 integrado al índice. Eliminados: "Roadmap de referencia" obsoleto de S24, separadores "Parte A" sueltos, S33 duplicado. Cambios estructurales de S25-S36 unificados al cuerpo (§2, §3, §4, §5, §7, §8, §9). Versión del archivo: Compresión S36.

§12 — Flujo de trabajo de un modelo nuevo
Documentado en S34 tras una confusión inicial. Este es el flujo real que usa el usuario para producir un modelo.

1. Edición de la ilustración (Photoshop)
   - Abrir ilustración (Pinterest, internet, etc.).
   - Editar, borrar, resaltar, combinar capas.
   - Correr script 1 y 2: dimensiones, renombrar capa, efecto semitono.
     Generan un JPG (con fondo del color de tela que elige el usuario) + un PNG (para imprimir el DTF).
   - Los scripts preguntan el color de tela.

2. Mockups (Google Flow)
   - Subir el JPG a Google Flow.
   - Pedir mockup de remera sobre mesa de madera, con el diseño.
   - Pedir mockup con modelo luciéndola.
   - Si hay más de un color, repetir el paso con los JPG de cada color.

3. Ensamblado + exportación (Photoshop + script 3)
   - Abrir "_molde post instagram.psd" (con grupo CATEGORIAS + "Capa 1" que sirve de imán).
   - Arrastrar los mockups (mesa + modelo) al PSD.
   - Correr "3 Finalizar_Mockups_KRAKOA.jsx":
     - Pregunta modelo, categoría, nombre de carpeta, color (lista + "Otro..."), carpeta original del color.
     - Exporta remera.jpg y modelo.jpg (con logo aplicado) a `carpetaOriginal/<color>/`.
     - Copia las tablas de talles.
     - Crea `catalogo/<cat>/<modelo>/<color>/` y copia los mockups.

4. Publicar
   - Correr ACTUALIZAR WEB.bat.
   - Si es un producto nuevo con 2+ colores sin meta.json, el script pregunta el color default (agrupado al principio).
   - Si es un producto nuevo con 1 solo color, el meta.json se crea automáticamente con ese color.
   - El .bat hace el resto (imágenes, build, commit, push).