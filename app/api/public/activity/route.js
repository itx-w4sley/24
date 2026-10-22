import {publicItems} from '@/lib/content';import {json} from '@/lib/api';export async function GET(){return json({items:await publicItems('activity')});}
