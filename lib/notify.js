import {getDb} from '@/lib/db';
export async function notify({userId,title,body,link='',webhook=false,email=''}){
  try{
    const db=await getDb();
    if(userId){
      const {ObjectId}=await import('mongodb');
      const user=ObjectId.isValid(String(userId))?await db.collection('users').findOne({_id:new ObjectId(String(userId))},{projection:{notificationsEnabled:1}}):null;
      if(user?.notificationsEnabled!==false)await db.collection('notifications').insertOne({userId:String(userId),title,body,link,read:false,createdAt:new Date()});
    }
  }catch(e){console.error('[Notification]',e.message);}
  if(webhook&&process.env.DISCORD_WEBHOOK_URL){
    try{const u=new URL(process.env.DISCORD_WEBHOOK_URL);if(u.hostname==='discord.com'||u.hostname==='discordapp.com')await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:String(title).slice(0,256),description:String(body).slice(0,1000),color:9222911,footer:{text:'Creative Studio 5.0'}}]})});}catch(e){console.error('[Discord]',e.message);}
  }
  if(email&&process.env.RESEND_API_KEY&&process.env.NOTIFICATION_FROM){
    try{await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.NOTIFICATION_FROM,to:[email],subject:title,text:body})});}catch(e){console.error('[Email]',e.message);}
  }
}
export async function notifyStaff(title,body,link='/admin'){
  try{const db=await getDb();const staff=await db.collection('users').find({role:{$in:['admin','designer']},active:{$ne:false}},{projection:{_id:1}}).limit(100).toArray();
  if(staff.length)await db.collection('notifications').insertMany(staff.map(s=>({userId:String(s._id),title,body,link,read:false,createdAt:new Date()})));
  }catch(e){console.error('[Staff Notification]',e.message)}
}
