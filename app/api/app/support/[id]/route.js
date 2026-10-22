import {ObjectId} from 'mongodb';
import {json,readJson,cleanText,rateLimit,failure,guard,audit} from '@/lib/api';
import {getDb,serialize} from '@/lib/db';
import {isStaff} from '@/lib/auth';
import {notify,notifyStaff} from '@/lib/notify';
const STATUS=['open','in_progress','waiting_on_client','resolved','closed'];
const PRIORITY=['low','normal','high','urgent'];
function ticketId(raw){return typeof raw==='string'&&/^[0-9a-fA-F]{24}$/.test(raw)?new ObjectId(raw):null;}
async function access(req,raw){const g=await guard(req);if(g.error)return {error:g.error};const id=ticketId(raw);if(!id)return {error:json({error:'Invalid ticket ID'},400)};const db=await getDb();const staff=isStaff(g.user);const ticket=await db.collection('supportTickets').findOne({_id:id,...(staff?{}:{ownerId:g.user._id})});if(!ticket)return {error:json({error:'Ticket not found'},404)};return {g,db,id,staff,ticket};}
export async function GET(req,{params}){try{const a=await access(req,(await params).id);if(a.error)return a.error;return json({item:serialize(a.ticket),staff:a.staff});}catch(e){return failure(e);}}
export async function POST(req,{params}){try{
 const a=await access(req,(await params).id);if(a.error)return a.error;
 if(!await rateLimit(req,'support-reply:'+a.g.user._id,30,3600000))return json({error:'Too many replies. Please try again later.'},429);
 const v=await readJson(req,7000);const body=cleanText(v.body,4000);
 if(body.length<2)return json({error:'Reply must contain at least 2 characters.'},400);
 if(a.ticket.status==='closed'&&!a.staff)return json({error:'This ticket is closed. Open a new ticket if you need more help.'},409);
 const now=new Date();const message={senderId:a.g.user._id,senderName:a.g.user.name,role:a.staff?'staff':'client',body,createdAt:now};
 const status=a.staff?'waiting_on_client':'open';
 await a.db.collection('supportTickets').updateOne({_id:a.id},{$push:{messages:message},$set:{status,updatedAt:now}});
 if(a.staff)await notify({userId:a.ticket.ownerId,title:'Support replied',body:`A reply was added to “${a.ticket.subject}”.`,link:'/support'});
 else await notifyStaff('Support ticket reply',`${a.g.user.name} replied to “${a.ticket.subject}”.`,'/admin?tab=tickets');
 await audit(a.g.user,'reply','supportTickets',{ticketId:String(a.id)});
 return json({ok:true,status});
}catch(e){if(['PAYLOAD_TOO_LARGE','INVALID_JSON'].includes(e.message))return json({error:'Invalid request'},400);return failure(e);}}
export async function PATCH(req,{params}){try{
 const a=await access(req,(await params).id);if(a.error)return a.error;
 if(!a.staff)return json({error:'Only studio staff can change ticket status.'},403);
 const v=await readJson(req,2000);const patch={updatedAt:new Date()};
 if(Object.hasOwn(v,'status')){if(!STATUS.includes(v.status))return json({error:'Invalid ticket status.'},400);patch.status=v.status;}
 if(Object.hasOwn(v,'priority')){if(!PRIORITY.includes(v.priority))return json({error:'Invalid priority.'},400);patch.priority=v.priority;}
 if(Object.keys(patch).length===1)return json({error:'No changes provided.'},400);
 await a.db.collection('supportTickets').updateOne({_id:a.id},{$set:patch});
 await audit(a.g.user,'update','supportTickets',{ticketId:String(a.id),status:patch.status,priority:patch.priority});
 if(patch.status)await notify({userId:a.ticket.ownerId,title:'Support ticket updated',body:`“${a.ticket.subject}” is now ${patch.status.replaceAll('_',' ')}.`,link:'/support'});
 return json({ok:true});
}catch(e){if(['PAYLOAD_TOO_LARGE','INVALID_JSON'].includes(e.message))return json({error:'Invalid request'},400);return failure(e);}}
