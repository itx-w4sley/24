import {MongoClient} from 'mongodb';import bcrypt from 'bcryptjs';import {loadEnvironment} from './env.mjs';import {demoProjects,initialServices,seedNews} from '../lib/projects.js';import {createInterface} from 'node:readline/promises';
loadEnvironment();
async function main(){
  if(!process.env.MONGODB_URI||process.env.MONGODB_URI.includes('YOUR_'))throw Error('Configure MONGODB_URI in .env.local first.');
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32||process.env.SESSION_SECRET.includes('GENERATE'))throw Error('Generate a strong SESSION_SECRET in .env.local first.');
  let email=process.env.ADMIN_EMAIL||'',password=process.env.ADMIN_PASSWORD||'';
  if(!email||!password){const rl=createInterface({input:process.stdin,output:process.stdout});if(!email)email=await rl.question('Administrator email: ');if(!password)password=await rl.question('Administrator password (input visible; ensure privacy): ');rl.close();}
  email=email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Please use a valid administrator email.');if(password.length<12)throw Error('Administrator password must be at least 12 characters.');
  const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});await client.connect();
  try{
    const db=client.db(process.env.MONGODB_DB||'creative_studio_5');
    const indexes=[['users',{email:1}],['projects',{slug:1}],['news',{slug:1}],['services',{slug:1}]];
    for(const [coll,idx] of indexes)await db.collection(coll).createIndex(idx,{unique:true});
    await db.collection('rateLimits').createIndex({expiresAt:1},{expireAfterSeconds:0});await db.collection('analytics').createIndex({createdAt:1},{expireAfterSeconds:7776000});
    await db.collection('commissions').createIndex({ownerId:1,createdAt:-1});await db.collection('messages').createIndex({commissionId:1,createdAt:1});
    for(const p of demoProjects){const {_id,...doc}=p;await db.collection('projects').updateOne({slug:p.slug},{$setOnInsert:{...doc,createdAt:new Date('2026-01-01'),updatedAt:new Date()}},{upsert:true});}
    for(const service of initialServices)await db.collection('services').updateOne({slug:service.slug},{$setOnInsert:{...service,status:'published',createdAt:new Date()}},{upsert:true});
    for(const news of seedNews){const {_id,...doc}=news;await db.collection('news').updateOne({slug:news.slug},{$setOnInsert:{...doc,createdAt:new Date(news.createdAt)}},{upsert:true});}
    await db.collection('settings').updateOne({_id:'public'},{$setOnInsert:{studioName:'24xzvibx Creative Studio',tagline:'Independent creative studio',about:'Design meets development. Built for people and communities.',availability:'Open for selected projects',heroSubtitle:'I create memorable visual identities, compelling digital experiences and considered design for brands, communities and ambitious ideas.',createdAt:new Date()}},{upsert:true});
    await db.collection('pageContent').updateOne({key:'home-note'},{$setOnInsert:{key:'home-note',title:'A new creative workspace',body:'Portfolio, commissions and client collaboration now live in one connected studio.',status:'draft',createdAt:new Date()}},{upsert:true});
    const existing=await db.collection('users').findOne({email});if(!existing){const passwordHash=await bcrypt.hash(password,12);await db.collection('users').insertOne({name:'Studio Administrator',email,role:'admin',passwordHash,active:true,createdAt:new Date(),updatedAt:new Date()});console.log('Created administrator account:',email);}else{console.log('Administrator email already exists. Existing password and role left unchanged:',email);}
    console.log('Seeded / checked 33 portfolio projects, 3 services, journal, and settings.');console.log('Setup complete. Run npm run dev and sign in at /login');
  }finally{await client.close();}
}
main().catch(e=>{console.error('Setup error:',e.message);process.exitCode=1});
