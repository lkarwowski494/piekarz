/**
 * Bez workflowu „Deploy GitHub Pages” w tym repo: strony Piekarza publikuje apps4brew-www, a Pages tego repo nie jest
 * skonfigurowane, więc każdy przebieg kończył się porażką [M1-audytor-generalny-077; 07-jakosc-013; zgoda właściciela].
 */
import fs from 'fs';
import path from 'path';

const KAT = path.join(__dirname, '..', '.github', 'workflows');

describe('077: bez workflowu bez szansy na sukces', () => {
  it('nie ma pages.yml ani innego workflowu z actions/deploy-pages', () => {
    const zle = fs.readdirSync(KAT).filter((f) => f === 'pages.yml' || /actions\/deploy-pages@/.test(fs.readFileSync(path.join(KAT, f), 'utf8')));
    expect(zle).toEqual([]);
  });
});
