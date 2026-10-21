import {guard,json,failure} from '@/lib/api';import {getDb,serialize} from '@/lib/db';
export async function GET(req){try{
  const g=await guard(req,{staff:true});if(g.error)return g.error;
  const db=await getDb();const names=['projects','commissions','inquiries','users','assets','news','reviews'];
  const values=await Promise.all(names.map(n=>db.collection(n).countDocuments()));
  const recent=await db.collection('audit').find().sort({createdAt:-1}).limit(12).toArray();
  const pending=await db.collection('commissions').countDocuments({status:{$nin:['completed','cancelled']}});
  const visits=await db.collection('analytics').countDocuments({kind:'pageview',createdAt:{$gte:new Date(Date.now()-30*864e5)}});
  const popular=await db.collection('analytics').aggregate([{$match:{kind:{$in:['pageview','projectview']},createdAt:{$gte:new Date(Date.now()-30*864e5)}}},{$group:{_id:'$path',count:{$sum:1}}},{$sort:{count:-1}},{$limit:8}]).toArray();
  return json({stats:Object.fromEntries(names.map((n,i)=>[n,values[i]])),pending,visits,recent:serialize(recent),popular:serialize(popular)});
}catch(e){return failure(e);}}
