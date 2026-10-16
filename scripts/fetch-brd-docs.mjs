import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const gdrivePath = 'C:\\Users\\lukas\\.gemini\\config\\plugins\\gdrive\\skills\\gdrive\\scripts\\gdrive.cmd';
const folderId = '1lcPSW4U3_TiPBQJChfspPByQsMu21tLp';

console.log('Listing files in BRD folder...');
const output = execSync(`"${gdrivePath}" readonly search --parent-id ${folderId} --max 50 --json`, {
  encoding: 'utf-8',
});

const files = JSON.parse(output);
console.log(`Found ${files.length} files.`);

fs.mkdirSync('docs/brd', { recursive: true });

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  let safeName = file.name
    .replace(/[^a-zA-Z0-9_\-\. ]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  const outPath = path.join('docs', 'brd', `${safeName}.md`);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
    console.log(`[${i + 1}/${files.length}] Already exists: ${outPath}`);
    continue;
  }

  console.log(`[${i + 1}/${files.length}] Exporting ${file.name} -> ${outPath}...`);
  try {
    execSync(`"${gdrivePath}" readonly export ${file.id} "${outPath}" --format md`, {
      encoding: 'utf-8',
    });
  } catch (err) {
    console.error(`Failed to export ${file.name}:`, err.message);
  }
}

console.log('Done downloading all BRD docs!');
