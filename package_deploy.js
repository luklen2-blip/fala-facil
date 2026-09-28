import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Gerando pacote limpo de produção (.zip) na Área de Trabalho...');

const projectDir = __dirname;
const stagingDir = path.join(projectDir, '.staging_deploy');

if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

const itemsToCopy = [
  'package.json',
  'package-lock.json',
  'server.js',
  'render.yaml',
  'Dockerfile',
  '.dockerignore',
  '.gitignore',
  'README.md',
  'public',
  'dist',
  'src',
  'tests',
  'generate_icons.cjs',
  'tailwind.config.js',
  'postcss.config.js',
  'vite.config.js'
];

for (const item of itemsToCopy) {
  const src = path.join(projectDir, item);
  const dst = path.join(stagingDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
  }
}

const desktopPaths = [
  path.join(process.env.USERPROFILE, 'Desktop'),
  path.join(process.env.USERPROFILE, 'OneDrive', 'Desktop')
];

for (const desk of desktopPaths) {
  if (fs.existsSync(desk)) {
    const zipDest = path.join(desk, 'falafacil-balcao-deploy.zip');
    const folderDest = path.join(desk, 'falafacil-balcao-deploy');

    // Remove zip e pasta anteriores
    if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
    if (fs.existsSync(folderDest)) fs.rmSync(folderDest, { recursive: true, force: true });

    // Copia pasta descompactada
    fs.cpSync(stagingDir, folderDest, { recursive: true });

    // Gera ZIP via powershell Compress-Archive
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipDest}' -Force"`);
    console.log(`✅ Pacote ZIP salvo em: ${zipDest}`);
  }
}

fs.rmSync(stagingDir, { recursive: true, force: true });
console.log('🎉 Pacote de implantação atualizado com sucesso na Área de Trabalho!');
