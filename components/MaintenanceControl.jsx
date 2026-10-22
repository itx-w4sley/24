'use client';
import {useEffect,useState} from 'react';
import {ShieldCheck,Construction,Lock,RefreshCw,Power,AlertTriangle,ExternalLink} from 'lucide-react';

export default function MaintenanceControl(){
  const [details,setDetails]=useState(null);
  const [intent,setIntent]=useState('disable');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [info,setInfo]=useState('');
  const expected=intent==='disable'?'DISABLE':'ENABLE';
  const refresh=async()=>{
    setError('');
    try{
      const r=await fetch('/api/admin/maintenance',{cache:'no-store'});
      const data=await r.json();if(!r.ok)throw Error(data.error||'Could not read maintenance status');
      setDetails(data);
      setIntent(data.deployedMaintenance?'disable':'enable');
    }catch(e){setError(e.message);}
  };
  useEffect(()=>{refresh();},[]);
  const submit=async event=>{
    event.preventDefault();setBusy(true);setError('');setInfo('');
    try{
      const r=await fetch('/api/admin/maintenance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:intent,password,confirm})});
      const data=await r.json();
      if(!r.ok)throw Error(data.error||'Unable to update maintenance mode');
      setPassword('');setConfirm('');
      setInfo(data.message||'New deployment queued.');
    }catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <div className="form-stack" style={{maxWidth:780}}>
    <div className="surface">
      <div className="section-head"><div><div className="eyebrow">STUDIO OPERATIONS / SECURITY</div><h2>Maintenance control</h2><p>Control public availability without losing private administrator access.</p></div><button type="button" className="button button-sm" onClick={refresh}><RefreshCw size={15}/> Refresh</button></div>
      <div className="hstack" style={{flexWrap:'wrap',marginTop:12}}>
        <span className={'pill '+(details?.deployedMaintenance?'pill-danger':'pill-success')}><Construction size={13}/> {details?(details.deployedMaintenance?'Currently in maintenance':'Currently public'):'Loading current deployment…'}</span>
        <span className={'pill '+(details?.controlsConfigured?'pill-success':'pill-accent')}><ShieldCheck size={13}/> {details?.controlsConfigured?'Vercel integration configured':'Vercel integration not configured'}</span>
      </div>
      <p className="hint" style={{marginTop:16}}>The status above is from the current deployment. When you request a change, the Vercel environment variable updates first, then a production rebuild is queued. The public site changes only after the new deployment succeeds.</p>
    </div>
    <form className="surface form-stack" onSubmit={submit}>
      <h3 style={{fontSize:19}}>Change public availability</h3>
      <div className="form-grid">
        <label className="field"><span className="micro-label">Requested action</span><select value={intent} onChange={e=>{setIntent(e.target.value);setConfirm('');}}><option value="disable">Disable maintenance — reopen public website</option><option value="enable">Enable maintenance — return 503 to visitors</option></select></label>
        <label className="field"><span className="micro-label">Confirm action — type {expected}</span><input autoComplete="off" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={expected}/></label>
        <label className="field span-all"><span className="micro-label"><Lock size={14}/> Confirm your admin password</span><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Re-enter your studio password"/></label>
      </div>
      <div className="support-note"><AlertTriangle size={17}/><p>This affects the entire public studio. Use the same approved public IP for this panel. Keep a backup path through your Vercel dashboard in case your home IP changes or a deployment fails.</p></div>
      {error&&<div className="form-error" role="alert">{error}</div>}
      {info&&<div className="form-success" role="status">{info}</div>}
      <button className="button button-primary" disabled={busy||confirm!==expected||!password||!details?.controlsConfigured} type="submit"><Power size={16}/>{busy?'Updating Vercel…':intent==='enable'?'Enable maintenance & deploy':'Disable maintenance & deploy'}</button>
      <a href="https://vercel.com/dashboard" className="text-link" target="_blank" rel="noopener noreferrer">Check deployment status in Vercel <ExternalLink size={14}/></a>
    </form>
  </div>;
}
