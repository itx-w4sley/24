import {getDb} from '@/lib/db';import {readJson,rateLimit,cleanText,json} from '@/lib/api';
export async function POST(req){try{
  if(!await rateLimit(req,'pageview',80,3600000))return json({ok:true});
  const v=await readJson(req,300);const path=cleanText(v.path,160);
  if(!path.startsWith('/')||path.startsWith('//')||['/studio','/portal','/login','/api'].some(s=>path.startsWith(s)))return json({ok:true});
  const db=await getDb();await db.collection('analytics').insertOne({kind:'pageview',path,createdAt:new Date()});return json({ok:true});
}catch{return json({ok:true});}}
