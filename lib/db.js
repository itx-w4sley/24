import {MongoClient} from 'mongodb';
let connection;
const collections = ['users','projects','news','services','commissions','messages','reviews','inquiries','assets','notifications','audit','settings','pageContent','packages','activity','projectUpdates','analytics','rateLimits','supportTickets','sessions','quotes','deliveries','revisions','tasks'];
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
    db.collection('packages').createIndex({slug:1},{unique:true}),
    db.collection('projectUpdates').createIndex({commissionId:1,createdAt:-1}),
    db.collection('commissions').createIndex({ownerId:1,createdAt:-1}),
    db.collection('supportTickets').createIndex({ownerId:1,updatedAt:-1}),
    db.collection('supportTickets').createIndex({status:1,updatedAt:-1}),
    db.collection('messages').createIndex({commissionId:1,createdAt:1}),
    db.collection('notifications').createIndex({userId:1,createdAt:-1}),
    db.collection('audit').createIndex({createdAt:-1}),
    db.collection('sessions').createIndex({sid:1},{unique:true}),
    db.collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0}),
    db.collection('quotes').createIndex({ownerId:1,createdAt:-1}),
    db.collection('quotes').createIndex({assignedTo:1,createdAt:-1}),
    db.collection('deliveries').createIndex({ownerId:1,createdAt:-1}),
    db.collection('revisions').createIndex({ownerId:1,createdAt:-1}),
    db.collection('tasks').createIndex({assigneeId:1,updatedAt:-1}),
    db.collection('rateLimits').createIndex({expiresAt:1},{expireAfterSeconds:0}),
    db.collection('analytics').createIndex({createdAt:1},{expireAfterSeconds:7776000})
  ]);
  return db;
}
export {collections};
export function serialize(value){
  return JSON.parse(JSON.stringify(value,(key,v)=>v));
}
