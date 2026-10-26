import {clearAuthCookie,verifyToken} from '@/lib/auth';
import {getDb} from '@/lib/db';
import {json,sameOrigin} from '@/lib/api';
export async function POST(req){
 if(!sameOrigin(req))return json({error:'Forbidden'},403);
 try{const claims=await verifyToken(req.cookies.get('studio_session')?.value);if(claims?.sid){const db=await getDb();await db.collection('sessions').updateOne({sid:claims.sid,userId:claims.sub},{$set:{revoked:true}});}}catch(e){console.error('[Logout]',e?.message)}
 return clearAuthCookie(json({ok:true}));
}
