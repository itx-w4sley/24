import {guard,json,failure,audit} from '@/lib/api';import {getDb,collections,serialize} from '@/lib/db';
export async function GET(req){try{
  const g=await guard(req);if(g.error)return g.error;if(g.user.role!=='admin')return json({error:'Forbidden'},403);
  const db=await getDb();const data={format:'creative-studio-5-export',createdAt:new Date().toISOString(),collections:{}};
  for(const name of collections.filter(n=>!['rateLimits','analytics'].includes(n))){
    data.collections[name]=serialize(await db.collection(name).find({},name==='users'?{projection:{passwordHash:0}}:{}).limit(10000).toArray());
  }
  await audit(g.user,'export','data');
  return new Response(JSON.stringify(data,null,2),{headers:{'content-type':'application/json','content-disposition':`attachment; filename="studio-export-${new Date().toISOString().slice(0,10)}.json"`,'cache-control':'no-store'}});
}catch(e){return failure(e);}}
