import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ASTRO_PATH = path.join(ROOT, 'src/pages/index.astro');
const BACKUP_PATH = path.join(ROOT, 'src/pages/index.astro.BACKUP');
const CSS_DIR = path.join(ROOT, 'src/styles');
const CSS_PATH = path.join(CSS_DIR, 'global.css');

console.log('=== SEPARAR CSS ===');
console.log('');

// 1. Leer archivo
if (!fs.existsSync(ASTRO_PATH)) {
  console.log('ERROR: no existe', ASTRO_PATH);
  process.exit(1);
}
const original = fs.readFileSync(ASTRO_PATH, 'utf8');
const originalLines = original.split('\n').length;
console.log('index.astro original:', originalLines, 'lineas');

// 2. Backup
if (fs.existsSync(BACKUP_PATH)) {
  console.log('');
  console.log('ERROR: ya existe un backup en:');
  console.log('  ' + BACKUP_PATH);
  console.log('');
  console.log('Si queres re-ejecutar, borra ese backup primero.');
  process.exit(1);
}
fs.writeFileSync(BACKUP_PATH, original, 'utf8');
console.log('Backup creado:', BACKUP_PATH);

// 3. Encontrar el <style> sin atributos
const allStyleTags = [...original.matchAll(/\n<style>\n/g)];
if (allStyleTags.length !== 1) {
  console.log('');
  console.log('ERROR: encontre', allStyleTags.length, 'tags <style> sin atributos (esperaba 1).');
  process.exit(1);
}

const styleRegex = /\n<style>\n([\s\S]*?)\n<\/style>/;
const match = original.match(styleRegex);
if (!match) {
  console.log('ERROR: no pude extraer el contenido del <style>.');
  process.exit(1);
}
const cssContent = match[1];
const cssLines = cssContent.split('\n').length;
console.log('CSS extraido:', cssLines, 'lineas');

// 4. Validaciones
if (cssContent.includes('${base}')) {
  console.log('ERROR: el CSS contiene ${base}. No se puede mover tal cual.');
  process.exit(1);
}
if (cssContent.includes('define:vars')) {
  console.log('ERROR: el CSS contiene define:vars. No se puede mover tal cual.');
  process.exit(1);
}
console.log('Validaciones OK (sin ${base}, sin define:vars)');

// 5. Escribir CSS
if (!fs.existsSync(CSS_DIR)) {
  fs.mkdirSync(CSS_DIR, { recursive: true });
  console.log('Carpeta creada:', CSS_DIR);
}
fs.writeFileSync(CSS_PATH, cssContent.trim() + '\n', 'utf8');
console.log('CSS escrito:', CSS_PATH);

// 6. Modificar index.astro
let modified = original.replace(styleRegex, '');

const importTarget = 'import promo from "../data/promo.json";';
if (!modified.includes(importTarget)) {
  console.log('');
  console.log('ERROR: no encontre el import de promo en el frontmatter.');
  process.exit(1);
}
modified = modified.replace(
  importTarget,
  importTarget + '\nimport "../styles/global.css";'
);

// 7. Guardar
fs.writeFileSync(ASTRO_PATH, modified, 'utf8');
const finalLines = modified.split('\n').length;

console.log('');
console.log('=== LISTO ===');
console.log('index.astro original:', originalLines, 'lineas');
console.log('index.astro nuevo:   ', finalLines, 'lineas');
console.log('Reduccion:           ', originalLines - finalLines, 'lineas');
console.log('CSS extraido:        ', cssLines, 'lineas');
console.log('');
console.log('Backup guardado en:', BACKUP_PATH);
console.log('CSS guardado en:  ', CSS_PATH);
console.log('');
console.log('PROXIMO PASO:');
console.log('  1. Correr: npm run dev');
console.log('  2. Verificar que el sitio se vea igual');
console.log('  3. Si anda: borrar el backup y correr ACTUALIZAR WEB.bat');
console.log('  4. Si NO anda: restaurar backup (ver instrucciones)');