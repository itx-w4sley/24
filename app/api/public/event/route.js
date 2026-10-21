import {json,sameOrigin,failure,readJson,rateLimit} from '@/lib/api';import {getDb,dbConfigured} from '@/lib/db';
export async function POST(req){try{if(!sameOrigin(req))return json({error:'Forbidden'},403);if(!dbConfigured())return json({ok:true});
 if(!await rateLimit(req,'events',250,3600000))return json({ok:true});const data=await readJson(req,1500);
 if(!['pageview','projectview'].includes(data.kind))return json({error:'Unsupported event'},400);
 const path=typeof data.path==='string'&&/^\/[a-zA-Z0-9\-/_]*$/.test(data.path)?data.path.slice(0,160):'/';
 const db=await getDb();await db.collection('analytics').insertOne({kind:data.kind,path,createdAt:new Date()});return json({ok:true});
 }catch(e){return failure(e)}}
