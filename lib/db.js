import {MongoClient} from 'mongodb';
let connection;
const collections = ['users','projects','news','services','commissions','messages','reviews','inquiries','assets','notifications','audit','settings','pageContent','analytics','rateLimits'];
export function dbConfigured(){return !!process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('YOUR_');}
export async function getDb(){
  if (!dbConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');
  if(!connection){
    const client=new MongoClient(process.env.MONGODB_URI,{maxPoolSize:8,serverSelectionTimeoutMS:7000});
    connection=client.connect().then(c=>c.db(process.env.MONGODB_DB||'creative_studio_5')).catch(err=>{connection=undefined;throw err;});
  }
  return connection;
}
export async function initIndexes(){
  const db=await getDb();
  await Promise.all([
    db.collection('users').createIndex({email:1},{unique:true}),
    db.collection('projects').createIndex({slug:1},{unique:true}),
    db.collection('news').createIndex({slug:1},{unique:true}),
    db.collection('services').createIndex({slug:1},{unique:true}),
    db.collection('commissions').createIndex({ownerId:1,createdAt:-1}),
    db.collection('messages').createIndex({commissionId:1,createdAt:1}),
    db.collection('notifications').createIndex({userId:1,createdAt:-1}),
    db.collection('audit').createIndex({createdAt:-1}),
    db.collection('rateLimits').createIndex({expiresAt:1},{expireAfterSeconds:0}),
    db.collection('analytics').createIndex({createdAt:1},{expireAfterSeconds:7776000})
  ]);
  return db;
}
export {collections};
export function serialize(value){
  return JSON.parse(JSON.stringify(value,(key,v)=>v));
}
