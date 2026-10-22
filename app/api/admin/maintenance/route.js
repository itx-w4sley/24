import {json,guard,readJson,audit,rateLimit} from '@/lib/api';
import {authenticate} from '@/lib/auth';

export const runtime='nodejs';
export const dynamic='force-dynamic';

function callerIp(req){
  return (req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'').split(',')[0].trim();
}
function onTrustedNetwork(req){
  const ip=callerIp(req);
  const allowed=(process.env.STUDIO_MAINTENANCE_ADMIN_IPS||'').split(',').map(s=>s.trim()).filter(Boolean);
  return ip!==''&&allowed.includes(ip);
}
function vercelConfig(){
  const {VERCEL_API_TOKEN:token,VERCEL_PROJECT_ID:project,VERCEL_TEAM_ID:team,VERCEL_DEPLOY_HOOK_URL:hook}=process.env;
  if(!token||!project||!hook)return null;
  return {token,project,team,hook};
}
function apiUrl(config,path){
  const u=new URL('https://api.vercel.com'+path);
  if(config.team)u.searchParams.set('teamId',config.team);
  return u.toString();
}
async function vercelCall(config,path,method='GET',body){
  const response=await fetch(apiUrl(config,path),{
    method,
    headers:{Authorization:`Bearer ${config.token}`,...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),
    cache:'no-store',signal:AbortSignal.timeout(15000)
  });
  if(!response.ok){
    // Don't return Vercel's response body; it could contain confidential data.
    throw new Error(`Vercel configuration request failed (${response.status})`);
  }
  return response.json();
}
function errorText(error){return error instanceof Error ? error.message : 'Could not update maintenance settings';}

export async function GET(req){
  const g=await guard(req);
  if(g.error)return g.error;
  if(g.user.role!=='admin'||!onTrustedNetwork(req))return json({error:'Not authorised for maintenance control'},403);
  return json({
    deployedMaintenance:process.env.STUDIO_MAINTENANCE_MODE==='1',
    controlsConfigured:!!vercelConfig(),
    message:'Environment-variable changes require a new deployment before the live site changes.'
  });
}

export async function POST(req){
  const origin=req.headers.get('origin');
  // No cross-site posts and no request without an explicit browser Origin.
  if(!origin||origin!==new URL(req.url).origin)return json({error:'Origin not permitted'},403);
  const g=await guard(req);
  if(g.error)return g.error;
  if(g.user.role!=='admin'||!onTrustedNetwork(req))return json({error:'Not authorised for maintenance control'},403);
  let payload;
  try{payload=await readJson(req,3000);}catch{return json({error:'Invalid request'},400);}
  const target=payload?.mode;
  if(!['enable','disable'].includes(target))return json({error:'Choose enable or disable'},400);
  if(payload?.confirm!==(target==='enable'?'ENABLE':'DISABLE'))return json({error:'Type the confirmation word'},400);
  if(typeof payload.password!=='string'||payload.password.length>128||payload.password.length<1)return json({error:'Enter your account password'},400);
  try{
    if(!await rateLimit(req,'maintenance-admin-toggle',5,15*60000))return json({error:'Too many attempts. Try again later.'},429);
    const verified=await authenticate(g.user.email,payload.password);
    if(!verified||String(verified._id)!==g.user._id)return json({error:'Password verification failed'},403);
    const config=vercelConfig();
    if(!config)return json({error:'Configure VERCEL_API_TOKEN, VERCEL_PROJECT_ID and VERCEL_DEPLOY_HOOK_URL first'},503);

    const id=encodeURIComponent(config.project);
    const envList=await vercelCall(config,`/v9/projects/${id}/env`);
    const env=(envList.envs||[]).find(v=>v.key==='STUDIO_MAINTENANCE_MODE' && (v.target||[]).includes('production'));
    if(!env?.id)return json({error:'Could not find the Production STUDIO_MAINTENANCE_MODE variable in Vercel'},404);
    const newValue=target==='enable'?'1':'0';
    await vercelCall(config,`/v9/projects/${id}/env/${encodeURIComponent(env.id)}`,'PATCH',{value:newValue});
    // This is a secret URL: never send it to the browser or log it.
    const hookUrl=new URL(config.hook);
    if(hookUrl.protocol!=='https:'||hookUrl.hostname!=='api.vercel.com'){
      return json({error:'The variable was updated, but VERCEL_DEPLOY_HOOK_URL is not a valid Vercel Deploy Hook. Redeploy manually.',environmentUpdated:true},502);
    }
    let deploymentQueued=false;
    try{
      const hookResp=await fetch(hookUrl.toString(),{method:'POST',cache:'no-store',signal:AbortSignal.timeout(15000)});
      deploymentQueued=hookResp.ok;
    }catch{}
    await audit(g.user,target==='enable'?'maintenance_enable_requested':'maintenance_disable_requested','maintenance',{deploymentQueued});
    if(!deploymentQueued)return json({error:'Environment variable updated, but automatic deployment could not be queued. Redeploy Production manually in Vercel.',environmentUpdated:true},502);
    return json({ok:true,queued:true,targetMode:target,
      message:'Vercel environment variable updated and a new deployment has been queued. The live maintenance state changes only when that deployment succeeds.'});
  }catch(e){
    return json({error:errorText(e)},502);
  }
}
