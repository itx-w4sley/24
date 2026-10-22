'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,ShieldX,LockKeyhole,DatabaseZap,KeyRound,Construction,WifiOff,TimerReset,ServerCrash,RefreshCw,Home,Headset,FolderKanban,RotateCw,Signal,AlertTriangle} from 'lucide-react';
import styles from './recovery.module.css';

const MODES={
  unauthorized:{code:'401',eyebrow:'IDENTITY REQUIRED',title:'Your workspace is protected.',description:'Sign in to access this part of Creative Studio. Your private projects and messages stay available only to the right account.',tag:'Sign-in required',Icon:LockKeyhole,action:'Sign in',href:'/login'},
  forbidden:{code:'403',eyebrow:'ACCESS CONTROL',title:'This area is restricted.',description:'Your account does not have permission to open this page. If your role should have access, contact a studio administrator.',tag:'Access denied',Icon:ShieldX,action:'Go to client portal',href:'/portal'},
  critical:{code:'500',eyebrow:'RECOVERY CONSOLE',title:'The studio hit a snag.',description:'A system error stopped this part of the website from loading. You can retry or return to a working page. No new request or payment is implied.',tag:'System error',Icon:ServerCrash,action:'Back to studio',href:'/'},
  database:{code:'503',eyebrow:'DATABASE CONNECTIVITY',title:'Our data is temporarily unavailable.',description:'The studio could not retrieve or save information right now. Please do not repeatedly submit forms until you have checked whether your request was received.',tag:'Service unavailable',Icon:DatabaseZap,action:'Open studio',href:'/'},
  session:{code:'401',eyebrow:'SESSION SECURITY',title:'Your session has ended.',description:'For your privacy, you need to sign in again before continuing. Your account information remains protected.',tag:'Sign in again',Icon:KeyRound,action:'Sign in again',href:'/login'},
  maintenance:{code:'503',eyebrow:'STUDIO MAINTENANCE',title:'A little behind-the-scenes work.',description:'The studio may be temporarily unavailable while changes are applied. We have not published an estimated return time.',tag:'Maintenance mode',Icon:Construction,action:'Studio homepage',href:'/'},
  offline:{code:'OFFLINE',eyebrow:'CONNECTION LOST',title:'Looks like you went offline.',description:'We could not establish a connection. Check Wi-Fi or mobile data, then try the page again. Unsaved form information may be lost if you reload.',tag:'Connection issue',Icon:WifiOff,action:'Studio homepage',href:'/'},
  rate:{code:'429',eyebrow:'REQUEST LIMIT',title:'Too many requests at once.',description:'To protect the studio, requests are temporarily limited. Please wait before trying again. The exact retry time depends on the action.',tag:'Slow down',Icon:TimerReset,action:'Back to studio',href:'/'},
};
const DESTINATIONS=[['/portfolio','Portfolio',FolderKanban],['/start','Start a project',ArrowUpRight],['/support','Support centre',Headset]];
function safeInternal(value){return typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')&&!/[\r\n]/.test(value)?value:null;}
export default function RecoveryPage({mode='critical',next='',reset=null,section='',reference=''}){
  const c=MODES[mode]||MODES.critical;const Icon=c.Icon;
  const [online,setOnline]=useState(null);const [checking,setChecking]=useState(false);
  useEffect(()=>{const update=()=>setOnline(navigator.onLine);update();window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update)};},[]);
  const destination=safeInternal(next);
  const signInUrl='/login'+(destination?'?next='+encodeURIComponent(destination):'');
  const primaryHref=['unauthorized','session'].includes(mode)?signInUrl:c.href;
  const check=async()=>{setChecking(true);try{const res=await fetch('/api/health',{cache:'no-store'});setOnline(res.ok?true:navigator.onLine);}catch{setOnline(false)}finally{setChecking(false)}};
  return <main className={styles.page} id="main-content">
    <div className={styles.ambient} aria-hidden="true"/><div className={styles.wrap}>
      <nav className={styles.crumb} aria-label="Breadcrumb"><a href="/"><Home size={14}/> 24xzvibx</a><ArrowRight size={12}/><span>{section||'Recovery centre'}</span></nav>
      <div className={styles.hero}>
        <section className={styles.info} aria-labelledby="recovery-title"><span className={styles.chip}><span className={styles.dot}/>{c.eyebrow}</span>
          <div className={styles.code} aria-label={'Error '+c.code}>{c.code}<span>.</span></div>
          <h1 id="recovery-title">{section?section+': ':''}{c.title}</h1><p className={styles.description}>{c.description}</p>
          <div className={styles.actions}>
            {typeof reset==='function'&&<button type="button" className={styles.primary} onClick={reset}><RefreshCw size={17}/> Try again</button>}
            {mode==='maintenance'?<button type="button" className={styles.primary} onClick={()=>window.location.reload()}><RefreshCw size={17}/> Check again</button>:<a className={typeof reset==='function'?styles.secondary:styles.primary} href={primaryHref}>{['unauthorized','session'].includes(mode)?<KeyRound size={17}/>:<ArrowLeft size={17}/>} {c.action}</a>}
            {mode==='offline'?<button type="button" className={styles.secondary} onClick={check} disabled={checking}><Signal size={17}/> {checking?'Checking…':'Check connection'}</button>:<button type="button" className={styles.tertiary} onClick={()=>window.location.reload()}><RotateCw size={16}/> Reload</button>}
          </div>
          {destination&&mode!=='unauthorized'&&mode!=='session'&&<p className={styles.small}>After resolving the issue, <a href={destination}>return to your previous page <ArrowRight size={12}/></a>.</p>}
          {mode==='offline'&&<p role="status" className={styles.small}>{online===null?'Checking browser connection…':online?'Your browser currently reports an internet connection.':'Your browser currently reports that you are offline.'}</p>}
          {reference&&<div className={styles.reference}><span>SUPPORT REFERENCE</span><code>{reference}</code><small>Include this identifier when contacting support. No private technical details are shown here.</small></div>}
        </section>
        <div className={styles.monitor} aria-hidden="true"><div className={styles.monitorTop}><span className={styles.dots}><i/><i/><i/></span><span>STUDIO / RECOVERY</span><span>×</span></div><div className={styles.orbitA}/><div className={styles.orbitB}/><div className={styles.center}><Icon size={70} strokeWidth={1.3}/></div><span className={styles.signal}><span className={styles.pulse}/>{c.tag}</span><div className={styles.monitorFoot}><span>24XZVIBX_STUDIO</span><span>{c.code}</span></div></div>
      </div>
      <section className={styles.more} aria-label="Other helpful pages"><div><p className={styles.eyebrow}>QUICK NAVIGATION</p><h2>Still plenty to explore.</h2></div><div className={styles.links}>{DESTINATIONS.map(([href,label,Icon])=><a href={href} className={styles.link} key={href}><span className={styles.linkIcon}><Icon size={20}/></span>{label}<ArrowUpRight size={16} className={styles.out}/></a>)}</div></section>
      <footer className={styles.footer}><span>Creative Studio / Safe recovery</span><a href="/support">Need assistance? <ArrowRight size={14}/></a></footer>
    </div></main>;
}
