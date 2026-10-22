import {guard,json,readJson,cleanText,safeId,failure,audit} from '@/lib/api';
import {getDb,serialize} from '@/lib/db';import {notify} from '@/lib/notify';
const KINDS=['milestone','progress','delivery','note'];
async function accessible(req,params){const g=await guard(req);if(g.error)return {error:g.error};const {id}=await params;const db=await getDb();const c=await db.collection('commissions').findOne({_id:safeId(id)});if(!c)return {error:json({error:'Project not found'},404)};
 const staff=['admin','designer'].includes(g.user.role);
 const owner=!!c.ownerId&&String(c.ownerId)===String(g.user._id);
 const assigned=!!c.assignedTo&&String(c.assignedTo)===String(g.user._id);
 if(!(owner||g.user.role==='admin'||(staff&&assigned)))return {error:json({error:'Forbidden'},403)};
 return {g,db,c,id,staff,assigned};
}
export async function GET(req,{params}){try{const x=await accessible(req,params);if(x.error)return x.error;const items=await x.db.collection('projectUpdates').find({commissionId:x.id}).sort({createdAt:-1}).limit(100).toArray();return json({items:serialize(items)});}catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid commission ID'},400);return failure(e);}}
export async function POST(req,{params}){try{const x=await accessible(req,params);if(x.error)return x.error;if(!x.staff)return json({error:'Staff only'},403);if(x.g.user.role==='designer'&&!x.assigned)return json({error:'Not assigned to project'},403);
 const input=await readJson(req,7000);const title=cleanText(input.title,140),body=cleanText(input.body,1800),kind=cleanText(input.kind||'progress',30);
 if(title.length<3||!KINDS.includes(kind))return json({error:'Provide a title and valid update kind'},400);
 const record={commissionId:x.id,title,body,kind,createdAt:new Date(),authorId:x.g.user._id,authorName:x.g.user.name};
 const result=await x.db.collection('projectUpdates').insertOne(record);
 await audit(x.g.user,'project_update','commissions',{id:x.id,updateId:String(result.insertedId)});
 if(x.c.ownerId)await notify({userId:x.c.ownerId,title:'Project progress update',body:`${x.c.title}: ${title}`,link:'/portal'});
 return json({ok:true,id:String(result.insertedId)},201);
}catch(e){if(['INVALID_ID','INVALID_JSON','PAYLOAD_TOO_LARGE'].includes(e.message))return json({error:e.message},400);return failure(e);}}
