import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSS_PATH = path.join(ROOT, 'src/styles/global.css');
const CSS_BACKUP = path.join(ROOT, 'src/styles/global.css.BACKUP');

if (!fs.existsSync(CSS_PATH)) {
  console.log('ERROR: no existe', CSS_PATH);
  process.exit(1);
}

if (fs.existsSync(CSS_BACKUP)) {
  console.log('ERROR: ya existe un backup en:', CSS_BACKUP);
  console.log('Borralo si queres re-ejecutar.');
  process.exit(1);
}

let content = fs.readFileSync(CSS_PATH, 'utf8');
fs.writeFileSync(CSS_BACKUP, content, 'utf8');
console.log('Backup creado:', CSS_BACKUP);

const before = content.length;
let count = 0;
let result = '';
let i = 0;

while (i < content.length) {
  if (content.substr(i, 8) === ':global(') {
    let depth = 1;
    let j = i + 8;
    while (j < content.length && depth > 0) {
      if (content[j] === '(') depth++;
      else if (content[j] === ')') depth--;
      if (depth === 0) break;
      j++;
    }
    if (depth !== 0) {
      console.log('ERROR: parentesis sin cerrar en posicion', i);
      process.exit(1);
    }
    result += content.substring(i + 8, j);
    i = j + 1;
    count++;
  } else {
    result += content[i];
    i++;
  }
}

if (count === 0) {
  console.log('No se encontraron :global() para limpiar.');
  process.exit(0);
}

fs.writeFileSync(CSS_PATH, result, 'utf8');
console.log('');
console.log('=== LISTO ===');
console.log('Ocurrencias de :global() reemplazadas:', count);
console.log('Tamano antes:  ', before, 'bytes');
console.log('Tamano despues:', result.length, 'bytes');
console.log('Diferencia:    ', before - result.length, 'bytes');
console.log('');
console.log('PROXIMO PASO:');
console.log('  1. npm run dev');
console.log('  2. Verificar que el sitio se vea igual que antes');
console.log('  3. Si anda: borrar los .BACKUP y correr ACTUALIZAR WEB.bat');