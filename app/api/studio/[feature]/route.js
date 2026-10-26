import {guard,json,readJson,safeId,audit,failure,rateLimit} from '@/lib/api';
import {getDb,serialize} from '@/lib/db';
import {FEATURES,staff,admin,commission,commissions,requiredText,clean,urlInput,errorResponse,now} from '@/lib/studio55';
import {notify,notifyStaff} from '@/lib/notify';
import {ObjectId} from 'mongodb';
import bcrypt from 'bcryptjs';
import {clearAuthCookie} from '@/lib/auth';
import {sendStudioDiscord} from '@/lib/studio55-discord';

function bad(message,status=400){return json({error:message},status)}
const oid=id=>safeId(String(id||''));
async function authorized(req,feature){if(!FEATURES.includes(feature))return {error:bad('Not found',404)};const g=await guard(req);if(g.error)return g; if(['audit','integrations','analytics'].includes(feature)&&!admin(g.user))return {error:bad('Administrator only',403)};if(feature==='tasks'&&!staff(g.user))return {error:bad('Staff only',403)};return g}
function taskView(user){return admin(user)?{}:{$or:[{assigneeId:user._id},{createdBy:user._id}]}}
function qView(user){return admin(user)?{}:user.role==='designer'?{assignedTo:user._id}:{ownerId:user._id}}
const pageSize=70;
export async function GET(req,{params}){try{
 const {feature}=await params;const g=await authorized(req,feature);if(g.error)return g.error;const db=await getDb(),user=g.user;
 if(feature==='account'){
  const doc=await db.collection('users').findOne({_id:oid(user._id)},{projection:{passwordHash:0}});
  const sessions=await db.collection('sessions').find({userId:user._id,expiresAt:{$gt:now()},revoked:{$ne:true}},{projection:{sid:0}}).sort({createdAt:-1}).limit(30).toArray();
  return json({profile:{name:doc.name,email:doc.email,avatar:doc.avatar||'',discordUsername:doc.discordUsername||'',notificationsEnabled:doc.notificationsEnabled!==false,role:doc.role},sessions:serialize(sessions)});
 }
 if(feature==='notifications')return json({items:serialize(await db.collection('notifications').find({userId:user._id}).sort({createdAt:-1}).limit(100).toArray())});
 if(feature==='quotes')return json({items:serialize(await db.collection('quotes').find(qView(user)).sort({createdAt:-1}).limit(pageSize).toArray()),commissions:serialize(await commissions(db,user))});
 if(feature==='deliveries')return json({items:serialize(await db.collection('deliveries').find(qView(user),{projection:{url:0}}).sort({createdAt:-1}).limit(pageSize).toArray()),commissions:serialize(await commissions(db,user))});
 if(feature==='messages'){
  const id=new URL(req.url).searchParams.get('commissionId');const available=await commissions(db,user);
  if(!id)return json({items:[],commissions:serialize(available)});
  if(!await commission(db,id,user))return bad('Project not accessible',403);
  return json({items:serialize(await db.collection('messages').find({commissionId:id}).sort({createdAt:1}).limit(200).toArray()),commissions:serialize(available)});
 }
 if(feature==='revisions')return json({items:serialize(await db.collection('revisions').find(qView(user)).sort({createdAt:-1}).limit(pageSize).toArray()),commissions:serialize(await commissions(db,user))});
 if(feature==='tasks')return json({items:serialize(await db.collection('tasks').find(taskView(user)).sort({updatedAt:-1}).limit(150).toArray()),team:serialize(await db.collection('users').find({role:{$in:['admin','designer']},active:{$ne:false}},{projection:{_id:1,name:1,role:1}}).limit(100).toArray())});
 if(feature==='audit'){
  const action=clean(new URL(req.url).searchParams.get('action'),60);const match=action?{action}:{};
  return json({items:serialize(await db.collection('audit').find(match,{projection:{actorId:1,actor:1,action:1,resource:1,detail:1,createdAt:1}}).sort({createdAt:-1}).limit(120).toArray())});
 }
 if(feature==='integrations'){
  const settings=await db.collection('settings').findOne({key:'studio55-integrations'});
  return json({configured:!!process.env.DISCORD_WEBHOOK_URL,preferences:settings?.preferences||{requests:true,support:true,quotes:true,updates:true},webhook:'The Discord webhook URL is stored in Vercel environment variables, not in the browser.'});
 }
 if(feature==='analytics'){
  const since=new Date(Date.now()-30*86400000);
  const [commissionsCount,projectsCount,ticketsCount,openTickets,requests,quoteStats,topServices,taskStats,activity]=await Promise.all([
   db.collection('commissions').countDocuments(),db.collection('projects').countDocuments(),db.collection('supportTickets').countDocuments(),db.collection('supportTickets').countDocuments({status:{$nin:['resolved','closed']}}),db.collection('commissions').countDocuments({createdAt:{$gte:since}}),
   db.collection('quotes').aggregate([{$match:{currency:'ROBUX'}},{$group:{_id:'$status',count:{$sum:1},total:{$sum:'$amount'}}}]).toArray(),
   db.collection('commissions').aggregate([{$match:{createdAt:{$gte:since}}},{$group:{_id:'$type',count:{$sum:1}}},{$sort:{count:-1}},{$limit:8}]).toArray(),
   db.collection('tasks').aggregate([{$group:{_id:'$status',count:{$sum:1}}}]).toArray(),
   db.collection('audit').find({createdAt:{$gte:since}},{projection:{action:1,resource:1,createdAt:1}}).sort({createdAt:-1}).limit(12).toArray()]);
  return json({stats:{commissions:commissionsCount,projects:projectsCount,tickets:ticketsCount,openTickets,requests30d:requests},quoteStats:serialize(quoteStats),topServices:serialize(topServices),taskStats:serialize(taskStats),activity:serialize(activity)});
 }
 return bad('Not found',404);
}catch(e){return errorResponse(e,json,failure)}}

export async function POST(req,{params}){try{
 const {feature}=await params;const g=await authorized(req,feature);if(g.error)return g.error;const user=g.user;
 if(['account','notifications','audit','analytics'].includes(feature))return bad('Unsupported operation',405);
 if(!await rateLimit(req,'studio55-'+feature,35,600000))return bad('Too many requests. Try again later.',429);
 const b=await readJson(req,16000),db=await getDb(),time=now();
 if(feature==='quotes'){
  if(!staff(user))return bad('Only staff can issue quotes',403);
  const c=await commission(db,b.commissionId,user);if(!c)return bad('Project not accessible',403);
  if(!c.ownerId)return bad('Link this commission to a verified client account first',409);
  const amount=Number(b.amount);if(!Number.isSafeInteger(amount)||amount<=0||amount>10000000)return bad('Enter a valid quote amount in Robux',400);
  const title=requiredText(b.title||c.title,3,150),scope=requiredText(b.scope,10,3500);
  const doc={commissionId:String(c._id),ownerId:String(c.ownerId),assignedTo:String(c.assignedTo||user._id),title,scope,amount,currency:'ROBUX',status:'sent',expiresAt:b.expiresAt?new Date(b.expiresAt):null,createdBy:user._id,createdAt:time,updatedAt:time,events:[{action:'sent',by:user._id,at:time}]};
  if(doc.expiresAt&&(!Number.isFinite(doc.expiresAt.getTime())||doc.expiresAt<=time))return bad('Expiration must be a future date',400);
  const r=await db.collection('quotes').insertOne(doc);await audit(user,'quote_created','quotes',{id:String(r.insertedId),commissionId:doc.commissionId});
  await notify({userId:doc.ownerId,title:'New Robux quote',body:`${title} — R$ ${amount.toLocaleString('en-US')}`,link:'/portal/quotes'});
  await sendStudioDiscord('quotes','Robux quote sent',`${title} — R$ ${amount.toLocaleString('en-US')}`);
  return json({ok:true,id:String(r.insertedId)},201);
 }
 if(feature==='deliveries'){
  if(!staff(user))return bad('Staff only',403);
  const c=await commission(db,b.commissionId,user);if(!c)return bad('Project not accessible',403);
  if(!c.ownerId)return bad('Link a verified client account to this commission before delivery',409);
  const title=requiredText(b.title,3,160),url=urlInput(b.url);
  if(!url)return bad('Use an HTTPS download URL',400);
  const doc={commissionId:String(c._id),ownerId:String(c.ownerId),assignedTo:String(c.assignedTo||user._id),title,url,version:clean(b.version,40)||'1.0',notes:clean(b.notes,1200),downloadCount:0,createdAt:time,createdBy:user._id};
  const r=await db.collection('deliveries').insertOne(doc);await audit(user,'delivery_created','deliveries',{id:String(r.insertedId),commissionId:doc.commissionId});
  await notify({userId:doc.ownerId,title:'A project file is ready',body:title,link:'/portal/deliveries'});
  await sendStudioDiscord('updates','New file delivery',title);
  return json({ok:true,id:String(r.insertedId)},201);
 }
 if(feature==='messages'){
  const c=await commission(db,b.commissionId,user);if(!c)return bad('Project not accessible',403);
  const body=requiredText(b.body,1,4000),doc={commissionId:String(c._id),body,senderId:user._id,senderName:user.name,role:user.role,createdAt:time};
  await db.collection('messages').insertOne(doc);await audit(user,'message','commissions',{commissionId:doc.commissionId});
  const recipient=staff(user)?c.ownerId:c.assignedTo;
  if(recipient&&String(recipient)!==user._id)await notify({userId:String(recipient),title:'New project message',body:`${user.name} sent a project message`,link:'/portal/messages'});
  if(!staff(user))await notifyStaff('Client project message',`${user.name} wrote about ${c.title}`,'/admin?tab=messages');
  return json({ok:true},201);
 }
 if(feature==='revisions'){
  if(staff(user))return bad('Revision requests must be submitted by the client',403);
  const c=await commission(db,b.commissionId,user,{requireOwner:true});if(!c)return bad('Only a verified project owner can request changes',403);
  const details=requiredText(b.details,10,3000),item=requiredText(b.deliverable,2,150);
  const doc={commissionId:String(c._id),ownerId:user._id,assignedTo:String(c.assignedTo||''),deliverable:item,details,status:'requested',createdAt:time,updatedAt:time,history:[{status:'requested',at:time,by:user._id}]};
  const r=await db.collection('revisions').insertOne(doc);await audit(user,'revision_requested','revisions',{id:String(r.insertedId)});await notifyStaff('Revision requested',`${user.name} requested changes to ${c.title}`,'/admin?tab=revisions');
  await sendStudioDiscord('updates','Revision requested',`${user.name} requested changes to ${c.title}`);
  return json({ok:true,id:String(r.insertedId)},201);
 }
 if(feature==='tasks'){
  if(!staff(user))return bad('Staff only',403);
  const title=requiredText(b.title,3,160),description=clean(b.description,2000),assigneeId=String(b.assigneeId||user._id);
  if(!ObjectId.isValid(assigneeId))return bad('Choose a valid team member',400);
  const assigned=await db.collection('users').findOne({_id:oid(assigneeId),role:{$in:['admin','designer']},active:{$ne:false}});
  if(!assigned)return bad('Team member not found',400);
  if(user.role!=='admin'&&assigneeId!==user._id)return bad('Only admins can assign tasks to other people',403);
  const doc={title,description,assigneeId,createdBy:user._id,status:'todo',priority:['low','normal','high'].includes(b.priority)?b.priority:'normal',dueDate:b.dueDate?new Date(b.dueDate):null,createdAt:time,updatedAt:time};
  if(doc.dueDate&&!Number.isFinite(doc.dueDate.getTime()))return bad('Invalid date',400);
  const r=await db.collection('tasks').insertOne(doc);await audit(user,'task_created','tasks',{id:String(r.insertedId)});
  if(assigneeId!==user._id)await notify({userId:assigneeId,title:'New staff task',body:title,link:'/admin?tab=tasks'});
  return json({ok:true,id:String(r.insertedId)},201);
 }
 if(feature==='integrations'){
  if(!admin(user))return bad('Admin only',403);
  if(b.action!=='test')return bad('Unsupported integration command',400);
  if(!process.env.DISCORD_WEBHOOK_URL)return bad('Set DISCORD_WEBHOOK_URL in Vercel first',503);
  const url=new URL(process.env.DISCORD_WEBHOOK_URL);
  if(url.protocol!=='https:'||!['discord.com','discordapp.com'].includes(url.hostname)||!url.pathname.startsWith('/api/webhooks/'))return bad('Webhook is not a valid Discord webhook',400);
  const resp=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'Studio integration test',description:'Creative Studio 5.5 Discord integration is connected.',color:7057919}]}),signal:AbortSignal.timeout(7000)});
  if(!resp.ok)return bad('Discord returned a webhook error; verify the environment variable',502);
  await audit(user,'webhook_test','integrations');return json({ok:true});
 }
 return bad('Unsupported operation',405);
}catch(e){return errorResponse(e,json,failure)}}

export async function PATCH(req,{params}){try{
 const {feature}=await params;const g=await authorized(req,feature);if(g.error)return g.error;
 if(!['account','notifications','quotes','revisions','tasks','integrations'].includes(feature))return bad('Unsupported operation',405);
 const b=await readJson(req,10000),db=await getDb(),user=g.user,time=now();
 if(feature==='account'){
  if(b.action==='signout_all'){
    if(!await rateLimit(req,'studio55-revoke-all:'+user._id,5,15*60000))return bad('Too many attempts. Try again later.',429);
    const doc=await db.collection('users').findOne({_id:oid(user._id)});
    if(!await bcrypt.compare(String(b.currentPassword||''),doc?.passwordHash||''))return bad('Current password is incorrect',403);
    await db.collection('users').updateOne({_id:oid(user._id)},{$inc:{sessionVersion:1}});
    await db.collection('sessions').updateMany({userId:user._id},{$set:{revoked:true}});
    await audit(user,'signout_all','users');return clearAuthCookie(json({ok:true}));
  }
  if(b.action==='revoke_session'){
    const sid=String(b.id||'');if(!ObjectId.isValid(sid))return bad('Invalid session',400);
    const result=await db.collection('sessions').updateOne({_id:oid(sid),userId:user._id},{$set:{revoked:true}});
    if(!result.matchedCount)return bad('Session not found',404);
    await audit(user,'revoke_session','users');return json({ok:true});
  }
  const update={};if(b.name!==undefined)update.name=requiredText(b.name,2,120);
  if(b.discordUsername!==undefined)update.discordUsername=clean(b.discordUsername,80);
  if(b.avatar!==undefined)update.avatar=b.avatar?urlInput(b.avatar):'';
  if(b.notificationsEnabled!==undefined)update.notificationsEnabled=b.notificationsEnabled===true;
  if(!Object.keys(update).length)return bad('No profile changes',400);
  update.updatedAt=time;await db.collection('users').updateOne({_id:oid(user._id)},{$set:update});await audit(user,'profile_updated','users',{fields:Object.keys(update).filter(x=>x!=='updatedAt')});return json({ok:true});
 }
 if(feature==='notifications'){
  const match={userId:user._id};if(b.id)match._id=oid(b.id);
  await db.collection('notifications').updateMany(match,{$set:{read:b.read!==false}});return json({ok:true});
 }
 if(feature==='quotes'){
  const id=oid(b.id),quote=await db.collection('quotes').findOne({_id:id});if(!quote)return bad('Quote not found',404);
  const permitted=staff(user)?(user.role==='admin'||quote.assignedTo===user._id):quote.ownerId===user._id;
  if(!permitted)return bad('Access denied',403);
  const action=String(b.action||'');let next;
  if(!staff(user)){
   if(!['accepted','declined','changes_requested'].includes(action))return bad('Invalid client action',400);
   if(quote.status!=='sent')return bad('Quote already processed',409);
   if(quote.expiresAt&&new Date(quote.expiresAt)<time)return bad('This quote has expired',409);
   next=action;
  }else{
   if(action!=='voided')return bad('Staff may void a quote; create a new quote for revised pricing',400);
   if(!['sent','changes_requested'].includes(quote.status))return bad('Quote cannot be voided',409);next='voided';
  }
  const note=clean(b.note,800);
  if(next==='changes_requested'&&note.length<5)return bad('Describe the requested changes',400);
  const res=await db.collection('quotes').updateOne({_id:id,status:quote.status},{$set:{status:next,updatedAt:time},$push:{events:{action:next,by:user._id,at:time,note}}});
  if(!res.modifiedCount)return bad('Quote changed; please refresh',409);
  await audit(user,'quote_'+next,'quotes',{id:String(id)});
  if(staff(user))await notify({userId:quote.ownerId,title:'Quote updated',body:quote.title,link:'/portal/quotes'});else await notifyStaff('Quote '+next,`${user.name}: ${quote.title}`,'/admin?tab=quotes');
  return json({ok:true});
 }
 if(feature==='revisions'){
  if(!staff(user))return bad('Staff only',403);
  const id=oid(b.id),item=await db.collection('revisions').findOne({_id:id});if(!item)return bad('Not found',404);
  if(user.role!=='admin'&&item.assignedTo!==user._id)return bad('Not assigned to this commission',403);
  const status=String(b.status||'');if(!['reviewing','in_progress','completed','declined'].includes(status))return bad('Invalid revision status',400);
  const update=await db.collection('revisions').updateOne({_id:id},{$set:{status,updatedAt:time},$push:{history:{status,at:time,by:user._id,note:clean(b.note,300)}}});
  if(!update.matchedCount)return bad('Not found',404);
  await audit(user,'revision_'+status,'revisions',{id:String(id)});await notify({userId:item.ownerId,title:'Revision status updated',body:`${item.deliverable} — ${status}`,link:'/portal/revisions'});return json({ok:true});
 }
 if(feature==='tasks'){
  const id=oid(b.id),item=await db.collection('tasks').findOne({_id:id});if(!item)return bad('Task not found',404);
  if(!admin(user)&&item.assigneeId!==user._id&&item.createdBy!==user._id)return bad('Not your task',403);
  const update={updatedAt:time};if(b.status!==undefined){if(!['todo','in_progress','blocked','done'].includes(b.status))return bad('Invalid status',400);update.status=b.status;}
  if(b.priority!==undefined&&admin(user)){if(!['low','normal','high'].includes(b.priority))return bad('Invalid priority',400);update.priority=b.priority;}
  if(b.title!==undefined&&admin(user))update.title=requiredText(b.title,3,160);
  if(b.assigneeId!==undefined&&admin(user)){
    if(!ObjectId.isValid(String(b.assigneeId)))return bad('Invalid assignee',400);
    const emp=await db.collection('users').findOne({_id:oid(b.assigneeId),role:{$in:['admin','designer']},active:{$ne:false}});if(!emp)return bad('Assignee must be an active staff member',400);
    update.assigneeId=String(b.assigneeId);
  }
  await db.collection('tasks').updateOne({_id:id},{$set:update});await audit(user,'task_updated','tasks',{id:String(id),fields:Object.keys(update)});return json({ok:true});
 }
 if(feature==='integrations'){
  if(!admin(user))return bad('Admin only',403);
  const preferences={};for(const key of ['requests','support','quotes','updates'])preferences[key]=b.preferences?.[key]!==false;
  await db.collection('settings').updateOne({key:'studio55-integrations'},{$set:{preferences,updatedAt:time}},{upsert:true});await audit(user,'integration_preferences','settings');return json({ok:true});
 }
 return bad('Unsupported operation',405);
}catch(e){return errorResponse(e,json,failure)}}
