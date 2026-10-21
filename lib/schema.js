import {cleanText,validateUrl} from '@/lib/api';
import {slugify,CATEGORIES} from '@/lib/projects';
export const resources={
  projects:{fields:['name','slug','category','description','body','client','image','beforeImage','status','featured','year','tags','tools','position'],required:'name'},
  news:{fields:['title','slug','summary','body','image','status','featured','position'],required:'title'},
  services:{fields:['title','slug','description','features','status','position','icon'],required:'title'},
  reviews:{fields:['name','quote','rating','project','status','position'],required:'name'},
  assets:{fields:['name','url','category','type','size','status','tags'],required:'name'},
  pageContent:{fields:['key','title','body','status'],required:'key'},
  inquiries:{fields:['status','assigneeId','notes'],required:null},
  commissions:{fields:['status','price','currency','assignedTo','dueDate','downloadUrl','notes','priority','progress'],required:null}
};
export function normalizeResource(type,v,isEdit=false){
  if(!resources[type])throw new Error('INVALID_RESOURCE');
  const out={};for(const key of resources[type].fields){if(!Object.prototype.hasOwnProperty.call(v,key))continue;
    let x=v[key];
    if(['featured'].includes(key)){out[key]=!!x;continue;}
    if(['year','position','price','rating','progress','size'].includes(key)){out[key]=Math.max(0,Math.min(999999999,Number(x)||0));continue;}
    if(['tags','features','tools'].includes(key)){out[key]=(Array.isArray(x)?x:typeof x==='string'?x.split(','):[]).slice(0,30).map(i=>cleanText(i,110)).filter(Boolean);continue;}
    if(['image','beforeImage','url','downloadUrl'].includes(key)){out[key]=validateUrl(x);continue;}
    if(['status','category','priority','currency'].includes(key)){out[key]=cleanText(x,50);continue;}
    out[key]=cleanText(x,key==='body'?20000: key==='description'||key==='notes'?3000:240);
  }
  if(!isEdit && resources[type].required && !out[resources[type].required])throw new Error('REQUIRED_FIELD');
  if(['projects','news','services'].includes(type)){
    if(!out.slug&&!isEdit)out.slug=slugify(out.name||out.title);
    if(out.slug)out.slug=slugify(out.slug);
  }
  if(type==='projects'&&out.category&&!CATEGORIES.includes(out.category))throw new Error('INVALID_CATEGORY');
  if(out.status&&!['draft','published','archived','new','quoted','queued','in_progress','awaiting_approval','revision','completed','cancelled','approved','pending','approved','rejected','open','closed'].includes(out.status))throw new Error('INVALID_STATUS');
  return out;
}
