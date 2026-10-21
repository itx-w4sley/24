import {existsSync,readFileSync} from 'node:fs';
export function loadEnvironment(){
  for(const file of ['.env','.env.local']){
    if(!existsSync(file))continue;
    const lines=readFileSync(file,'utf8').split(/\r?\n/);
    for(const line of lines){const match=line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);if(!match)continue;const [,key,raw]=match;if(process.env[key])continue;let value=raw.trim();if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);process.env[key]=value;}
  }
}
