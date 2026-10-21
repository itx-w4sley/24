import {guard,json,safeId,failure} from '@/lib/api';import {getDb} from '@/lib/db';
export async function GET(req,{params}){try{const g=await guard(req);if(g.error)return g.error;const {id}=await params;const db=await getDb();const record=await db.collection('commissions').findOne({_id:safeId(id)});if(!record)return json({error:'Not found'},404);if(g.user.role!=='admin'&&g.user._id!==record.ownerId&&g.user._id!==record.assignedTo)return json({error:'Forbidden'},403);
 if(!record.downloadUrl)return json({error:'No delivery is available yet'},404);const url=new URL(record.downloadUrl);if(!['https:','http:'].includes(url.protocol))return json({error:'Unsafe delivery link'},400);
 return new Response(null,{status:302,headers:{location:url.href,'cache-control':'private, no-store','referrer-policy':'no-referrer'}});
 }catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid order ID'},400);return failure(e)}}
