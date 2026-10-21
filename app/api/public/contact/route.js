import {json,readJson,rateLimit,cleanText,failure,sameOrigin} from '@/lib/api';import {getDb} from '@/lib/db';import {notify,notifyStaff} from '@/lib/notify';
export async function POST(req){try{
  if(!sameOrigin(req))return json({error:'Forbidden'},403);
  if(!await rateLimit(req,'contact',5,3600000))return json({error:'Too many enquiries. Try later.'},429);
  const v=await readJson(req,12000);
  if(v.website)return json({ok:true}); // honeypot
  const name=cleanText(v.name,120),email=cleanText(v.email,254).toLowerCase(),message=cleanText(v.message,4000);
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10)return json({error:'Enter a name, valid email and a message of at least 10 characters.'},400);
  const db=await getDb();await db.collection('inquiries').insertOne({name,email,message,kind:'contact',status:'new',createdAt:new Date()});
  await notifyStaff('New contact enquiry',`${name} sent a contact enquiry.`,'/admin');
  await notify({title:'New contact enquiry',body:`${name} (${email}) sent a contact enquiry.`,webhook:true});
  return json({ok:true,message:'Your message has been received.'},201);
}catch(e){if(e.message==='PAYLOAD_TOO_LARGE'||e.message==='INVALID_JSON')return json({error:'Invalid request'},400);return failure(e);}}
