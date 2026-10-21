import {currentUser} from '@/lib/auth';
import {json} from '@/lib/api';
export async function GET(req){return json({user:await currentUser(req)});}
