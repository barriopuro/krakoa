import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalogoDir = path.join(root, "catalogo");
const publicCatalogoDir = path.join(root, "public", "catalogo");
const outputDir = path.join(root, "src", "data");
const outputFile = path.join(outputDir, "catalogo.json");

// Sitemap: se genera en public/, así el deploy lo sirve directo.
const publicDir = path.join(root, "public");
const sitemapFile = path.join(publicDir, "sitemap.xml");

// URL base del sitio (para armar las URLs absolutas del sitemap).
// Tiene que coincidir con `site` en astro.config.mjs.
const SITE_URL = "https://barriopuro.github.io";
const BASE_PATH = "/krakoa";
const absoluteUrl = (path) => `${SITE_URL}${BASE_PATH}${path}`;

// Fecha ISO (YYYY-MM-DD) para el <lastmod> de cada URL del sitemap.
const TODAY = new Date().toISOString().slice(0, 10);

const promoDir = path.join(root, "promo");
const publicPromoDir = path.join(root, "public", "promo");
const promoOutputFile = path.join(outputDir, "promo.json");

const DEFAULT_PROMO_CONFIG = {
  activa: true,
  noMostrarDuracionHoras: 24,
  autoRotateSegundos: 5,
  mostrarBotonNoMostrar: true,
  link: "",
  texto: "",
};

const optimizedCatalogoDir = path.join(
  root,
  "public",
  "catalogo"
);

async function optimizeImage(sourcePath, destinationPath) {
  await sharp(sourcePath)
    .webp({
      quality: 82,
      effort: 4,
    })
    .toFile(destinationPath);
}

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const categoryConfig = {
  anime: {
    name: "Anime",
    color: "#e53935",
  },
  
  comics: {
    name: "Comics",
    color: "#e84393",
  },

  "cine-series": {
    name: "Cine y Series",
    color: "#f2c94c",
  },

  deportes: {
    name: "Deportes",
    color: "#f2994a",
  },

  musica: {
    name: "Música",
    color: "#2f80ed",
  },

  videojuegos: {
    name: "Videojuegos",
    color: "#27ae60",
  },

  otros: {
    name: "Otros",
    color: "#bb86fc",
  },
};

function formatName(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\p{L})/gu, (_, prefix, letter) => prefix + letter.toUpperCase());
}

// Parsea el nombre de la carpeta de un producto para separar el nombre
// visible de los tags de búsqueda.
//
// Convención:
//   "maradona"                          → name: "maradona", tags: []
//   "maradona _(pelusa, futbol)"        → name: "maradona", tags: ["pelusa", "futbol"]
//   "maradona-(edicion-limitada) _(pelusa)"
//                                       → name: "maradona-(edicion-limitada)",
//                                         tags: ["pelusa"]
//
// El separador es " _(...)" (espacio opcional, guión bajo, paréntesis).
// El "(...)" debe estar al final del nombre.
// Los paréntesis que están ANTES del " _(" se consideran parte del nombre.
function parseProductFolder(folderName) {
  const match = folderName.match(/^(.*?)\s*_\(([^)]*)\)\s*$/);

  if (!match) {
    return { name: folderName, tags: [] };
  }

  const cleanName = match[1].trim();
  const tags = match[2]
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return { name: cleanName, tags };
}

function findImage(directory, baseName) {
  for (const extension of imageExtensions) {
    const file = `${baseName}${extension}`;
    const fullPath = path.join(directory, file);

    if (fs.existsSync(fullPath)) {
      return file;
    }
  }

  return null;
}

// Busca archivos que empiecen con "extra-" en la carpeta del producto.
// Devuelve un array de objetos { file, order, label } ordenados.
//
// Convención de nombres:
//   extra-1-remera-espalda.jpg   → order: 1, label: "Remera Espalda"
//   extra-2-modelo-espalda.jpg   → order: 2, label: "Modelo Espalda"
//   extra-referencia.jpg         → order: null, label: "Referencia"
//   extra-1.jpg                  → order: 1, label: "Extra 1"
//
// Orden final: primero los que tienen número (ascendente), después los
// que no (alfabético por label).
function findExtraImages(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  const extras = [];

  for (const entry of files) {
    if (!entry.isFile()) continue;

    const name = entry.name;
    if (!name.toLowerCase().startsWith("extra-")) continue;

    const extension = path.extname(name).toLowerCase();
    if (!imageExtensions.includes(extension)) continue;

    // Sacamos "extra-" y la extensión para quedarnos con el "cuerpo".
    // cuerpo = "1-remera-espalda" | "referencia" | "1" | ""
    const withoutPrefix = name.slice("extra-".length);
    const body = withoutPrefix.slice(
      0,
      withoutPrefix.length - extension.length
    );

    // ¿Empieza con un número seguido de guión o fin?
    //   "1-remera-espalda" → order: 1, rest: "remera-espalda"
    //   "1"                → order: 1, rest: ""
    //   "referencia"       → sin número
    const numMatch = body.match(/^(\d+)(?:-(.*))?$/);

    let order = null;
    let labelSource = body;

    if (numMatch) {
      order = parseInt(numMatch[1], 10);
      labelSource = numMatch[2] || "";
    }

    // Generamos el label. Si después del número no hay nada, usamos
    // "Extra N". Si no hay número y no hay label, usamos "Extra".
    let label;
    if (labelSource.trim()) {
      label = formatName(labelSource);
    } else if (order !== null) {
      label = `Extra ${order}`;
    } else {
      label = "Extra";
    }

    extras.push({
      file: name,
      order,
      label,
    });
  }

  // Ordenamos: primero los que tienen número (ascendente), después
  // los que no (alfabético por label).
  extras.sort((a, b) => {
    const aHasOrder = a.order !== null;
    const bHasOrder = b.order !== null;

    if (aHasOrder && bHasOrder) return a.order - b.order;
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;
    return a.label.localeCompare(b.label, "es");
  });

  return extras;
}

if (!fs.existsSync(catalogoDir)) {
  console.error("ERROR: No existe la carpeta catalogo.");
  process.exit(1);
}
fs.rmSync(publicCatalogoDir, { recursive: true, force: true });
fs.mkdirSync(publicCatalogoDir, { recursive: true });

async function processCatalogoImages() {
  const files = fs.readdirSync(catalogoDir, { recursive: true });

  for (const relativeFile of files) {
    const sourcePath = path.join(catalogoDir, relativeFile);

    if (!fs.statSync(sourcePath).isFile()) {
      continue;
    }

    const extension = path.extname(relativeFile).toLowerCase();

    if (!imageExtensions.includes(extension)) {
      continue;
    }

    // Estructura esperada: <categoria>/<modelo>/<archivo>.<ext>
    // El segundo segmento (el modelo) puede tener tags: "maradona _(pelusa)"
    // En ese caso, guardamos la imagen en un path SIN los tags:
    //   <categoria>/<modelo-limpio>/<archivo>.webp
    const segments = relativeFile.split(path.sep);

    if (segments.length >= 3) {
      const [category, modelFolder, ...rest] = segments;
      const { name: cleanModel } = parseProductFolder(modelFolder);

      // Reemplazamos el nombre de la carpeta del modelo por el limpio.
      const cleanRelative = path.join(category, cleanModel, ...rest);

      const relativeWebp = cleanRelative.replace(
        new RegExp(`${extension}$`, "i"),
        ".webp"
      );

      const destinationPath = path.join(publicCatalogoDir, relativeWebp);

      fs.mkdirSync(path.dirname(destinationPath), {
        recursive: true,
      });

      await optimizeImage(sourcePath, destinationPath);
      continue;
    }

    // Fallback: si por algún motivo hay archivos sueltos (no debería),
    // los copiamos como antes.
    const relativeWebp = relativeFile.replace(
      new RegExp(`${extension}$`, "i"),
      ".webp"
    );

    const destinationPath = path.join(publicCatalogoDir, relativeWebp);

    fs.mkdirSync(path.dirname(destinationPath), {
      recursive: true,
    });

    await optimizeImage(sourcePath, destinationPath);
  }
}

await processCatalogoImages();

const tallesDir = path.join(root, "talles");
const publicTallesDir = path.join(root, "public", "talles");

fs.rmSync(publicTallesDir, { recursive: true, force: true });
fs.mkdirSync(publicTallesDir, { recursive: true });

const tallesFiles = fs.readdirSync(tallesDir);

for (const file of tallesFiles) {
  const sourcePath = path.join(tallesDir, file);

  if (!fs.statSync(sourcePath).isFile()) {
    continue;
  }

  const extension = path.extname(file).toLowerCase();

  if (!imageExtensions.includes(extension)) {
    continue;
  }

  const webpFile = file.replace(
    new RegExp(`${extension}$`, "i"),
    ".webp"
  );

  await optimizeImage(
    sourcePath,
    path.join(publicTallesDir, webpFile)
  );
}

// -------------------------
// LOGOS: PNG → WebP optimizado
// -------------------------

const logosDir = path.join(root, "public", "logos");

if (fs.existsSync(logosDir)) {
  const logoFiles = fs.readdirSync(logosDir);

  for (const file of logoFiles) {
    const sourcePath = path.join(logosDir, file);

    if (!fs.statSync(sourcePath).isFile()) continue;

    const extension = path.extname(file).toLowerCase();

    // Solo procesamos PNGs. .svg, .ico y .jpg quedan como están.
    if (extension !== ".png") continue;

    const webpFile = file.replace(/\.png$/i, ".webp");
    const destinationPath = path.join(logosDir, webpFile);

    await sharp(sourcePath)
      .resize({
        width: 400,
        withoutEnlargement: true,
      })
      .webp({
        quality: 88,
        effort: 6,
      })
      .toFile(destinationPath);

    console.log(`Logo optimizado: ${file} → ${webpFile}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });

const categories = [];
const products = [];

const categoryFolders = fs
  .readdirSync(catalogoDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

for (const categoryFolder of categoryFolders) {
  const categoryId = categoryFolder.name;
  const categoryDirectory = path.join(catalogoDir, categoryId);

const config = categoryConfig[categoryId];

categories.push({
  id: categoryId,
  name: config?.name ?? formatName(categoryId),
  color: config?.color ?? "#888888",
});

  const productFolders = fs
    .readdirSync(categoryDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  for (const productFolder of productFolders) {
    const rawFolderName = productFolder.name;
    const productDirectory = path.join(categoryDirectory, rawFolderName);

    // Separamos el nombre visible de los tags.
    const { name: cleanName, tags } = parseProductFolder(rawFolderName);

    // El "id" para el hash de compartir. Se calcula desde el nombre visible
    // (después de formatName) para que quede lindo y predecible.
    const productName = formatName(cleanName);
    const productId = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const modelo = findImage(productDirectory, "modelo");
    const remera = findImage(productDirectory, "remera");

    if (!modelo || !remera) {
      console.warn(
        `ADVERTENCIA: "${productName}" no tiene todas las imágenes necesarias.`
      );

      if (!modelo) {
        console.warn("  Falta: modelo.jpg");
      }

      if (!remera) {
        console.warn("  Falta: remera.jpg");
      }

      continue;
    }

    // Fotos extra opcionales (extra-1-remera-espalda.jpg, etc.)
    const extras = findExtraImages(productDirectory);

    // OJO: en el path usamos el nombre LIMPIO (sin tags), porque así
    // es como processCatalogoImages() guardó las imágenes optimizadas.
    // En la carpeta original (catalogo/) el nombre es rawFolderName
    // (con tags), pero en public/catalogo/ está limpio.
    products.push({
      id: productId,
      name: productName,
      tags,
      category: categoryId,
      categoryName: config?.name ?? formatName(categoryId),
      modelo: `/catalogo/${categoryId}/${cleanName}/${modelo.replace(/\.[^.]+$/, ".webp")}`,
      remera: `/catalogo/${categoryId}/${cleanName}/${remera.replace(/\.[^.]+$/, ".webp")}`,
      extras: extras.map((extra) => ({
        src: `/catalogo/${categoryId}/${cleanName}/${extra.file.replace(/\.[^.]+$/, ".webp")}`,
        label: extra.label,
      })),
    });
  }
}

// Intercalar productos por categoría (round-robin) para que al ver
// "Todos" aparezca variedad desde el principio, en vez de todos los
// de anime, después todos los de comics, etc.
// El orden de las categorías sigue el de `categories` (alfabético,
// respetando el locale "es").
const queuesByCategory = categories.map((cat) =>
  products.filter((product) => product.category === cat.id)
);

const maxLen = Math.max(0, ...queuesByCategory.map((q) => q.length));
const interleaved = [];

for (let i = 0; i < maxLen; i++) {
  for (const queue of queuesByCategory) {
    if (i < queue.length) interleaved.push(queue[i]);
  }
}

products.length = 0;
products.push(...interleaved);

const catalog = {
  categories,
  products,
};

fs.writeFileSync(
  outputFile,
  JSON.stringify(catalog, null, 2),
  "utf8"
);

console.log(
  `Catálogo generado: ${products.length} producto(s), ${categories.length} categoría(s).`
);

// -------------------------
// PROMO
// -------------------------

async function generatePromo() {
  // Limpiamos public/promo por si había imágenes viejas.
  fs.rmSync(publicPromoDir, { recursive: true, force: true });

  // Si no existe la carpeta promo/, no hay promo.
  if (!fs.existsSync(promoDir)) {
    fs.writeFileSync(
      promoOutputFile,
      JSON.stringify(
        {
          activa: false,
          imagenes: [],
          hash: "",
          config: DEFAULT_PROMO_CONFIG,
        },
        null,
        2
      ),
      "utf8"
    );
    console.log("Promo: no hay carpeta promo/, se omite.");
    return;
  }

  // Leemos el config.json (si no existe, usamos el default).
  let config = { ...DEFAULT_PROMO_CONFIG };
  const configPath = path.join(promoDir, "config.json");

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, "utf8");
      const parsed = JSON.parse(raw);
      config = { ...DEFAULT_PROMO_CONFIG, ...parsed };
    } catch (error) {
      console.warn(
        "Promo: config.json tiene un error de formato, se usan los valores por defecto."
      );
      console.warn("  Detalle:", error.message);
    }
  }

  // Buscamos las imágenes en promo/ (ordenadas alfabéticamente).
  const files = fs
    .readdirSync(promoDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .sort((a, b) => a.localeCompare(b, "es"));

  // Sin imágenes → no hay promo (aunque activa sea true).
  if (files.length === 0) {
    fs.writeFileSync(
      promoOutputFile,
      JSON.stringify(
        {
          activa: false,
          imagenes: [],
          hash: "",
          config,
        },
        null,
        2
      ),
      "utf8"
    );
    console.log("Promo: no hay imágenes en promo/, se omite.");
    return;
  }

  // Creamos public/promo/ y optimizamos cada imagen a .webp.
  fs.mkdirSync(publicPromoDir, { recursive: true });

  const imagenes = [];
  const hashParts = [];

  for (const file of files) {
    const sourcePath = path.join(promoDir, file);
    const ext = path.extname(file).toLowerCase();
    const webpFile = file.replace(new RegExp(`${ext}$`, "i"), ".webp");
    const destinationPath = path.join(publicPromoDir, webpFile);

    await optimizeImage(sourcePath, destinationPath);

    imagenes.push(`/promo/${webpFile}`);

    // Para el hash usamos nombre + tamaño en bytes. Así, si reemplazás
    // la imagen por otra con el mismo nombre pero distinto peso, el hash
    // cambia y la promo se muestra de nuevo.
    const stats = fs.statSync(sourcePath);
    hashParts.push(`${webpFile}:${stats.size}`);
  }

  // Si config.activa es false, forzamos activa=false aunque haya imágenes.
  const activa = config.activa === true;

  const hash = hashParts.join("|");

  fs.writeFileSync(
    promoOutputFile,
    JSON.stringify(
      {
        activa,
        imagenes,
        hash,
        config,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(
    `Promo: ${imagenes.length} imagen(es) detectada(s) — ${
      activa ? "ACTIVA" : "INACTIVA (config.activa = false)"
    }.`
  );
  console.log(
    `Promo: auto-rotate cada ${config.autoRotateSegundos}s, "No mostrar" dura ${config.noMostrarDuracionHoras} hs.`
  );
}

await generatePromo();

// -------------------------
// SITEMAP
// -------------------------

// Genera un sitemap.xml con la home, cada categoría y cada producto.
// Google lo lee y indexa cada remera por separado.
// Se sirve en /krakoa/sitemap.xml (declarado en robots.txt).
function generateSitemap() {
  // Lista de URLs: { loc, priority, changefreq }
  const urls = [];

  // Home
  urls.push({
    loc: absoluteUrl("/"),
    priority: "1.0",
    changefreq: "weekly",
  });

  // Categorías: se filtran por las que tienen al menos 1 producto
  // (evita incluir categorías vacías en el sitemap).
  const categoriesWithProducts = new Set(
    products.map((p) => p.category)
  );

  categories.forEach((cat) => {
    if (!categoriesWithProducts.has(cat.id)) return;
    urls.push({
      loc: absoluteUrl(`/?cat=${cat.id}`),
      priority: "0.8",
      changefreq: "weekly",
    });
  });

  // Productos (uno por cada remera, con su hash para abrir directo).
  products.forEach((product) => {
    urls.push({
      loc: absoluteUrl(`/#${product.id}`),
      priority: "0.7",
      changefreq: "monthly",
    });
  });

  // Armamos el XML.
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url>\n` +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${TODAY}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>`
    ),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(sitemapFile, xml, "utf8");

  console.log(
    `Sitemap generado: ${urls.length} URL(s) (1 home + ${categoriesWithProducts.size} categorías + ${products.length} productos).`
  );
}

generateSitemap();