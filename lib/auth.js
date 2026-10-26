import {SignJWT,jwtVerify} from 'jose';
import bcrypt from 'bcryptjs';
import {cookies} from 'next/headers';
import {getDb} from '@/lib/db';
import {ObjectId} from 'mongodb';
import {randomUUID} from 'node:crypto';
const COOKIE='studio_session';
function secret(){
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32||process.env.SESSION_SECRET.includes('GENERATE')) throw new Error('SESSION_SECRET_MISSING');
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}
export async function createToken(user){
  const sid=randomUUID();
  const db=await getDb();
  await db.collection('sessions').insertOne({sid,userId:String(user._id),createdAt:new Date(),expiresAt:new Date(Date.now()+7*86400000),revoked:false});
  return new SignJWT({role:user.role,email:user.email,sid,sessionVersion:Number(user.sessionVersion||0)}).setProtectedHeader({alg:'HS256'}).setSubject(String(user._id)).setIssuedAt().setExpirationTime('7d').sign(secret());
}
export async function verifyToken(token){try{if(!token)return null;return (await jwtVerify(token,secret())).payload;}catch{return null;}}
export function setAuthCookie(res,token){res.cookies.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});return res;}
export function clearAuthCookie(res){res.cookies.set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});return res;}
export async function currentUser(req){
  const token=req?req.cookies.get(COOKIE)?.value:(await cookies()).get(COOKIE)?.value;
  const claims=await verifyToken(token);
  if(!claims||!ObjectId.isValid(claims.sub))return null;
  try{
    const db=await getDb();const user=await db.collection('users').findOne({_id:new ObjectId(claims.sub),active:{$ne:false}},{projection:{passwordHash:0}});
    if(!user||user.role!==claims.role)return null;
    if(Number(claims.sessionVersion||0)!==Number(user.sessionVersion||0))return null;
    if(claims.sid){const sess=await db.collection('sessions').findOne({sid:claims.sid,userId:String(user._id),revoked:{$ne:true},expiresAt:{$gt:new Date()}});if(!sess)return null;}
    return {_id:String(user._id),name:user.name,email:user.email,role:user.role,active:user.active!==false,avatar:user.avatar||'',createdAt:user.createdAt};
  }catch{return null;}
}
export async function authenticate(email,password){
  const db=await getDb();const user=await db.collection('users').findOne({email:email.trim().toLowerCase()});
  if(!user||user.active===false||!await bcrypt.compare(password||'',user.passwordHash||''))return null;
  return user;
}
export function canUse(user,resource,action='read'){
  if(!user)return false;
  if(user.role==='admin')return true;
  if(user.role==='designer')return ['projects','assets','commissions','news','reviews','messages','services','pageContent','packages','activity'].includes(resource) && !(resource==='news'&&action==='delete');
  return false;
}
export function isStaff(user){return !!user && ['admin','designer'].includes(user.role);}
export async function hashPassword(p){if(!p||p.length<12||p.length>128)throw new Error('Password must contain 12–128 characters');return bcrypt.hash(p,12);}
