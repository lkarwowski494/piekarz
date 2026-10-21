/**
 * M1-audytor-generalny-173 (10-wydanie-501): dokumenty w docs/ nie podają Team ID
 * z konfiguracji podpisu jako „przykładu”. Wartość ma jedno miejsce: `app.json`
 * (`expo.ios.appleTeamId`), potrzebne do podpisu buildu.
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const teamId: string = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo.ios.appleTeamId;

const md = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? md(p) : e.name.endsWith('.md') ? [p] : [];
  });

describe('Team ID tylko w app.json (173)', () => {
  it('app.json ma 10-znakowy Team ID', () => {
    expect(teamId).toMatch(/^[A-Z0-9]{10}$/);
  });

  it('żaden plik docs/**/*.md nie zawiera wartości Team ID', () => {
    const z = md(path.join(root, 'docs'))
      .filter((p) => fs.readFileSync(p, 'utf8').includes(teamId))
      .map((p) => path.relative(root, p).split(path.sep).join('/'));
    expect(z).toEqual([]);
  });
});
