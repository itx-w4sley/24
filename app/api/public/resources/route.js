import {publicItems} from '@/lib/content';import {json} from '@/lib/api';
export async function GET(){const [pages,assets]=await Promise.all([publicItems('pageContent'),publicItems('assets')]);return json({pages,assets:assets.filter(x=>x.category==='Public downloads')});}
