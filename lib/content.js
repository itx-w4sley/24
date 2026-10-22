import {getDb,dbConfigured,serialize} from '@/lib/db';
import {demoProjects,seedNews,initialServices} from '@/lib/projects';

const defaults={projects:demoProjects,news:seedNews,services:initialServices,reviews:[],settings:[]};

// The 33 original PNG artwork entries are a permanent part of the public portfolio.
// They are separate from MongoDB-backed project/case-study records.
// Previously, configuring MongoDB hid all of the original artwork.
export function mergePortfolioProjects(databaseProjects=[]){
  const records=Array.isArray(databaseProjects)?databaseProjects:[];
  const existingSlugs=new Set(records.map(p=>p.slug).filter(Boolean));
  const existingAssets=new Set(records.map(p=>{
    try { return decodeURIComponent(String(p.image||'')).toLowerCase(); }
    catch { return String(p.image||'').toLowerCase(); }
  }).filter(Boolean));
  const existingNames=new Set(records.map(p=>`${String(p.category||'').toLowerCase()}|${String(p.name||'').trim().toLowerCase()}`));
  const legacy=demoProjects.filter(p=>{
    if(existingSlugs.has(p.slug))return false;
    if(existingNames.has(`${p.category.toLowerCase()}|${p.name.toLowerCase()}`))return false;
    const url=decodeURIComponent(p.image).toLowerCase();
    return !existingAssets.has(url);
  });
  return [...legacy,...records];
}

export async function publicItems(type,{limit=200}={}){
  if(!dbConfigured())return (defaults[type]||[]).slice(0,limit);
  try{
    const db=await getDb();
    const rows=await db.collection(type).find({status:'published'}).sort({position:1,createdAt:-1}).limit(limit).toArray();
    const data=serialize(rows);
    // Preserve ALL 33 legacy entries even when database-backed work is published.
    return type==='projects'?mergePortfolioProjects(data).slice(0,limit):data;
  }catch(e){
    console.error(`[Content/${type}]`,e.message);
    return (defaults[type]||[]).slice(0,limit);
  }
}
export async function publicItem(type,slug){return (await publicItems(type,{limit:500})).find(x=>x.slug===slug)||null;}

export async function publicSettings(){if(!dbConfigured())return {};try{const db=await getDb();const doc=await db.collection('settings').findOne({_id:'public'});return doc||{};}catch{return {};}}
export async function publicBlocks(){if(!dbConfigured())return {};try{const db=await getDb();const rows=await db.collection('pageContent').find({status:'published'}).limit(30).toArray();return Object.fromEntries(rows.map(r=>[r.key,r]));}catch{return {};}}
