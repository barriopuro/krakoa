import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const catalogoDir = path.join(root, "catalogo");
const publicCatalogoDir = path.join(root, "public", "catalogo");
const outputDir = path.join(root, "src", "data");
const outputFile = path.join(outputDir, "catalogo.json");

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

    const relativeWebp = relativeFile.replace(
      new RegExp(`${extension}$`, "i"),
      ".webp"
    );

    const destinationPath = path.join(
      publicCatalogoDir,
      relativeWebp
    );

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
    const productId = productFolder.name;
    const productDirectory = path.join(categoryDirectory, productId);

    const modelo = findImage(productDirectory, "modelo");
    const remera = findImage(productDirectory, "remera");

    if (!modelo || !remera) {
      console.warn(
        `ADVERTENCIA: "${formatName(productId)}" no tiene todas las imágenes necesarias.`
      );

      if (!modelo) {
        console.warn("  Falta: modelo.jpg");
      }

      if (!remera) {
        console.warn("  Falta: remera.jpg");
      }

      continue;
    }

    products.push({
      id: productId,
      name: formatName(productId),
      category: categoryId,
      categoryName: config?.name ?? formatName(categoryId),
      modelo: `/catalogo/${categoryId}/${productId}/${modelo.replace(/\.[^.]+$/, ".webp")}`,
remera: `/catalogo/${categoryId}/${productId}/${remera.replace(/\.[^.]+$/, ".webp")}`,
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