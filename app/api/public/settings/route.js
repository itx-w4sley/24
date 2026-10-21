import {getPublicSettings} from '@/lib/site-server';import {json} from '@/lib/api';
export async function GET(){return json({values:await getPublicSettings()});}
