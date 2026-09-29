const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const desktop = 'C:\\Users\\luciano\\Desktop';
const targetDir = path.join(desktop, 'falafacil-balcao-deploy');
const targetZip = path.join(desktop, 'falafacil-balcao-deploy.zip');

if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);
if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

const entries = [
  'src', 'public', 'dist', 'data', 'tests',
  'package.json', 'package-lock.json', 'server.js',
  'render.yaml', 'Dockerfile', 'index.html',
  'vite.config.js', 'tailwind.config.js', 'postcss.config.js',
  'README.md', '.gitignore', '.dockerignore'
];

for (const entry of entries) {
  const srcPath = path.join(root, entry);
  const destPath = path.join(targetDir, entry);
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
  }
}

execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${targetZip}' -Force"`);
console.log('Deploy zip gerado com sucesso:', targetZip);
