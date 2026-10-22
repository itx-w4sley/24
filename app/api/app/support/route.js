import {json,readJson,rateLimit,cleanText,failure,guard,audit} from '@/lib/api';
import {getDb,serialize} from '@/lib/db';
import {notifyStaff,notify} from '@/lib/notify';
import {isStaff} from '@/lib/auth';
const CATEGORIES=['Discord Bot','Discord Server','Bot Hosting','Website / App','Design / Branding','Account / Billing','Other'];
const PRIORITIES=['low','normal','high'];
export async function GET(req){try{
  const g=await guard(req);if(g.error)return g.error;
  const db=await getDb();const staff=isStaff(g.user);
  const query=staff?{}:{ownerId:g.user._id};
  const docs=await db.collection('supportTickets').find(query,{projection:{messages:0}}).sort({updatedAt:-1}).limit(150).toArray();
  return json({items:serialize(docs),staff});
}catch(e){return failure(e);}}
export async function POST(req){try{
  const g=await guard(req);if(g.error)return g.error;
  if(!await rateLimit(req,'support-create:'+g.user._id,6,3600000))return json({error:'Too many tickets created. Please try later.'},429);
  const v=await readJson(req,16000);
  const subject=cleanText(v.subject,160),description=cleanText(v.description,6000),category=cleanText(v.category,80),priority=cleanText(v.priority,30);
  if(subject.length<5||description.length<20||!CATEGORIES.includes(category)||!PRIORITIES.includes(priority))return json({error:'Complete the subject, category, priority and a detailed description (20+ characters).'},400);
  const db=await getDb();
  const openCount=await db.collection('supportTickets').countDocuments({ownerId:g.user._id,status:{$in:['open','in_progress','waiting_on_client']}});
  if(openCount>=12)return json({error:'You already have 12 open tickets. Please reply to an existing ticket.'},409);
  const now=new Date();const ticket={ownerId:g.user._id,customerName:g.user.name,customerEmail:g.user.email,subject,description,category,priority,status:'open',messages:[],createdAt:now,updatedAt:now};
  const result=await db.collection('supportTickets').insertOne(ticket);
  const id=String(result.insertedId);
  await audit(g.user,'create','supportTickets',{ticketId:id});
  await notifyStaff('New support ticket',`${g.user.name}: ${subject}`,'/admin?tab=tickets');
  await notify({userId:g.user._id,title:'Support ticket received',body:`Ticket #${id.slice(-8).toUpperCase()} — ${subject}`,link:'/support'});
  return json({ok:true,id,reference:'SUP-'+id.slice(-8).toUpperCase()},201);
}catch(e){if(['PAYLOAD_TOO_LARGE','INVALID_JSON'].includes(e.message))return json({error:'Invalid request'},400);return failure(e);}}
