import {NextResponse} from 'next/server';
import {getDb,dbConfigured} from '@/lib/db';
import {AVAILABILITY_DEFAULT56} from '@/lib/studio56';
export const dynamic='force-dynamic';
export async function GET(){
 try{
  if(!dbConfigured())return NextResponse.json({availability:AVAILABILITY_DEFAULT56},{headers:{'Cache-Control':'no-store'}});
  const db=await getDb();
  const doc=await db.collection('settings').findOne({_id:'availability56'});
  if(!doc)return NextResponse.json({availability:AVAILABILITY_DEFAULT56},{headers:{'Cache-Control':'no-store'}});
  // Only explicitly public fields leave the server.
  const {status,headline,message,leadTime,nextReview,services,updatedAt}=doc;
  return NextResponse.json({availability:{status,headline,message,leadTime,nextReview,services,updatedAt}},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('[Availability]',e.message);return NextResponse.json({error:'Availability could not be loaded.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
