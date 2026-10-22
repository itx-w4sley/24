import {guard,json,readJson,failure,audit,safeId} from '@/lib/api';import {getDb} from '@/lib/db';import {normalizeResource,resources} from '@/lib/schema';import {notify} from '@/lib/notify';
export async function PATCH(req,{params}){try{
  const {resource,id}=await params;if(!resources[resource])return json({error:'Not found'},404);
  const g=await guard(req,{resource,action:'update'});if(g.error)return g.error;
  const change=normalizeResource(resource,await readJson(req),true);if(!Object.keys(change).length)return json({error:'No updates'},400);
  const db=await getDb();const _id=safeId(id);const original=await db.collection(resource).findOne({_id});if(!original)return json({error:'Not found'},404);
  if(resource==='commissions'&&g.user.role==='designer'&&original.assignedTo&&original.assignedTo!==g.user._id)return json({error:'Not assigned to you'},403);
  if(resource==='commissions'&&Object.prototype.hasOwnProperty.call(change,'ownerId')){
    if(g.user.role!=='admin')return json({error:'Admin permission required to assign client'},403);
    if(change.ownerId){
      if(!/^[a-f\d]{24}$/i.test(change.ownerId))return json({error:'Invalid client user ID'},400);
      const u=await db.collection('users').findOne({_id:safeId(change.ownerId)});
      if(!u||u.role!=='client'||u.active===false)return json({error:'Client account not found or disabled'},400);
    }
  }
  if(resource==='commissions'&&('status'in change||'downloadUrl'in change)){
    await notify({userId:original.ownerId,title:'Your commission was updated',body:`${original.title} — ${change.status||original.status}`,link:'/portal',email:original.email});
  }
  await db.collection(resource).updateOne({_id},{$set:{...change,updatedAt:new Date()}});
  await audit(g.user,'update',resource,{id,fields:Object.keys(change)});return json({ok:true});
}catch(e){if(['INVALID_ID','INVALID_STATUS','INVALID_CATEGORY','INVALID_URL','INVALID_JSON'].includes(e.message))return json({error:e.message},400);if(e.code===11000)return json({error:'Slug already exists'},409);return failure(e);}}
export async function DELETE(req,{params}){try{
  const {resource,id}=await params;if(!resources[resource]||['commissions','inquiries'].includes(resource))return json({error:'Use status to archive records.'},400);
  const g=await guard(req,{resource,action:'delete'});if(g.error)return g.error;
  if(g.user.role!=='admin')return json({error:'Admin permission required for deletion'},403);
  const db=await getDb();const result=await db.collection(resource).deleteOne({_id:safeId(id)});
  if(!result.deletedCount)return json({error:'Not found'},404);
  await audit(g.user,'delete',resource,{id});return json({ok:true});
}catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid ID'},400);return failure(e);}}
