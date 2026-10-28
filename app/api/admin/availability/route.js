import {guard,json,readJson,cleanText,failure,audit} from '@/lib/api';
import {getDb} from '@/lib/db';
import {SERVICES56,STATUS_VALUES56,AVAILABILITY_DEFAULT56} from '@/lib/studio56';
export const dynamic='force-dynamic';
export async function GET(req){
 try{
  const g=await guard(req,{staff:true});if(g.error)return g.error;
  const db=await getDb();const doc=await db.collection('settings').findOne({_id:'availability56'});
  return json({availability:doc?{status:doc.status,headline:doc.headline,message:doc.message,leadTime:doc.leadTime,nextReview:doc.nextReview,services:doc.services,updatedAt:doc.updatedAt}:AVAILABILITY_DEFAULT56});
 }catch(e){return failure(e);}
}
export async function PATCH(req){
 try{
  const g=await guard(req,{staff:true});if(g.error)return g.error;
  if(g.user.role!=='admin')return json({error:'Administrator permission required.'},403);
  const v=await readJson(req,6000);
  if(!STATUS_VALUES56.includes(v.status))return json({error:'Choose a valid availability status.'},400);
  if(typeof v.headline!=='string'||v.headline.trim().length<3)return json({error:'Enter a headline.'},400);
  if(v.nextReview && (typeof v.nextReview!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v.nextReview)||Number.isNaN(Date.parse(v.nextReview+'T00:00:00Z'))))return json({error:'Invalid review date.'},400);
  const allowed=new Set(SERVICES56.map(s=>s.id));
  const services=Array.isArray(v.services)?[...new Set(v.services.filter(s=>typeof s==='string'&&allowed.has(s)))]:[];
  const updates={status:v.status,headline:cleanText(v.headline,100),message:cleanText(v.message,800),leadTime:cleanText(v.leadTime,100),nextReview:v.nextReview||'',services,updatedAt:new Date()};
  const db=await getDb();await db.collection('settings').updateOne({_id:'availability56'},{$set:updates},{upsert:true});
  await audit(g.user,'update','availability',{status:updates.status});
  return json({ok:true,availability:updates});
 }catch(e){if(['INVALID_JSON','PAYLOAD_TOO_LARGE'].includes(e.message))return json({error:'Invalid request body.'},400);return failure(e);}
}
