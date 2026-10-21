import {authenticate,createToken,setAuthCookie} from '@/lib/auth';
import {rateLimit,readJson,json,failure,sameOrigin,audit} from '@/lib/api';
export async function POST(req){
  try{
    if(!sameOrigin(req))return json({error:'Origin not permitted'},403);
    if(!await rateLimit(req,'login',10,15*60000))return json({error:'Too many attempts. Try again later.'},429);
    const {email='',password=''}=await readJson(req,4000);
    if(typeof email!=='string'||typeof password!=='string')return json({error:'Invalid credentials'},400);
    const user=await authenticate(email,password);
    if(!user)return json({error:'Invalid credentials'},401);
    const token=await createToken(user);
    await audit(user,'login','users');
    return setAuthCookie(json({ok:true,user:{name:user.name,email:user.email,role:user.role}}),token);
  }catch(e){return failure(e);}
}
