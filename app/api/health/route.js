import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
export const dynamic='force-dynamic';
/** Public status check. Intentionally never exposes credentials or connection details. */
export async function GET(){
 try{const db=await getDb();await db.command({ping:1});return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
 catch(e){console.error('[HEALTH]',e.message);return NextResponse.json({ok:false,code:'SERVICE_UNAVAILABLE'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
