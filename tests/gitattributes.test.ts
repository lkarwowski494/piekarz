/**
 * M1-audytor-generalny-169 (07-jakosc-507): checkout z core.autocrlf=true dawał
 * pliki z CRLF i test źródła Q10 padał. `.gitattributes` wymusza LF w kopii
 * roboczej niezależnie od ustawień gita u właściciela i w CI.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

describe('.gitattributes: LF w kopii roboczej (169)', () => {
  it('plik istnieje i ustawia text=auto eol=lf dla wszystkich plików', () => {
    const p = path.join(root, '.gitattributes');
    expect(fs.existsSync(p)).toBe(true);
    expect(fs.readFileSync(p, 'utf8').split(/\r?\n/)).toContain('* text=auto eol=lf');
  });

  it.each([
    'docs/tresci/pl/fermentacja-temperatura.md',
    'src/core/__tests__/fermentation-q10-source.test.ts',
    'docs/brd/fixtures/test-vectors.json',
  ])('%s ma eol=lf niezależnie od core.autocrlf', (plik) => {
    expect(git('-c', 'core.autocrlf=true', 'check-attr', 'eol', '--', plik).trim()).toBe(`${plik}: eol: lf`);
  });

  it('każdy plik tekstowy w indeksie ma LF (bez renormalizacji wyłączonych z -text)', () => {
    const zle = git('ls-files', '--eol')
      .split(/\r?\n/)
      .filter((l) => /^i\/(crlf|mixed)/.test(l) && !/attr\/-text/.test(l));
    expect(zle).toEqual([]);
  });
});
