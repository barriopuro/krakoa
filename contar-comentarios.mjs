import fs from 'node:fs';

const path = 'src/pages/index.astro';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n').length;

const htmlComments = content.match(/<!--[\s\S]*?-->/g) || [];
const blockComments = content.match(/\/\*[\s\S]*?\*\//g) || [];
const lineComments = content.match(/^\s*\/\/.*$/gm) || [];
const sxxMatches = content.match(/S\d+/g) || [];

const htmlLines = htmlComments.reduce((acc, c) => acc + c.split('\n').length, 0);
const blockLines = blockComments.reduce((acc, c) => acc + c.split('\n').length, 0);

console.log('=== REPORTE DE COMENTARIOS ===');
console.log('Lineas totales del archivo:', lines);
console.log('');
console.log('Comentarios HTML (<!-- ... -->):', htmlComments.length, '-> ~' + htmlLines + ' lineas');
console.log('Comentarios bloque (/* ... */):', blockComments.length, '-> ~' + blockLines + ' lineas');
console.log('Comentarios linea (// ...):', lineComments.length);
console.log('Menciones de Sxx:', sxxMatches.length);
console.log('');
console.log('--- MUESTRAS ---');
console.log('');
console.log('HTML (primeros 3):');
htmlComments.slice(0, 3).forEach((c, i) => {
  const preview = c.replace(/\s+/g, ' ').slice(0, 100);
  console.log('  ' + (i + 1) + ')', preview + (c.length > 100 ? '...' : ''));
});
console.log('');
console.log('BLOQUE (primeros 3):');
blockComments.slice(0, 3).forEach((c, i) => {
  const preview = c.replace(/\s+/g, ' ').slice(0, 100);
  console.log('  ' + (i + 1) + ')', preview + (c.length > 100 ? '...' : ''));
});
console.log('');
console.log('LINEA (primeros 5):');
lineComments.slice(0, 5).forEach((c, i) => {
  console.log('  ' + (i + 1) + ')', c.trim());
});