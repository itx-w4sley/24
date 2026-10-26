import {getDb} from '@/lib/db';
import {safeId,cleanText} from '@/lib/api';
export const FEATURES=['account','notifications','quotes','deliveries','messages','revisions','audit','integrations','analytics','tasks'];
export const STAFF=['admin','designer'];
export function staff(user){return !!user&&STAFF.includes(user.role)}
export function admin(user){return user?.role==='admin'}
export function clean(v,max=500){return cleanText(v,max)}
export function requiredText(v,min=1,max=500){const s=clean(v,max);if(s.length<min)throw new Error('INVALID_INPUT');return s}
export function urlInput(v){if(!v)return '';const text=clean(v,1800);const u=new URL(text);if(u.protocol!=='https:')throw new Error('INVALID_URL');return u.href}
export async function commission(db,id,user,{requireOwner=false}={}){
 const item=await db.collection('commissions').findOne({_id:safeId(id)});
 if(!item)return null;
 const owner=String(item.ownerId||'')===user._id;
 if(requireOwner)return owner?item:null;
 return owner||user.role==='admin'||(user.role==='designer'&&String(item.assignedTo||'')===user._id)?item:null;
}
export async function commissions(db,user){const q=user.role==='admin'?{}:user.role==='designer'?{assignedTo:user._id}:{ownerId:user._id};return db.collection('commissions').find(q,{projection:{_id:1,title:1,ownerId:1,status:1,assignedTo:1,price:1,currency:1}}).sort({createdAt:-1}).limit(150).toArray()}
export function errorResponse(error,json,failure){if(['INVALID_ID','INVALID_INPUT','INVALID_URL','INVALID_JSON','PAYLOAD_TOO_LARGE'].includes(error?.message))return json({error:'Invalid or incomplete details.'},400);return failure(error)}
export const now=()=>new Date();
