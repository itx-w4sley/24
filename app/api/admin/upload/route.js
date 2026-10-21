import {guard,json,failure,audit} from '@/lib/api';import {getDb} from '@/lib/db';
import {v2 as cloudinary} from 'cloudinary';
export const runtime='nodejs';
const formats={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','application/pdf':'pdf'};
export async function POST(req){try{
  const g=await guard(req,{resource:'assets',action:'create'});if(g.error)return g.error;
  const {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET}=process.env;
  if(!CLOUDINARY_CLOUD_NAME||!CLOUDINARY_API_KEY||!CLOUDINARY_API_SECRET)return json({error:'File uploads require Cloudinary configuration. You can still add an external asset URL.'},503);
  const data=await req.formData();const file=data.get('file');
  if(!file||typeof file==='string')return json({error:'Select a file'},400);
  if(!formats[file.type]||file.size>10*1024*1024)return json({error:'Supported formats: PNG, JPG, WebP, GIF or PDF, maximum 10 MB.'},400);
  cloudinary.config({cloud_name:CLOUDINARY_CLOUD_NAME,api_key:CLOUDINARY_API_KEY,api_secret:CLOUDINARY_API_SECRET});
  const bytes=Buffer.from(await file.arrayBuffer());
  const uploaded=await new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({folder:'24xzvibx-studio',resource_type:'auto',overwrite:false},(err,result)=>err?reject(err):resolve(result));stream.end(bytes);
  });
  const db=await getDb();const doc={name:String(file.name).slice(0,150),url:uploaded.secure_url,publicId:uploaded.public_id,type:file.type,size:file.size,category:'Uploads',status:'published',createdAt:new Date(),createdBy:g.user._id};
  const result=await db.collection('assets').insertOne(doc);await audit(g.user,'upload','assets',{id:String(result.insertedId)});
  return json({ok:true,item:{...doc,_id:String(result.insertedId)}});
}catch(e){return failure(e);}}
