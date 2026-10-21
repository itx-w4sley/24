import {BASE_SITE} from '@/lib/site';import {dbConfigured,getDb} from '@/lib/db';
export async function getPublicSettings(){if(!dbConfigured())return BASE_SITE;try{const db=await getDb();const settings=await db.collection('settings').findOne({_id:'public'});return {...BASE_SITE,...(settings||{})}}catch{return BASE_SITE}}
