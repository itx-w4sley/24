import {getDb,dbConfigured,serialize} from '@/lib/db';
import {demoProjects,seedNews,initialServices} from '@/lib/projects';
const defaults={projects:demoProjects,news:seedNews,services:initialServices,reviews:[],settings:[]};
export async function publicItems(type,{limit=200}={}){
  if(!dbConfigured())return defaults[type]||[];
  try{
    const db=await getDb();const rows=await db.collection(type).find({status:'published'}).sort({position:1,createdAt:-1}).limit(limit).toArray();
    return serialize(rows);
  }catch(e){console.error(`[Content/${type}]`,e.message);return defaults[type]||[];}
}
export async function publicItem(type,slug){return (await publicItems(type,{limit:300})).find(x=>x.slug===slug)||null;}

export async function publicSettings(){if(!dbConfigured())return {};try{const db=await getDb();const doc=await db.collection('settings').findOne({_id:'public'});return doc||{};}catch{return {};}}
export async function publicBlocks(){if(!dbConfigured())return {};try{const db=await getDb();const rows=await db.collection('pageContent').find({status:'published'}).limit(30).toArray();return Object.fromEntries(rows.map(r=>[r.key,r]));}catch{return {};}}
