import {guard,json,failure,safeId,audit} from '@/lib/api';
import {getDb} from '@/lib/db';
export async function GET(req,{params}){try{
 const g=await guard(req);if(g.error)return g.error;const {id}=await params;const db=await getDb();const doc=await db.collection('deliveries').findOne({_id:safeId(id)});
 if(!doc)return json({error:'File not found'},404);
 if(g.user.role!=='admin'&&doc.ownerId!==g.user._id&&!(g.user.role==='designer'&&doc.assignedTo===g.user._id))return json({error:'Not permitted'},403);
 const target=new URL(doc.url);if(target.protocol!=='https:')return json({error:'Unsafe URL'},400);
 await db.collection('deliveries').updateOne({_id:doc._id},{$inc:{downloadCount:1},$set:{lastDownloadAt:new Date()}});
 await audit(g.user,'delivery_download','deliveries',{id});
 return new Response(null,{status:302,headers:{location:target.href,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}catch(e){if(e.message==='INVALID_ID')return json({error:'Invalid file'},400);return failure(e)}}
