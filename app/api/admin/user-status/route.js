import {guard,json,readJson,failure,safeId,audit} from '@/lib/api';import {getDb} from '@/lib/db';
export async function PATCH(req){try{const g=await guard(req);if(g.error)return g.error;if(g.user.role!=='admin')return json({error:'Administrator required'},403);
 const {id,active}=await readJson(req);if(typeof active!=='boolean')return json({error:'Invalid status'},400);
 if(id===g.user._id&&!active)return json({error:'You cannot disable yourself'},400);
 const db=await getDb();const _id=safeId(id),target=await db.collection('users').findOne({_id});if(!target)return json({error:'Not found'},404);
 if(!active&&target.role==='admin'&&await db.collection('users').countDocuments({role:'admin',active:{$ne:false}})<=1)return json({error:'At least one active administrator is required'},409);
 await db.collection('users').updateOne({_id},{$set:{active,updatedAt:new Date()}});await audit(g.user,active?'enable_user':'disable_user','users',{id});return json({ok:true});
 }catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid account ID'},400);return failure(e)}}
