const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
const files = ['index.html', 'style.css', 'app.js'];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(__dirname, file), path.join(outDir, file));
}

console.log('Build successful: files copied to /dist');
