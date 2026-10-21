import {rateLimit,readJson,json,failure,sameOrigin,cleanText,audit} from '@/lib/api';
import {getDb} from '@/lib/db';import {hashPassword,createToken,setAuthCookie} from '@/lib/auth';
export async function POST(req){try{
 if(!sameOrigin(req))return json({error:'Origin not permitted'},403);
 if(!await rateLimit(req,'register',5,3600000))return json({error:'Too many registrations. Please try later.'},429);
 const v=await readJson(req,5000);const name=cleanText(v.name,120),email=cleanText(v.email,254).toLowerCase();
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid name and email'},400);
 if(typeof v.password!=='string')return json({error:'Enter a password'},400);
 const hash=await hashPassword(v.password),db=await getDb();
 const result=await db.collection('users').insertOne({name,email,role:'client',passwordHash:hash,active:true,createdAt:new Date(),updatedAt:new Date()});
 const user={_id:result.insertedId,name,email,role:'client'};const token=await createToken(user);await audit(user,'register','users');
 return setAuthCookie(json({ok:true,user:{name,email,role:'client'}},201),token);
 }catch(e){if(e.code===11000)return json({error:'This email is already registered. Please sign in.'},409);if(e.message.includes('Password must'))return json({error:e.message},400);return failure(e)}}
