import {existsSync,readFileSync} from 'node:fs';
import {demoProjects} from '../lib/projects.js';
const critical=['package.json','.env.example','app/layout.jsx','app/globals.css','app/page.jsx','app/portfolio/page.jsx','components/StudioAdmin.jsx','components/ClientPortal.jsx','lib/auth.js','lib/db.js','scripts/setup.mjs'];
let failures=0;for(const f of critical)if(!existsSync(f)){console.error('MISSING',f);failures++;}
for(const p of demoProjects){if(!p.image.startsWith('/assets/')||!p.slug){console.error('Invalid portfolio entry',p);failures++;}}
if(demoProjects.length!==33){console.error('Expected 33 imported art projects');failures++;}
if(readFileSync('.env.example','utf8').includes('sk-')){console.error('Suspicious API key in template');failures++;}
console.log(`Checked ${critical.length} essential files and ${demoProjects.length} projects. ${failures?'FAILED':'PASS'}.`);if(failures)process.exitCode=1;
