import {clearAuthCookie} from '@/lib/auth';
import {json,sameOrigin} from '@/lib/api';
export async function POST(req){if(!sameOrigin(req))return json({error:'Forbidden'},403);return clearAuthCookie(json({ok:true}));}
