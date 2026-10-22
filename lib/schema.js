import {cleanText,validateUrl} from '@/lib/api';
import {slugify,CATEGORIES} from '@/lib/projects';
export const resources={
  projects:{fields:['name','slug','category','description','body','client','image','beforeImage','status','stage','challenge','solution','outcome','gallery','featured','year','tags','tools','position'],required:'name'},
  news:{fields:['title','slug','summary','body','image','status','featured','position'],required:'title'},
  services:{fields:['title','slug','description','features','status','position','icon'],required:'title'},
  reviews:{fields:['name','quote','rating','project','status','position'],required:'name'},
  assets:{fields:['name','url','category','type','size','status','tags'],required:'name'},
  pageContent:{fields:['key','title','body','status'],required:'key'},
  packages:{fields:['title','slug','description','features','startingPrice','priceLabel','turnaround','position','status','featured'],required:'title'},
  activity:{fields:['title','body','projectSlug','kind','status','position'],required:'title'},
  inquiries:{fields:['status','assigneeId','notes'],required:null},
  commissions:{fields:['ownerId','status','price','currency','assignedTo','dueDate','downloadUrl','notes','priority','progress'],required:null}
};
export function normalizeResource(type,v,isEdit=false){
  if(!resources[type])throw new Error('INVALID_RESOURCE');
  const out={};for(const key of resources[type].fields){if(!Object.prototype.hasOwnProperty.call(v,key))continue;
    let x=v[key];
    if(['featured'].includes(key)){out[key]=!!x;continue;}
    if(['year','position','price','startingPrice','rating','progress','size'].includes(key)){out[key]=Math.max(0,Math.min(999999999,Number(x)||0));continue;}
    if(['tags','features','tools'].includes(key)){out[key]=(Array.isArray(x)?x:typeof x==='string'?x.split(','):[]).slice(0,30).map(i=>cleanText(i,110)).filter(Boolean);continue;}
    if(['image','beforeImage','url','downloadUrl'].includes(key)){out[key]=validateUrl(x);continue;}
    if(['status','category','priority','currency','stage','kind','priceLabel'].includes(key)){out[key]=cleanText(x,50);continue;}
    if(key==='gallery'){out.gallery=(Array.isArray(x)?x:typeof x==='string'?x.split(/[\n,]+/):[]).slice(0,12).map(u=>validateUrl(String(u).trim())).filter(Boolean);continue;}
    out[key]=cleanText(x,key==='body'?20000: ['description','notes','challenge','solution','outcome'].includes(key)?3000:240);
  }
  if(!isEdit && resources[type].required && !out[resources[type].required])throw new Error('REQUIRED_FIELD');
  if(['projects','news','services','packages'].includes(type)){
    if(!out.slug&&!isEdit)out.slug=slugify(out.name||out.title);
    if(out.slug)out.slug=slugify(out.slug);
  }
  if(type==='projects'&&out.category&&!CATEGORIES.includes(out.category))throw new Error('INVALID_CATEGORY');
  if(type==='projects'&&out.stage&&!['planning','in_development','testing','on_hold','completed'].includes(out.stage))throw new Error('INVALID_STAGE');
  if(type==='activity'&&out.kind&&!['update','release','milestone','announcement'].includes(out.kind))throw new Error('INVALID_KIND');
  if(out.status&&!['draft','published','archived','new','quoted','queued','in_progress','awaiting_approval','revision','completed','cancelled','approved','pending','approved','rejected','open','closed'].includes(out.status))throw new Error('INVALID_STATUS');
  return out;
}
