import {json,readJson,rateLimit,cleanText,failure,sameOrigin} from '@/lib/api';import {getDb} from '@/lib/db';import {notify,notifyStaff} from '@/lib/notify';import {currentUser} from '@/lib/auth';
import {sendStudioDiscord} from '@/lib/studio55-discord';
export async function POST(req){try{
  if(!sameOrigin(req))return json({error:'Forbidden'},403);
  if(!await rateLimit(req,'commission',5,3600000))return json({error:'Too many requests. Try later.'},429);
  const v=await readJson(req,15000);if(v.website)return json({ok:true});
  const name=cleanText(v.name,120),email=cleanText(v.email,254).toLowerCase(),title=cleanText(v.title,180),description=cleanText(v.description,6000),type=cleanText(v.type,80);
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||title.length<3||description.length<12)return json({error:'Please complete your name, email, project title and description.'},400);
  const db=await getDb();const user=await currentUser(req);
  const existingUser=user&&user.email===email?user:null; // Do not link guest requests to an unverified email address.
  // Structured wizard metadata. The human-readable description remains available to older admin views.
  const raw=v.requestDetails&&typeof v.requestDetails==='object'&&!Array.isArray(v.requestDetails)?v.requestDetails:{};
  const detailKeys=['stage','audience','platform','complexity','otherFeatures','deliverables','references','timeline','maintenance','contactPreference','discord','organisation'];
  const requestDetails={};
  for(const key of detailKeys){if(raw[key]!=null)requestDetails[key]=cleanText(raw[key],key==='otherFeatures'?600:key==='references'||key==='deliverables'?450:key==='platform'?300:120);}
  if(Array.isArray(raw.features))requestDetails.features=raw.features.slice(0,12).map(x=>cleanText(x,100)).filter(Boolean);
  const doc={name,email,title,description,type,requestDetails,budget:cleanText(v.budget,80),deadline:cleanText(v.deadline,30),ownerId:existingUser?String(existingUser._id):null,status:'new',priority:'normal',price:0,currency:'ROBUX',progress:0,createdAt:new Date(),updatedAt:new Date()};
  const created=await db.collection('commissions').insertOne(doc);
  await notify({userId:existingUser?._id,title:'Commission received',body:`Your request “${title}” has been submitted.`,link:'/portal'});
  await notifyStaff('New commission',`${name} requested ${title}.`,'/admin');
  await sendStudioDiscord('requests','New commission',`${name} requested ${title} (${type}).`);
  return json({ok:true,id:String(created.insertedId),message:'Your commission request has been received.'},201);
}catch(e){if(['INVALID_JSON','PAYLOAD_TOO_LARGE'].includes(e.message))return json({error:'Invalid request'},400);return failure(e);}}
