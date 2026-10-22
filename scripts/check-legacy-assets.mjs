import { existsSync } from 'node:fs';
import { LEGACY_ARTWORK } from '../lib/projects.js';
let count=0;
for (const [category,names] of Object.entries(LEGACY_ARTWORK)) {
  for(const name of names) {
    count++;
    const file=`public/assets/${name}.png`;
    if (!existsSync(file)) console.log(`MISSING ${file} (${category})`);
  }
}
console.log(`Reviewed ${count} original portfolio PNG references.`);
