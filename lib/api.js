import {NextResponse} from 'next/server';
import {currentUser,canUse} from '@/lib/auth';
import {getDb} from '@/lib/db';
import {ObjectId} from 'mongodb';
export const json=(data,status=200)=>NextResponse.json(data,{status});
export const failure=(e)=>{
  console.error('[API]',e.message);
  const status=e.message==='DATABASE_NOT_CONFIGURED'?503:e.message==='SESSION_SECRET_MISSING'?503:500;
  return json({error: status===503?'Server configuration is incomplete. Configure MongoDB and SESSION_SECRET.':'Could not process the request.'},status);
};
export function safeId(v){if(!ObjectId.isValid(v)||String(new ObjectId(v))!==v)throw new Error('INVALID_ID');return new ObjectId(v);}
export async function readJson(req,max=50000){const t=await req.text();if(t.length>max)throw new Error('PAYLOAD_TOO_LARGE');try{const v=JSON.parse(t);if(!v||Array.isArray(v)||typeof v!=='object')throw Error();return v;}catch{throw new Error('INVALID_JSON');}}
export function sameOrigin(req){
  const o=req.headers.get('origin');if(!o)return true;
  try{const url=new URL(req.url);const from=new URL(o);return from.origin===url.origin||(!!process.env.SITE_URL&&from.origin===new URL(process.env.SITE_URL).origin);}catch{return false;}
}
export async function guard(req,{resource,action='read',staff=false}={}){
  if(!sameOrigin(req))return {error:json({error:'Origin not permitted'},403)};
  const user=await currentUser(req);
  if(!user)return {error:json({error:'Sign in required'},401)};
  if(staff&&!['admin','designer'].includes(user.role))return {error:json({error:'Insufficient permissions'},403)};
  if(resource&&!canUse(user,resource,action))return {error:json({error:'Insufficient permissions'},403)};
  return {user};
}
export async function audit(user,action,resource,detail={}){
  try{const db=await getDb();await db.collection('audit').insertOne({actorId:user?._id||'system',actor:user?.email||'system',action,resource,detail,createdAt:new Date()});}catch(e){console.error('[AUDIT]',e.message);}
}
export function cleanText(v,len=500){return String(v??'').trim().slice(0,len);}
export function validateUrl(v){
  if(!v)return '';
  const s=cleanText(v,2048);
  if(s.startsWith('/assets/'))return s;
  try{const u=new URL(s);if(['https:','http:'].includes(u.protocol))return s;}catch{}
  throw new Error('INVALID_URL');
}
export async function rateLimit(req,key,limit=10,windowMs=600000){
  const db=await getDb();
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,64);
  // Atomic counter. Key is namespaced and hashed; never store raw personal addresses.
  const {createHash}=await import('node:crypto');const hash=createHash('sha256').update(`${key}:${ip}`).digest('hex');
  const slot=Math.floor(Date.now()/windowMs);const docKey=`${hash}:${slot}`;
  const result=await db.collection('rateLimits').findOneAndUpdate({_id:docKey},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((slot+2)*windowMs)}},{upsert:true,returnDocument:'after'});
  return result.count<=limit;
}
