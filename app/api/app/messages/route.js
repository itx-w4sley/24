import {guard,json,readJson,cleanText,failure,safeId,audit} from '@/lib/api';import {getDb,serialize} from '@/lib/db';import {notify} from '@/lib/notify';
async function permitted(db,g,commissionId){const c=await db.collection('commissions').findOne({_id:safeId(commissionId)});if(!c)return null;if(g.user.role==='admin'||c.ownerId===g.user._id||c.assignedTo===g.user._id)return c;return null;}
export async function GET(req){try{const g=await guard(req);if(g.error)return g.error;const id=new URL(req.url).searchParams.get('commissionId')||'';const db=await getDb();if(!await permitted(db,g,id))return json({error:'Forbidden'},403);return json({items:serialize(await db.collection('messages').find({commissionId:id}).sort({createdAt:1}).limit(250).toArray())});}catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid project'},400);return failure(e);}}
export async function POST(req){try{
  const g=await guard(req);if(g.error)return g.error;const {commissionId,body}=await readJson(req,8000);const db=await getDb();const c=await permitted(db,g,commissionId);if(!c)return json({error:'Forbidden'},403);
  const content=cleanText(body,4000);if(content.length<1)return json({error:'Message cannot be empty'},400);
  await db.collection('messages').insertOne({commissionId,body:content,senderId:g.user._id,senderName:g.user.name,role:g.user.role,createdAt:new Date()});
  await audit(g.user,'message','commissions',{commissionId});
  const recipient=g.user.role==='client'?c.assignedTo:c.ownerId;
  if(recipient&&recipient!==g.user._id)await notify({userId:recipient,title:'New project message',body:`${g.user.name} sent a message about ${c.title}`,link:`/portal?order=${commissionId}`});
  return json({ok:true},201);
}catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid project'},400);return failure(e);}}
