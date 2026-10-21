import {guard,json,readJson,failure,audit} from '@/lib/api';import {getDb,serialize} from '@/lib/db';import {normalizeResource,resources} from '@/lib/schema';
export async function GET(req,{params}){try{
  const {resource}=await params;if(!resources[resource])return json({error:'Not found'},404);
  const g=await guard(req,{resource});if(g.error)return g.error;const db=await getDb();
  let query={};if(resource==='commissions'&&g.user.role==='designer')query={$or:[{assignedTo:g.user._id},{assignedTo:{$exists:false}},{assignedTo:''}]};
  const items=await db.collection(resource).find(query).sort({position:1,createdAt:-1}).limit(500).toArray();
  return json({items:serialize(items)});
}catch(e){return failure(e);}}
export async function POST(req,{params}){try{
  const {resource}=await params;if(!resources[resource]||['commissions','inquiries'].includes(resource))return json({error:'Unsupported operation'},404);
  const g=await guard(req,{resource,action:'create'});if(g.error)return g.error;
  const body=normalizeResource(resource,await readJson(req));const now=new Date();
  const db=await getDb();const result=await db.collection(resource).insertOne({...body,status:body.status||'draft',createdAt:now,updatedAt:now});
  await audit(g.user,'create',resource,{id:String(result.insertedId)});return json({ok:true,id:String(result.insertedId)},201);
}catch(e){if(['REQUIRED_FIELD','INVALID_STATUS','INVALID_CATEGORY','INVALID_URL','INVALID_JSON'].includes(e.message))return json({error:e.message},400);if(e.code===11000)return json({error:'Slug already exists'},409);return failure(e);}}
