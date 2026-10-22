// Safe to run on an existing database: creates indexes only and does not seed or modify records.
import {MongoClient} from 'mongodb';
import {loadEnvironment} from './env.mjs';
loadEnvironment();
if(!process.env.MONGODB_URI||process.env.MONGODB_URI.includes('YOUR_')){
 console.error('Configure MONGODB_URI in .env.local first.');process.exit(1);
}
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();
 const c=client.db(process.env.MONGODB_DB||'creative_studio_5').collection('supportTickets');
 await c.createIndex({ownerId:1,updatedAt:-1});
 await c.createIndex({status:1,updatedAt:-1});
 console.log('Support ticket indexes are ready. Existing records were not changed.');
}catch(e){console.error('Could not create support indexes:',e.message);process.exitCode=1}finally{await client.close()}
