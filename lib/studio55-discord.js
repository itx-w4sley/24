import {getDb} from '@/lib/db';
const types=['requests','support','quotes','updates'];
export async function sendStudioDiscord(kind,title,description){
 if(!types.includes(kind)||!process.env.DISCORD_WEBHOOK_URL)return false;
 const url=new URL(process.env.DISCORD_WEBHOOK_URL);
 if(url.protocol!=='https:'||!['discord.com','discordapp.com'].includes(url.hostname)||!url.pathname.startsWith('/api/webhooks/'))return false;
 try{
  const db=await getDb();const config=await db.collection('settings').findOne({key:'studio55-integrations'});
  if(config?.preferences?.[kind]===false)return false;
  const result=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:String(title).slice(0,180),description:String(description).slice(0,900),color:8364799,footer:{text:'Creative Studio 5.5'}}]}),signal:AbortSignal.timeout(5000)});
  return result.ok;
 }catch(e){console.error('[Studio Discord]',e.message);return false;}
}
