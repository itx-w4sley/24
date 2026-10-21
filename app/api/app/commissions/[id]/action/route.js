import {guard,readJson,json,safeId,cleanText,failure,audit} from '@/lib/api';import {getDb} from '@/lib/db';import {notifyStaff} from '@/lib/notify';
export async function POST(req,{params}){try{
 const g=await guard(req);if(g.error)return g.error;const {id}=await params;const body=await readJson(req,2000);const action=cleanText(body.action,30);
 if(!['approve','revision'].includes(action))return json({error:'Invalid action'},400);
 const db=await getDb();const _id=safeId(id);const c=await db.collection('commissions').findOne({_id});
 if(!c)return json({error:'Order not found'},404);if(c.ownerId!==g.user._id)return json({error:'Only the verified order owner can approve a proof'},403);
 if(c.status!=='awaiting_approval')return json({error:'This order is not awaiting approval'},409);
 const status=action==='approve'?'approved':'revision';const note=cleanText(body.note,1000);
 if(action==='revision'&&note.length<5)return json({error:'Describe the revision needed (at least 5 characters)'},400);
 const updated=await db.collection('commissions').updateOne({_id,ownerId:g.user._id,status:'awaiting_approval'},{$set:{status,updatedAt:new Date()},$push:{feedback:{action,note,actorId:g.user._id,createdAt:new Date()}}});
 if(updated.modifiedCount===0)return json({error:'Order was updated by someone else, refresh to continue'},409);
 await audit(g.user,'client_'+action,'commissions',{id});await notifyStaff('Commission '+status,`${g.user.name} ${action==='approve'?'approved the proof':'requested revisions'} for ${c.title}.`,'/admin');return json({ok:true,status});
 }catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid order'},400);return failure(e)}
}
