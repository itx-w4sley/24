import {guard,json,readJson,cleanText,failure,audit} from '@/lib/api';import {getDb,serialize} from '@/lib/db';import {hashPassword} from '@/lib/auth';
export async function GET(req){try{const g=await guard(req);if(g.error)return g.error;if(g.user.role!=='admin')return json({error:'Forbidden'},403);const db=await getDb();return json({items:serialize(await db.collection('users').find({}, {projection:{passwordHash:0}}).sort({createdAt:-1}).toArray())});}catch(e){return failure(e);}}
export async function POST(req){try{
  const g=await guard(req);if(g.error)return g.error;if(g.user.role!=='admin')return json({error:'Forbidden'},403);
  const v=await readJson(req);const name=cleanText(v.name,120),email=cleanText(v.email,254).toLowerCase(),role=cleanText(v.role,20);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['admin','designer','client'].includes(role))return json({error:'Invalid user details'},400);
  const passwordHash=await hashPassword(v.password);
  const db=await getDb();const created=await db.collection('users').insertOne({name,email,role,passwordHash,active:true,createdAt:new Date(),updatedAt:new Date()});
  await audit(g.user,'create_user','users',{userId:String(created.insertedId),role});return json({ok:true,id:String(created.insertedId)},201);
}catch(e){if(e.code===11000)return json({error:'Email already registered'},409);if(e.message.startsWith('Password must'))return json({error:e.message},400);return failure(e);}}
export async function PATCH(req){try{
  const g=await guard(req);if(g.error)return g.error;if(g.user.role!=='admin')return json({error:'Forbidden'},403);
  const v=await readJson(req);const {ObjectId}=await import('mongodb');
  if(!ObjectId.isValid(v.id))return json({error:'Invalid ID'},400);if(v.id===g.user._id)return json({error:'You cannot modify your own role or status.'},400);
  const role=cleanText(v.role,20);if(!['admin','designer','client'].includes(role))return json({error:'Invalid role'},400);
  const db=await getDb();const set={role,active:v.active!==false,updatedAt:new Date()};
  if(v.name)set.name=cleanText(v.name,120);
  if(v.password)set.passwordHash=await hashPassword(v.password);
  await db.collection('users').updateOne({_id:new ObjectId(v.id)},{$set:set});
  await audit(g.user,'update_user','users',{userId:v.id,role,active:set.active});return json({ok:true});
}catch(e){if(e.message.startsWith('Password must'))return json({error:e.message},400);return failure(e);}}
