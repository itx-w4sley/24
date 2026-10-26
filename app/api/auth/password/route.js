import {currentUser,hashPassword,clearAuthCookie} from '@/lib/auth';
import {readJson,json,failure,sameOrigin,audit} from '@/lib/api';
import {getDb} from '@/lib/db';
import {ObjectId} from 'mongodb';import bcrypt from 'bcryptjs';
export async function POST(req){try{
  if(!sameOrigin(req))return json({error:'Forbidden'},403);
  const user=await currentUser(req);if(!user)return json({error:'Sign in first'},401);
  const {currentPassword,newPassword}=await readJson(req,5000);
  const db=await getDb();const original=await db.collection('users').findOne({_id:new ObjectId(user._id)});
  if(!await bcrypt.compare(currentPassword||'',original.passwordHash))return json({error:'Current password is incorrect'},400);
  const passwordHash=await hashPassword(newPassword);
  await db.collection('users').updateOne({_id:original._id},{$set:{passwordHash,updatedAt:new Date()},$inc:{sessionVersion:1}});
  await db.collection('sessions').updateMany({userId:user._id},{$set:{revoked:true}});await audit(user,'change_password','users');return clearAuthCookie(json({ok:true,signInAgain:true}));
}catch(e){if(e.message.includes('Password must'))return json({error:e.message},400);return failure(e);}}
